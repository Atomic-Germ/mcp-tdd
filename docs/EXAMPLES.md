# TDD MCP Server - Examples

Comprehensive examples demonstrating test-driven development workflows.

## Table of Contents

- [Basic TDD Workflow](#basic-tdd-workflow)
- [Feature Development Examples](#feature-development-examples)
- [Testing Patterns](#testing-patterns)
- [Refactoring Examples](#refactoring-examples)
- [Advanced Workflows](#advanced-workflows)
- [Integration with Other MCP Servers](#integration-with-other-mcp-servers)
- [Real-World Case Studies](#real-world-case-studies)

## Basic TDD Workflow

### Complete RED-GREEN-REFACTOR Cycle

Here's a complete example of implementing a simple calculator using TDD:

#### Phase 1: Initialize Cycle (RED)

```typescript
// Initialize the TDD cycle
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "calculator-add-function",
    description: "Implement basic addition functionality for calculator",
    language: "typescript",
    testFramework: "vitest",
    estimatedComplexity: "low"
  }
}
```

#### Phase 2: Write First Test (RED)

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/calculator.test.ts",
    testName: "should add two positive numbers",
    expectedToFail: true,
    testCode: `
import { describe, it, expect } from 'vitest';
import { Calculator } from '../src/calculator';

describe('Calculator', () => {
  it('should add two positive numbers', () => {
    const calculator = new Calculator();
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
});
    `
  }
}
```

#### Phase 3: Run Test to Confirm RED

```typescript
{
  tool: "tdd_run_tests",
  arguments: {
    testPattern: "./test/calculator.test.ts",
    expectation: "fail",
    verbose: true
  }
}
```

**Expected Output:**

```
{
  status: "success",
  data: {
    phase: "RED",
    expectationMet: true,
    results: {
      failed: 1,
      passed: 0
    },
    failures: [
      {
        testName: "should add two positive numbers",
        error: "Cannot find module '../src/calculator'",
        nextAction: "implement"
      }
    ]
  }
}
```

#### Phase 4: Minimal Implementation (GREEN)

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/calculator.ts",
    description: "Minimal implementation to make test pass",
    testDriven: true,
    code: `
export class Calculator {
  add(a: number, b: number): number {
    return 5; // Hardcoded to make test pass
  }
}
    `
  }
}
```

#### Phase 5: Run Test to Confirm GREEN

```typescript
{
  tool: "tdd_run_tests",
  arguments: {
    testPattern: "./test/calculator.test.ts",
    expectation: "pass",
    coverage: true
  }
}
```

#### Phase 6: Add More Tests (RED)

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/calculator.test.ts",
    testName: "should add different positive numbers",
    testCode: `
  it('should add different positive numbers', () => {
    const calculator = new Calculator();
    expect(calculator.add(1, 4)).toBe(5);
    expect(calculator.add(10, 15)).toBe(25);
    expect(calculator.add(0, 0)).toBe(0);
  });
    `
  }
}
```

#### Phase 7: Proper Implementation (GREEN)

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/calculator.ts",
    code: `
export class Calculator {
  add(a: number, b: number): number {
    return a + b; // Proper implementation
  }
}
    `
  }
}
```

#### Phase 8: Refactor for Better Design (REFACTOR)

```typescript
{
  tool: "tdd_refactor",
  arguments: {
    file: "./src/calculator.ts",
    rationale: "Add input validation and better error handling",
    code: `
export class Calculator {
  add(a: number, b: number): number {
    this.validateNumber(a, 'First argument');
    this.validateNumber(b, 'Second argument');

    return a + b;
  }

  private validateNumber(value: number, paramName: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${paramName} must be a valid number`);
    }
  }
}
    `
  }
}
```

#### Phase 9: Complete Cycle

```typescript
{
  tool: "tdd_complete_cycle",
  arguments: {
    notes: "Basic addition functionality implemented with validation",
    learnings: [
      "Started with hardcoded return to make test pass",
      "Gradually added more tests to drive better implementation",
      "Refactored to add validation without breaking tests"
    ]
  }
}
```

## Feature Development Examples

### User Authentication Feature

Complete TDD implementation of JWT-based authentication:

#### Cycle Initialization

```typescript
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "jwt-authentication",
    description: "Implement JWT-based user authentication with token validation",
    language: "typescript",
    testFramework: "vitest"
  }
}
```

#### Test 1: Basic Login

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/auth/authService.test.ts",
    testName: "should authenticate user with valid credentials",
    testCode: `
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/auth/authService';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockTokenService: any;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      validatePassword: vi.fn()
    };

    mockTokenService = {
      generateToken: vi.fn().mockReturnValue('mock.jwt.token')
    };

    authService = new AuthService(mockUserRepo, mockTokenService);
  });

  it('should authenticate user with valid credentials', async () => {
    const mockUser = { id: '123', email: 'user@example.com' };
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockUserRepo.validatePassword.mockResolvedValue(true);

    const result = await authService.login('user@example.com', 'validpassword');

    expect(result).toEqual({
      success: true,
      token: 'mock.jwt.token',
      user: { id: '123', email: 'user@example.com' }
    });
  });
});
    `
  }
}
```

