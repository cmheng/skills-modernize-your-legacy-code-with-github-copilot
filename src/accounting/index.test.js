import test from 'node:test';
import assert from 'node:assert';
import { DataManager, AccountOperations } from './index.js';

/**
 * Test Suite for Student Account Management System
 * Based on TESTPLAN.md test cases
 */

// ============================================================================
// TEST SETUP - Helper Functions
// ============================================================================

function captureOutput(fn) {
  const originalLog = console.log;
  const output = [];
  console.log = (...args) => {
    output.push(args.join(' '));
  };
  
  fn();
  
  console.log = originalLog;
  return output;
}

function createMockPrompt(inputs) {
  let inputIndex = 0;
  return (message) => {
    if (inputIndex >= inputs.length) {
      throw new Error('Not enough mock inputs provided');
    }
    return inputs[inputIndex++];
  };
}

// ============================================================================
// DATA MANAGER TESTS
// ============================================================================

test('DataManager - TC001: Initial balance is 1000.00', () => {
  const dm = new DataManager();
  assert.strictEqual(dm.read(), 1000.00);
});

test('DataManager - Read/Write operations', () => {
  const dm = new DataManager();
  dm.write(1500.00);
  assert.strictEqual(dm.read(), 1500.00);
});

test('DataManager - Decimal precision maintained', () => {
  const dm = new DataManager();
  dm.write(1234.56);
  assert.strictEqual(dm.read(), 1234.56);
});

test('DataManager - Formatted balance with leading zeros', () => {
  const dm = new DataManager();
  const formatted = dm.getFormattedBalance();
  assert.strictEqual(formatted, '001000.00');
});

test('DataManager - Formatted balance for small amounts', () => {
  const dm = new DataManager();
  dm.write(99.99);
  const formatted = dm.getFormattedBalance();
  assert.strictEqual(formatted, '000099.99');
});

test('DataManager - Reject negative balance', () => {
  const dm = new DataManager();
  assert.throws(() => {
    dm.write(-100);
  }, /Invalid balance value/);
});

test('DataManager - Reject balance exceeding max (999999.99)', () => {
  const dm = new DataManager();
  assert.throws(() => {
    dm.write(1000000);
  }, /Invalid balance value/);
});

// ============================================================================
// ACCOUNT OPERATIONS - VIEW BALANCE TESTS
// ============================================================================

test('TC001: View initial account balance', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const output = captureOutput(() => ops.viewBalance());
  
  assert.strictEqual(output[0], 'Current balance: 001000.00');
});

test('TC019: View balance after multiple operations', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  // Simulate: credit 200, debit 100, credit 300, debit 150
  const mockPrompt1 = createMockPrompt(['200']);
  const mockPrompt2 = createMockPrompt(['100']);
  const mockPrompt3 = createMockPrompt(['300']);
  const mockPrompt4 = createMockPrompt(['150']);
  
  ops.creditAccount(mockPrompt1);   // 1000 + 200 = 1200
  ops.debitAccount(mockPrompt2);    // 1200 - 100 = 1100
  ops.creditAccount(mockPrompt3);   // 1100 + 300 = 1400
  ops.debitAccount(mockPrompt4);    // 1400 - 150 = 1250
  
  const output = captureOutput(() => ops.viewBalance());
  assert.strictEqual(output[0], 'Current balance: 001250.00');
});

// ============================================================================
// ACCOUNT OPERATIONS - CREDIT TESTS
// ============================================================================

test('TC002: Credit account with valid amount', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['500']);
  
  const output = captureOutput(() => ops.creditAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Amount credited. New balance: 001500.00');
  assert.strictEqual(dm.read(), 1500.00);
});

test('TC003: Credit account with large amount', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['899999.99']);
  
  const output = captureOutput(() => ops.creditAccount(mockPrompt));
  
  assert.strictEqual(dm.read(), 900999.99);
});

test('TC004: Credit account with zero amount', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['0']);
  
  ops.creditAccount(mockPrompt);
  
  assert.strictEqual(dm.read(), 1000.00);
});

test('TC005: Credit account multiple times sequentially', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  const mockPrompt1 = createMockPrompt(['200']);
  const mockPrompt2 = createMockPrompt(['300']);
  const mockPrompt3 = createMockPrompt(['150']);
  
  ops.creditAccount(mockPrompt1);   // 1200
  assert.strictEqual(dm.read(), 1200.00);
  
  ops.creditAccount(mockPrompt2);   // 1500
  assert.strictEqual(dm.read(), 1500.00);
  
  ops.creditAccount(mockPrompt3);   // 1650
  assert.strictEqual(dm.read(), 1650.00);
});

test('TC022: Decimal precision - credit with cents', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['150.50']);
  
  const output = captureOutput(() => ops.creditAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Amount credited. New balance: 001150.50');
  assert.strictEqual(dm.read(), 1150.50);
});

// ============================================================================
// ACCOUNT OPERATIONS - DEBIT TESTS
// ============================================================================

test('TC006: Debit account with valid amount', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['300']);
  
  const output = captureOutput(() => ops.debitAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Amount debited. New balance: 000700.00');
  assert.strictEqual(dm.read(), 700.00);
});

test('TC007: Debit account with amount equal to balance', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['1000']);
  
  const output = captureOutput(() => ops.debitAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Amount debited. New balance: 000000.00');
  assert.strictEqual(dm.read(), 0.00);
});

