// External API Service with circuit breaker and retry logic
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}

export class ExternalAPIService {
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  };

  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 30000, // 30 seconds
    monitoringPeriodMs: 60000 // 1 minute
  });

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  async makeRequest<T>(
    url: string, 
    config: AxiosRequestConfig = {},
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<AxiosResponse<T>> {
    const finalRetryConfig = { ...this.retryConfig, ...customRetryConfig };
    
    return this.circuitBreaker.execute(async () => {
      let lastError: Error;

      for (let attempt = 0; attempt <= finalRetryConfig.maxRetries; attempt++) {
        try {
          const response = await axios({
            url,
            timeout: 60000,
            ...config
          });
          
          if (attempt > 0) {
            console.error(`[API] Request succeeded on attempt ${attempt + 1}`);
          }
          
          return response;
        } catch (error: any) {
          lastError = error;
          const isLastAttempt = attempt === finalRetryConfig.maxRetries;
          const shouldRetry = this.shouldRetry(error);

          if (isLastAttempt || !shouldRetry) {
            break;
          }

          const delay = this.calculateDelay(attempt);
          console.error(`[API] Request failed (attempt ${attempt + 1}/${finalRetryConfig.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
          await this.sleep(delay);
        }
      }

      throw new Error(`API request failed after ${finalRetryConfig.maxRetries + 1} attempts: ${lastError!.message}`);
    });
  }

  private shouldRetry(error: any): boolean {
    // Don't retry on client errors (4xx), only on server errors (5xx) and network issues
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }
    
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNRESET' ||
      (error.response?.status >= 500)
    );
  }

  async callOllama(model: string, prompt: string, options: any = {}): Promise<string> {
    try {
      const response = await this.makeRequest<{response: string}>(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`, {
        method: 'POST',
        data: {
          model,
          prompt,
          stream: false,
          ...options
        }
      }, {
        maxRetries: 2, // Lower retry count for LLM calls
        baseDelay: 2000 // Longer initial delay for LLM
      });

      return response.data.response || '';
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      const circuitState = this.circuitBreaker.getState();
      
      console.error(`[OLLAMA] API call failed (Circuit: ${circuitState}):`, errorMessage);
      
      if (circuitState === 'OPEN') {
        throw new Error('Ollama service temporarily unavailable - circuit breaker activated');
      }
      
      throw new Error(`Ollama API error: ${errorMessage}`);
    }
  }

  isHealthy(): boolean {
    return this.circuitBreaker.getState() !== 'OPEN';
  }

  getCircuitState(): string {
    return this.circuitBreaker.getState();
  }
}

// Singleton instance
export const apiService = new ExternalAPIService();