#### Implementation 1: Basic AuthService

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/auth/authService.ts",
    code: `
export interface User {
  id: string;
  email: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  validatePassword(user: User, password: string): Promise<boolean>;
}

export interface TokenService {
  generateToken(user: User): string;
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private tokenService: TokenService
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isValidPassword = await this.userRepo.validatePassword(user, password);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }

    const token = this.tokenService.generateToken(user);

    return {
      success: true,
      token,
      user
    };
  }
}
    `
  }
}
```

#### Test 2: Invalid Credentials

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/auth/authService.test.ts",
    testName: "should reject invalid credentials",
    testCode: `
  it('should reject invalid credentials', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const result = await authService.login('invalid@example.com', 'wrongpassword');

    expect(result).toEqual({
      success: false,
      error: 'User not found'
    });
  });

  it('should reject wrong password', async () => {
    const mockUser = { id: '123', email: 'user@example.com' };
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockUserRepo.validatePassword.mockResolvedValue(false);

    const result = await authService.login('user@example.com', 'wrongpassword');

    expect(result).toEqual({
      success: false,
      error: 'Invalid password'
    });
  });
    `
  }
}
```

### API Endpoint Testing

TDD for Express.js API endpoints:

#### Test for Registration Endpoint

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/api/userRoutes.test.ts",
    testName: "POST /users should create new user",
    testCode: `
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

describe('User Routes', () => {
  let app: any;
  let mockUserService: any;

  beforeEach(() => {
    mockUserService = {
      createUser: vi.fn(),
      findByEmail: vi.fn()
    };

    app = createApp({ userService: mockUserService });
  });

  it('POST /users should create new user', async () => {
    const newUser = {
      email: 'test@example.com',
      password: 'securepassword',
      name: 'Test User'
    };

    const createdUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    };

    mockUserService.createUser.mockResolvedValue(createdUser);

    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toEqual({
      success: true,
      user: createdUser
    });

    expect(mockUserService.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'securepassword',
      name: 'Test User'
    });
  });
});
    `
  }
}
```

#### Implementation: Express Route

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/api/userRoutes.ts",
    code: `
import { Router, Request, Response } from 'express';

export interface UserService {
  createUser(userData: any): Promise<any>;
  findByEmail(email: string): Promise<any>;
}

