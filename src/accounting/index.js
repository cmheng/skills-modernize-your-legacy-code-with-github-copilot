#!/usr/bin/env node

/**
 * Student Account Management System
 * Modernized Node.js version from legacy COBOL
 * 
 * Original COBOL Structure:
 * - main.cob: Menu interface and program flow
 * - operations.cob: Business logic for account operations
 * - data.cob: Data persistence layer
 * 
 * This Node.js version consolidates all three modules while preserving:
 * - Original business logic
 * - Data integrity rules
 * - Menu options and user interface
 * - Overdraft protection and validation
 */

import promptSync from 'prompt-sync';

// ============================================================================
// DATA LAYER - Consolidated from data.cob
// ============================================================================

class DataManager {
  constructor() {
    // Storage balance initialization - equivalent to STORAGE-BALANCE in data.cob
    // PIC 9(6)V99 = max 999999.99
    this.storageBalance = 1000.00;
  }

  /**
   * Read the current account balance
   * Equivalent to: CALL 'DataProgram' USING 'READ', FINAL-BALANCE
   * @returns {number} The current account balance
   */
  read() {
    return this.storageBalance;
  }

  /**
   * Write/update the account balance
   * Equivalent to: CALL 'DataProgram' USING 'WRITE', FINAL-BALANCE
   * @param {number} balance - The new balance to store
   */
  write(balance) {
    // Validate balance is a number and within COBOL bounds (0 to 999999.99)
    if (typeof balance !== 'number' || balance < 0 || balance > 999999.99) {
      throw new Error('Invalid balance value');
    }
    this.storageBalance = Math.round(balance * 100) / 100; // Maintain 2 decimal precision
  }

  /**
   * Get the current balance with proper formatting
   * COBOL format: PIC 9(6)V99 (e.g., 001000.00)
   * @returns {string} Formatted balance string
   */
  getFormattedBalance() {
    return this.storageBalance.toFixed(2).padStart(9, '0');
  }
}

// ============================================================================
// OPERATIONS LAYER - Consolidated from operations.cob
// ============================================================================

class AccountOperations {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  /**
   * View current balance
   * Equivalent to: IF OPERATION-TYPE = 'TOTAL '
   */
  viewBalance() {
    const balance = this.dataManager.read();
    console.log(`Current balance: ${balance.toFixed(2).padStart(9, '0')}`);
  }

  /**
   * Credit (add funds) to account
   * Equivalent to: IF OPERATION-TYPE = 'CREDIT'
   * 
   * Business Logic:
   * 1. Read current balance
   * 2. Get credit amount from user
   * 3. Add amount to balance
   * 4. Write updated balance
   * 5. Display result
   */
  creditAccount(prompt) {
    const amountStr = prompt('Enter credit amount: ');
    const amount = parseFloat(amountStr);

    // Validation - amount must be positive number
    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount. Please enter a positive number.');
      return;
    }

    // Read current balance - CALL 'DataProgram' USING 'READ', FINAL-BALANCE
    let finalBalance = this.dataManager.read();

    // ADD AMOUNT TO FINAL-BALANCE
    finalBalance = finalBalance + amount;

    // Write updated balance - CALL 'DataProgram' USING 'WRITE', FINAL-BALANCE
    this.dataManager.write(finalBalance);

    // Display result
    console.log(`Amount credited. New balance: ${finalBalance.toFixed(2).padStart(9, '0')}`);
  }

  /**
   * Debit (remove funds) from account
   * Equivalent to: IF OPERATION-TYPE = 'DEBIT '
   * 
   * Business Rules:
   * - Cannot debit more than current balance (overdraft protection)
   * - Transaction rejected if insufficient funds
   * 
   * Logic:
   * 1. Read current balance
   * 2. Get debit amount from user
   * 3. Validate: IF FINAL-BALANCE >= AMOUNT
   * 4. If valid: Subtract amount and write balance
   * 5. If invalid: Display error and leave balance unchanged
   */
  debitAccount(prompt) {
    const amountStr = prompt('Enter debit amount: ');
    const amount = parseFloat(amountStr);

    // Validation - amount must be positive number
    if (isNaN(amount) || amount < 0) {
      console.log('Invalid amount. Please enter a positive number.');
      return;
    }

    // Read current balance - CALL 'DataProgram' USING 'READ', FINAL-BALANCE
    let finalBalance = this.dataManager.read();

    // IF FINAL-BALANCE >= AMOUNT (Overdraft protection)
    if (finalBalance >= amount) {
      // SUBTRACT AMOUNT FROM FINAL-BALANCE
      finalBalance = finalBalance - amount;

      // Write updated balance - CALL 'DataProgram' USING 'WRITE', FINAL-BALANCE
      this.dataManager.write(finalBalance);

      // Display result
      console.log(`Amount debited. New balance: ${finalBalance.toFixed(2).padStart(9, '0')}`);
    } else {
      // ELSE: Insufficient funds - reject transaction
      console.log('Insufficient funds for this debit.');
    }
  }
}

// ============================================================================
// MAIN PROGRAM - Consolidated from main.cob
// ============================================================================

class MainProgram {
  constructor() {
    this.dataManager = new DataManager();
    this.operations = new AccountOperations(this.dataManager);
    this.prompt = promptSync();
    this.continueFlag = true;
  }

  /**
   * Display the main menu
   * Equivalent to the DISPLAY statements in main.cob
   */
  displayMenu() {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  /**
   * Main application loop
   * Equivalent to: PERFORM UNTIL CONTINUE-FLAG = 'NO'
   */
  run() {
    while (this.continueFlag) {
      this.displayMenu();
      const choice = this.prompt('Enter your choice (1-4): ');

      // EVALUATE USER-CHOICE
      switch (choice) {
        case '1':
          // WHEN 1: CALL 'Operations' USING 'TOTAL '
          this.operations.viewBalance();
          break;

        case '2':
          // WHEN 2: CALL 'Operations' USING 'CREDIT'
          this.operations.creditAccount(this.prompt);
          break;

        case '3':
          // WHEN 3: CALL 'Operations' USING 'DEBIT '
          this.operations.debitAccount(this.prompt);
          break;

        case '4':
          // WHEN 4: MOVE 'NO' TO CONTINUE-FLAG
          this.continueFlag = false;
          break;

        default:
          // WHEN OTHER
          console.log('Invalid choice, please select 1-4.');
      }
    }

    // Program exit message
    console.log('Exiting the program. Goodbye!');
  }
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export { DataManager, AccountOperations };

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

// Only run if this is the main module (not imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new MainProgram();
  app.run();
}