test('TC008: Debit account with amount exceeding balance (Insufficient funds)', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['1500']);
  
  const output = captureOutput(() => ops.debitAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Insufficient funds for this debit.');
  assert.strictEqual(dm.read(), 1000.00); // Balance unchanged
});

test('TC009: Debit account with zero amount', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['0']);
  
  ops.debitAccount(mockPrompt);
  
  assert.strictEqual(dm.read(), 1000.00);
});

test('TC010: Debit after credit operation', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  const mockPrompt1 = createMockPrompt(['500']);
  const mockPrompt2 = createMockPrompt(['200']);
  
  ops.creditAccount(mockPrompt1);   // 1500
  ops.debitAccount(mockPrompt2);    // 1300
  
  assert.strictEqual(dm.read(), 1300.00);
});

test('TC011: Credit after debit operation', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  const mockPrompt1 = createMockPrompt(['400']);
  const mockPrompt2 = createMockPrompt(['300']);
  
  ops.debitAccount(mockPrompt1);    // 600
  ops.creditAccount(mockPrompt2);   // 900
  
  assert.strictEqual(dm.read(), 900.00);
});

test('TC012: Multiple debits with sufficient funds', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  const mockPrompt1 = createMockPrompt(['300']);
  const mockPrompt2 = createMockPrompt(['200']);
  const mockPrompt3 = createMockPrompt(['100']);
  
  ops.debitAccount(mockPrompt1);   // 700
  assert.strictEqual(dm.read(), 700.00);
  
  ops.debitAccount(mockPrompt2);   // 500
  assert.strictEqual(dm.read(), 500.00);
  
  ops.debitAccount(mockPrompt3);   // 400
  assert.strictEqual(dm.read(), 400.00);
});

test('TC013: Multiple debits exceeding balance on third attempt', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  const mockPrompt1 = createMockPrompt(['300']);
  const mockPrompt2 = createMockPrompt(['200']);
  const mockPrompt3 = createMockPrompt(['600']);
  
  ops.debitAccount(mockPrompt1);   // 700 - success
  ops.debitAccount(mockPrompt2);   // 500 - success
  const output = captureOutput(() => ops.debitAccount(mockPrompt3)); // 600 - fail
  
  assert.strictEqual(output[0], 'Insufficient funds for this debit.');
  assert.strictEqual(dm.read(), 500.00); // Balance remains unchanged
});

test('TC023: Decimal precision - debit with cents', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['123.45']);
  
  const output = captureOutput(() => ops.debitAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Amount debited. New balance: 000876.55');
  assert.strictEqual(dm.read(), 876.55);
});

test('TC020: Debit edge case - exact balance remaining', () => {
  const dm = new DataManager();
  dm.write(500.00);
  const ops = new AccountOperations(dm);
  
  const mockPrompt1 = createMockPrompt(['500']);
  const mockPrompt2 = createMockPrompt(['100']);
  
  ops.debitAccount(mockPrompt1);   // Should succeed, balance = 0
  assert.strictEqual(dm.read(), 0.00);
  
  const output = captureOutput(() => ops.debitAccount(mockPrompt2)); // Should fail
  assert.strictEqual(output[0], 'Insufficient funds for this debit.');
});

test('TC021: Large credit followed by large debit', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  const mockPrompt1 = createMockPrompt(['5000']);
  const mockPrompt2 = createMockPrompt(['3000']);
  
  ops.creditAccount(mockPrompt1);   // 6000
  ops.debitAccount(mockPrompt2);    // 3000
  
  assert.strictEqual(dm.read(), 3000.00);
});

test('TC024: Combined operations - complex scenario', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  
  // 1. Credit 500 (balance: 1500)
  ops.creditAccount(createMockPrompt(['500']));
  assert.strictEqual(dm.read(), 1500.00);
  
  // 2. Debit 600 (balance: 900)
  ops.debitAccount(createMockPrompt(['600']));
  assert.strictEqual(dm.read(), 900.00);
  
  // 3. Credit 200 (balance: 1100)
  ops.creditAccount(createMockPrompt(['200']));
  assert.strictEqual(dm.read(), 1100.00);
  
  // 4. Debit 50 (balance: 1050)
  ops.debitAccount(createMockPrompt(['50']));
  assert.strictEqual(dm.read(), 1050.00);
  
  // 5. View balance
  const output = captureOutput(() => ops.viewBalance());
  assert.strictEqual(output[0], 'Current balance: 001050.00');
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING
// ============================================================================

test('Invalid credit input - non-numeric', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['abc']);
  
  const output = captureOutput(() => ops.creditAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Invalid amount. Please enter a positive number.');
  assert.strictEqual(dm.read(), 1000.00); // Balance unchanged
});

test('Invalid debit input - non-numeric', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['xyz']);
  
  const output = captureOutput(() => ops.debitAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Invalid amount. Please enter a positive number.');
  assert.strictEqual(dm.read(), 1000.00); // Balance unchanged
});

test('Invalid credit input - negative amount', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['-500']);
  
  const output = captureOutput(() => ops.creditAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Invalid amount. Please enter a positive number.');
  assert.strictEqual(dm.read(), 1000.00);
});

test('Invalid debit input - negative amount', () => {
  const dm = new DataManager();
  const ops = new AccountOperations(dm);
  const mockPrompt = createMockPrompt(['-500']);
  
  const output = captureOutput(() => ops.debitAccount(mockPrompt));
  
  assert.strictEqual(output[0], 'Invalid amount. Please enter a positive number.');
  assert.strictEqual(dm.read(), 1000.00);
});

console.log('✅ All tests passed!');