export function createUserRoutes(userService: UserService) {
  const router = Router();

  router.post('/users', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      const user = await userService.createUser({
        email,
        password,
        name
      });

      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
    `
  }
}
```

## Testing Patterns

### Mocking External Dependencies

#### Database Mocking Pattern

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/services/userService.test.ts",
    testName: "should save user to database",
    testCode: `
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../src/services/userService';

// Mock the database module
vi.mock('../../src/database', () => ({
  Database: vi.fn(() => ({
    users: {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn()
    }
  }))
}));

describe('UserService', () => {
  let userService: UserService;
  let mockDb: any;

  beforeEach(() => {
    const { Database } = require('../../src/database');
    mockDb = new Database();
    userService = new UserService(mockDb);
  });

  it('should save user to database', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword'
    };

    const savedUser = { id: '123', ...userData };
    mockDb.users.create.mockResolvedValue(savedUser);

    const result = await userService.createUser(userData);

    expect(mockDb.users.create).toHaveBeenCalledWith(userData);
    expect(result).toEqual(savedUser);
  });
});
    `
  }
}
```

#### HTTP Client Mocking

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/services/paymentService.test.ts",
    testName: "should process payment through external API",
    testCode: `
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '../../src/services/paymentService';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    vi.clearAllMocks();
  });

  it('should process payment through external API', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      cardNumber: '4111111111111111'
    };

    const apiResponse = {
      data: {
        id: 'payment_123',
        status: 'succeeded',
        amount: 100
      }
    };

    mockedAxios.post.mockResolvedValue(apiResponse);

    const result = await paymentService.processPayment(paymentData);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/payments',
      paymentData,
      expect.any(Object)
    );

    expect(result).toEqual({
      success: true,
      paymentId: 'payment_123',
      status: 'succeeded'
    });
  });
});
    `
  }
}
```

### Testing Async Operations

#### Promise-Based Testing

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/services/emailService.test.ts",
    testName: "should send email asynchronously",
    testCode: `
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '../../src/services/emailService';

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    mockTransporter = {
      sendMail: vi.fn()
    };

    emailService = new EmailService(mockTransporter);
  });

  it('should send email asynchronously', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      body: 'This is a test email'
    };

    const sendResult = { messageId: 'email_123' };
    mockTransporter.sendMail.mockResolvedValue(sendResult);

    const result = await emailService.sendEmail(emailData);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email'
    });

    expect(result).toEqual({
      success: true,
      messageId: 'email_123'
    });
  });

  it('should handle email sending failure', async () => {
    const emailData = {
      to: 'invalid-email',
      subject: 'Test',
      body: 'Test'
    };

    mockTransporter.sendMail.mockRejectedValue(new Error('Invalid email'));

    const result = await emailService.sendEmail(emailData);

    expect(result).toEqual({
      success: false,
      error: 'Invalid email'
    });
  });
});
    `
  }
}
```

### Testing React Components

#### Component Testing with Testing Library

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/components/UserProfile.test.tsx",
    testName: "should display user information",
    testCode: `
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '../../src/components/UserProfile';

// Mock the user service
vi.mock('../../src/services/userService');

describe('UserProfile Component', () => {
  const mockUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'avatar-url'
  };

  it('should display user information', () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', 'avatar-url');
  });

  it('should handle edit button click', async () => {
    const mockOnEdit = vi.fn();

    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it('should show loading state', () => {
    render(<UserProfile user={null} isLoading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
    `
  }
}
```

## Refactoring Examples

### Code Smell Refactoring

#### Long Method Refactoring

**Before (Long Method):**

```typescript
{
  tool: "tdd_refactor",
  arguments: {
    file: "./src/services/orderService.ts",
    rationale: "Break down long processOrder method into smaller, focused methods",
    code: `
export class OrderService {
  async processOrder(orderData: any): Promise<any> {
    // This method is too long and has multiple responsibilities

    // Validation
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must have items');
    }

    if (!orderData.customerId) {
      throw new Error('Customer ID is required');
    }

    // Price calculation
    let totalAmount = 0;
    for (const item of orderData.items) {
      const product = await this.productService.getProduct(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      totalAmount += product.price * item.quantity;
    }

    // Apply discounts
    const customer = await this.customerService.getCustomer(orderData.customerId);
    if (customer.loyaltyLevel === 'GOLD') {
      totalAmount *= 0.9; // 10% discount
    } else if (customer.loyaltyLevel === 'SILVER') {
      totalAmount *= 0.95; // 5% discount
    }

    // Tax calculation
    const taxRate = await this.taxService.getTaxRate(customer.location);
    const taxAmount = totalAmount * taxRate;
    const finalAmount = totalAmount + taxAmount;

    // Payment processing
    const paymentResult = await this.paymentService.processPayment({
      amount: finalAmount,
      customerId: orderData.customerId,
      paymentMethod: orderData.paymentMethod
    });

    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }

    // Create order
    const order = await this.orderRepository.create({
      customerId: orderData.customerId,
      items: orderData.items,
      totalAmount: finalAmount,
      status: 'COMPLETED',
      paymentId: paymentResult.paymentId
    });

    // Send confirmation
    await this.notificationService.sendOrderConfirmation({
      orderId: order.id,
      customerEmail: customer.email
    });

    return order;
  }
}
    `
  }
}
```

**After (Refactored):**

```typescript
{
  tool: "tdd_refactor",
  arguments: {
    file: "./src/services/orderService.ts",
    rationale: "Split into focused methods with single responsibilities",
    code: `
export class OrderService {
  async processOrder(orderData: any): Promise<any> {
    this.validateOrderData(orderData);

    const customer = await this.customerService.getCustomer(orderData.customerId);
    const totalAmount = await this.calculateTotalAmount(orderData.items);
    const discountedAmount = this.applyCustomerDiscount(totalAmount, customer);
    const finalAmount = await this.calculateFinalAmount(discountedAmount, customer.location);

    const paymentResult = await this.processPayment(finalAmount, orderData.customerId, orderData.paymentMethod);

    const order = await this.createOrder({
      ...orderData,
      totalAmount: finalAmount,
      paymentId: paymentResult.paymentId
    });

    await this.sendOrderConfirmation(order.id, customer.email);

    return order;
  }

  private validateOrderData(orderData: any): void {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must have items');
    }

    if (!orderData.customerId) {
      throw new Error('Customer ID is required');
    }
  }

  private async calculateTotalAmount(items: any[]): Promise<number> {
    let totalAmount = 0;

    for (const item of items) {
      const product = await this.productService.getProduct(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      totalAmount += product.price * item.quantity;
    }

    return totalAmount;
  }

  private applyCustomerDiscount(amount: number, customer: any): number {
    switch (customer.loyaltyLevel) {
      case 'GOLD':
        return amount * 0.9; // 10% discount
      case 'SILVER':
        return amount * 0.95; // 5% discount
      default:
        return amount;
    }
  }

  private async calculateFinalAmount(amount: number, location: string): Promise<number> {
    const taxRate = await this.taxService.getTaxRate(location);
    const taxAmount = amount * taxRate;
    return amount + taxAmount;
  }

  private async processPayment(amount: number, customerId: string, paymentMethod: any): Promise<any> {
    const paymentResult = await this.paymentService.processPayment({
      amount,
      customerId,
      paymentMethod
    });

    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }

    return paymentResult;
  }

  private async createOrder(orderData: any): Promise<any> {
    return await this.orderRepository.create({
      customerId: orderData.customerId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'COMPLETED',
      paymentId: orderData.paymentId
    });
  }

  private async sendOrderConfirmation(orderId: string, customerEmail: string): Promise<void> {
    await this.notificationService.sendOrderConfirmation({
      orderId,
      customerEmail
    });
  }
}
    `
  }
}
```

### Dependency Injection Refactoring

**Before (Hard Dependencies):**

```typescript
// Hard to test due to direct instantiation
export class UserService {
  private emailService = new EmailService();
  private database = new Database();

  async createUser(userData: any): Promise<any> {
    const user = await this.database.users.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}
```

**After (Dependency Injection):**

```typescript
{
  tool: "tdd_refactor",
  arguments: {
    file: "./src/services/userService.ts",
    rationale: "Implement dependency injection for better testability",
    code: `
export interface EmailService {
  sendWelcomeEmail(email: string): Promise<void>;
}

export interface Database {
  users: {
    create(userData: any): Promise<any>;
  };
}

export class UserService {
  constructor(
    private emailService: EmailService,
    private database: Database
  ) {}

  async createUser(userData: any): Promise<any> {
    const user = await this.database.users.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}
    `
  }
}
```

## Advanced Workflows

### Microservices TDD

Testing communication between services:

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/integration/serviceIntegration.test.ts",
    testName: "should communicate between user and notification services",
    testCode: `
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestServer } from '../utils/testServer';

describe('Service Integration', () => {
  let userService: TestServer;
  let notificationService: TestServer;

  beforeEach(async () => {
    userService = new TestServer('user-service', 3001);
    notificationService = new TestServer('notification-service', 3002);

    await userService.start();
    await notificationService.start();
  });

  afterEach(async () => {
    await userService.stop();
    await notificationService.stop();
  });

  it('should send notification when user is created', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };

    // Create user
    const createResponse = await userService.request
      .post('/users')
      .send(userData)
      .expect(201);

    const userId = createResponse.body.user.id;

    // Verify notification was sent
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async notification

    const notificationResponse = await notificationService.request
      .get(`/notifications?userId=${userId}`)
      .expect(200);

    expect(notificationResponse.body.notifications).toHaveLength(1);
    expect(notificationResponse.body.notifications[0]).toMatchObject({
      type: 'WELCOME',
      userId: userId,
      email: 'test@example.com'
    });
  });
});
    `
  }
}
```

### Event-Driven TDD

Testing event handling:

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/events/orderEvents.test.ts",
    testName: "should handle order completed event",
    testCode: `
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';
import { OrderEventHandler } from '../../src/events/orderEventHandler';

describe('Order Event Handler', () => {
  let eventEmitter: EventEmitter;
  let eventHandler: OrderEventHandler;
  let mockInventoryService: any;
  let mockNotificationService: any;

  beforeEach(() => {
    eventEmitter = new EventEmitter();

    mockInventoryService = {
      updateStock: vi.fn().mockResolvedValue(true)
    };

    mockNotificationService = {
      sendOrderNotification: vi.fn().mockResolvedValue(true)
    };

    eventHandler = new OrderEventHandler(
      eventEmitter,
      mockInventoryService,
      mockNotificationService
    );
  });

  it('should handle order completed event', async () => {
    const orderData = {
      orderId: 'order_123',
      customerId: 'customer_456',
      items: [
        { productId: 'product_1', quantity: 2 },
        { productId: 'product_2', quantity: 1 }
      ]
    };

    // Emit order completed event
    eventEmitter.emit('order.completed', orderData);

    // Wait for async handlers
    await new Promise(resolve => setImmediate(resolve));

    // Verify inventory was updated
    expect(mockInventoryService.updateStock).toHaveBeenCalledTimes(2);
    expect(mockInventoryService.updateStock).toHaveBeenCalledWith('product_1', -2);
    expect(mockInventoryService.updateStock).toHaveBeenCalledWith('product_2', -1);

    // Verify notification was sent
    expect(mockNotificationService.sendOrderNotification).toHaveBeenCalledWith({
      customerId: 'customer_456',
      orderId: 'order_123',
      type: 'ORDER_COMPLETED'
    });
  });
});
    `
  }
}
```

### Performance Testing with TDD

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/performance/searchPerformance.test.ts",
    testName: "should search products efficiently",
    testCode: `
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductSearchService } from '../../src/services/productSearchService';
import { generateTestProducts } from '../utils/testDataGenerator';

describe('Product Search Performance', () => {
  let searchService: ProductSearchService;
  let products: any[];

  beforeEach(async () => {
    products = generateTestProducts(10000); // Generate 10k products
    searchService = new ProductSearchService();
    await searchService.indexProducts(products);
  });

  it('should search products efficiently', async () => {
    const startTime = performance.now();

    const results = await searchService.search({
      query: 'laptop',
      category: 'electronics',
      priceRange: { min: 500, max: 2000 }
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(results.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
    expect(results.every(r => r.name.toLowerCase().includes('laptop'))).toBe(true);
  });

  it('should handle concurrent searches', async () => {
    const searches = Array(100).fill(null).map(() =>
      searchService.search({ query: 'phone' })
    );

    const startTime = performance.now();
    const results = await Promise.all(searches);
    const endTime = performance.now();

    const duration = endTime - startTime;

    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(1000); // 100 concurrent searches in under 1s
    expect(results.every(r => Array.isArray(r))).toBe(true);
  });
});
    `
  }
}
```

## Integration with Other MCP Servers

### TDD + Optimist Integration

Use optimization insights to drive TDD improvements:

```typescript
// Step 1: Complete feature with TDD
await runTool('tdd_complete_cycle', {
  notes: 'User authentication feature complete',
});

// Step 2: Analyze for optimization opportunities
const optimizationResults = await runTool('analyze_performance', {
  path: './src/auth',
  threshold: 'medium',
});

// Step 3: Start new TDD cycle for optimization
await runTool('tdd_init_cycle', {
  feature: 'auth-performance-optimization',
  description: `Optimize authentication based on analysis: ${optimizationResults.suggestions.map(s => s.description).join(', ')}`,
});

// Step 4: Write performance test
await runTool('tdd_write_test', {
  testFile: './test/performance/authPerformance.test.ts',
  testName: 'should authenticate users quickly under load',
  testCode: `
    it('should authenticate users quickly under load', async () => {
      const authRequests = Array(1000).fill(null).map(() => 
        authService.authenticate(validCredentials)
      );
      
      const startTime = performance.now();
      await Promise.all(authRequests);
      const endTime = performance.now();
      
      const avgTime = (endTime - startTime) / 1000;
      expect(avgTime).toBeLessThan(1); // Under 1ms per auth on average
    });
  `,
});
```

### TDD + Consult Integration

Get AI guidance during TDD:

```typescript
// Step 1: Get stuck during implementation
const testResults = await runTool('tdd_run_tests', {
  expectation: 'fail',
});

// Step 2: Ask AI for guidance
const guidance = await runTool('consult_ollama', {
  prompt: `
    I'm implementing ${currentFeature} using TDD and my test is failing:
    
    Test: ${testResults.failures[0].testName}
    Error: ${testResults.failures[0].error}
    
    What's the minimal implementation to make this test pass?
  `,
  model: 'qwen2.5-coder:7b',
  context: {
    code: currentTestCode,
    language: 'typescript',
  },
});

// Step 3: Implement based on AI suggestion
await runTool('tdd_implement', {
  file: './src/feature.ts',
  code: guidance.suggestion,
  description: 'Implementation based on AI guidance',
});

// Step 4: Continue TDD cycle
await runTool('tdd_run_tests', {
  expectation: 'pass',
});
```

## Real-World Case Studies

### Case Study 1: E-commerce Cart System

Complete TDD implementation of a shopping cart:

#### Initial Planning

```typescript
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "shopping-cart-system",
    description: "Implement shopping cart with add/remove items, quantity updates, and price calculations",
    estimatedComplexity: "high"
  }
}
```

#### Test 1: Add Item to Cart

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/cart/shoppingCart.test.ts",
    testName: "should add item to empty cart",
    testCode: `
import { describe, it, expect } from 'vitest';
import { ShoppingCart } from '../../src/cart/shoppingCart';

describe('ShoppingCart', () => {
  it('should add item to empty cart', () => {
    const cart = new ShoppingCart();

    cart.addItem({
      productId: 'product-1',
      name: 'Laptop',
      price: 999.99,
      quantity: 1
    });

    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0]).toEqual({
      productId: 'product-1',
      name: 'Laptop',
      price: 999.99,
      quantity: 1
    });
    expect(cart.getTotalPrice()).toBe(999.99);
  });
});
    `
  }
}
```

#### Implementation: Basic Cart

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/cart/shoppingCart.ts",
    code: `
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class ShoppingCart {
  private items: CartItem[] = [];

  addItem(item: CartItem): void {
    this.items.push(item);
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
    `
  }
}
```

#### Test 2: Update Quantity

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/cart/shoppingCart.test.ts",
    testName: "should update quantity of existing item",
    testCode: `
  it('should update quantity of existing item', () => {
    const cart = new ShoppingCart();

    cart.addItem({
      productId: 'product-1',
      name: 'Laptop',
      price: 999.99,
      quantity: 1
    });

    cart.addItem({
      productId: 'product-1',
      name: 'Laptop',
      price: 999.99,
      quantity: 2
    });

    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0].quantity).toBe(3);
    expect(cart.getTotalPrice()).toBe(2999.97);
  });
    `
  }
}
```

#### Refactored Implementation

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/cart/shoppingCart.ts",
    code: `
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class ShoppingCart {
  private items: Map<string, CartItem> = new Map();

  addItem(item: CartItem): void {
    const existingItem = this.items.get(item.productId);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.set(item.productId, { ...item });
    }
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  getTotalPrice(): number {
    return Array.from(this.items.values())
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
    `
  }
}
```

### Case Study 2: Real-time Chat System

TDD implementation of WebSocket-based chat:

#### WebSocket Connection Test

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/chat/chatService.test.ts",
    testName: "should handle user connection",
    testCode: `
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService } from '../../src/chat/chatService';
import { MockWebSocket } from '../mocks/mockWebSocket';

describe('ChatService', () => {
  let chatService: ChatService;
  let mockSocket: MockWebSocket;

  beforeEach(() => {
    chatService = new ChatService();
    mockSocket = new MockWebSocket();
  });

  it('should handle user connection', () => {
    const userId = 'user-123';

    chatService.handleConnection(mockSocket, userId);

    expect(chatService.getConnectedUsers()).toContain(userId);
    expect(mockSocket.send).toHaveBeenCalledWith(JSON.stringify({
      type: 'CONNECTION_CONFIRMED',
      userId: userId
    }));
  });
});
    `
  }
}
```

#### Message Broadcasting Test

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/chat/chatService.test.ts",
    testName: "should broadcast message to all users",
    testCode: `
  it('should broadcast message to all users', () => {
    const user1Socket = new MockWebSocket();
    const user2Socket = new MockWebSocket();

    chatService.handleConnection(user1Socket, 'user-1');
    chatService.handleConnection(user2Socket, 'user-2');

    const message = {
      type: 'MESSAGE',
      content: 'Hello everyone!',
      senderId: 'user-1',
      timestamp: new Date().toISOString()
    };

    chatService.handleMessage(user1Socket, message);

    expect(user1Socket.send).toHaveBeenCalledWith(JSON.stringify(message));
    expect(user2Socket.send).toHaveBeenCalledWith(JSON.stringify(message));
  });
    `
  }
}
```

#### Chat Service Implementation

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/chat/chatService.ts",
    code: `
export interface ChatMessage {
  type: string;
  content?: string;
  senderId?: string;
  timestamp?: string;
}

export interface WebSocket {
  send(data: string): void;
  close(): void;
}

export class ChatService {
  private connections: Map<string, WebSocket> = new Map();

  handleConnection(socket: WebSocket, userId: string): void {
    this.connections.set(userId, socket);

    socket.send(JSON.stringify({
      type: 'CONNECTION_CONFIRMED',
      userId: userId
    }));
  }

  handleMessage(senderSocket: WebSocket, message: ChatMessage): void {
    const messageStr = JSON.stringify(message);

    // Broadcast to all connected users
    for (const socket of this.connections.values()) {
      socket.send(messageStr);
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connections.keys());
  }

  handleDisconnection(userId: string): void {
    this.connections.delete(userId);
  }
}
    `
  }
}
```

These examples demonstrate how TDD MCP Server enables systematic, test-driven development with proper red-green-refactor cycles, ensuring code quality and maintainability throughout the development process.
