# Student Account Management System - Test Plan

## Test Objective
To validate the functionality of the Student Account Management System COBOL application, ensuring all business logic related to student account operations (Balance Inquiry, Credit, Debit) works correctly and adheres to business rules.

## Test Scope
- Menu navigation and user input handling
- Balance inquiry functionality
- Credit operations (additions to account)
- Debit operations (subtractions from account) with validation
- Error handling and invalid inputs
- Application exit functionality

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC001 | View initial account balance | Application is started | 1. Select menu option 1 (View Balance) 2. Observe displayed balance | Display shows "Current balance: 001000.00" | | | Initial balance should always be $1000.00 |
| TC002 | Credit account with valid amount | Application started with $1000.00 balance | 1. Select menu option 2 (Credit Account) 2. Enter amount: 500 3. Observe result | Display shows "Amount credited. New balance: 001500.00" and balance is updated to $1500.00 | | | Credit operation should add amount to existing balance |
| TC003 | Credit account with large amount | Application started with $1000.00 balance | 1. Select menu option 2 (Credit Account) 2. Enter amount: 999999.99 3. Observe result | Display shows "Amount credited. New balance: 1000999.99" and balance increases by exactly 999999.99 | | | System should handle maximum credit amount without overflow |
| TC004 | Credit account with zero amount | Application started with $1000.00 balance | 1. Select menu option 2 (Credit Account) 2. Enter amount: 0 3. Observe result | Display shows "Amount credited. New balance: 001000.00" and balance remains unchanged | | | Zero credit should not change balance (edge case) |
| TC005 | Credit account multiple times sequentially | Application started with $1000.00 balance | 1. Credit 200 (balance becomes 1200) 2. Credit 300 (balance becomes 1500) 3. Credit 150 (balance becomes 1650) | Each credit operation succeeds and running balance is correct: 1200 → 1500 → 1650 | | | Multiple sequential credits should accumulate correctly |
| TC006 | Debit account with valid amount | Application started with $1000.00 balance | 1. Select menu option 3 (Debit Account) 2. Enter amount: 300 3. Observe result | Display shows "Amount debited. New balance: 000700.00" and balance decreases to $700.00 | | | Debit operation should subtract amount from balance if funds sufficient |
| TC007 | Debit account with amount equal to balance | Application started with $1000.00 balance | 1. Select menu option 3 (Debit Account) 2. Enter amount: 1000 3. Observe result | Display shows "Amount debited. New balance: 000000.00" and balance becomes $0.00 | | | System should allow debit of entire balance (boundary condition) |
| TC008 | Debit account with amount exceeding balance | Application started with $1000.00 balance | 1. Select menu option 3 (Debit Account) 2. Enter amount: 1500 3. Observe result | Display shows "Insufficient funds for this debit." and balance remains unchanged at $1000.00 | | | System should reject debit that would cause negative balance |
| TC009 | Debit account with zero amount | Application started with $1000.00 balance | 1. Select menu option 3 (Debit Account) 2. Enter amount: 0 3. Observe result | Display shows "Amount debited. New balance: 001000.00" and balance remains unchanged (or operation is accepted and no change occurs) | | | Zero debit should not change balance |
| TC010 | Debit after credit operation | Application started with $1000.00 balance | 1. Credit 500 (balance becomes 1500) 2. Debit 200 (balance becomes 1300) 3. View balance | Display shows "Current balance: 001300.00" | | | Debit should work correctly on updated balance from previous credit |
| TC011 | Credit after debit operation | Application started with $1000.00 balance | 1. Debit 400 (balance becomes 600) 2. Credit 300 (balance becomes 900) 3. View balance | Display shows "Current balance: 000900.00" | | | Credit should work correctly on updated balance from previous debit |
| TC012 | Multiple debits with sufficient funds | Application started with $1000.00 balance | 1. Debit 300 (balance becomes 700) 2. Debit 200 (balance becomes 500) 3. Debit 100 (balance becomes 400) | All three debit operations succeed with final balance of $400.00 | | | Multiple sequential debits should accumulate correctly and validate each time |
| TC013 | Multiple debits exceeding balance on third attempt | Application started with $1000.00 balance | 1. Debit 300 (succeeds, balance 700) 2. Debit 200 (succeeds, balance 500) 3. Debit 600 (attempt to debit more than available) | First two debits succeed; third debit is rejected with "Insufficient funds for this debit." message and balance remains $500.00 | | | System should prevent overdraft at any point in sequence |
| TC014 | Invalid menu selection - option 5 | Application showing main menu | 1. Select menu option 5 2. Observe error message | Display shows "Invalid choice, please select 1-4." and returns to menu | | | System should validate menu input and reject invalid selections |
| TC015 | Invalid menu selection - option 0 | Application showing main menu | 1. Select menu option 0 2. Observe error message | Display shows "Invalid choice, please select 1-4." and returns to menu | | | System should reject selections outside valid range (1-4) |
| TC016 | Invalid menu selection - negative number | Application showing main menu | 1. Select menu option -1 2. Observe error message | Display shows "Invalid choice, please select 1-4." and returns to menu | | | System should handle negative input gracefully |
| TC017 | Exit application - option 4 | Application showing main menu | 1. Select menu option 4 2. Observe application behavior | Display shows "Exiting the program. Goodbye!" and application terminates | | | Exit option should terminate program gracefully |
| TC018 | Menu loop - continue after invalid selection | Application showing main menu after invalid selection | 1. Enter invalid option (e.g., 5) 2. Error message displays 3. Enter valid option (e.g., 1 for View Balance) | Menu error message displays, then menu re-displays, and valid option processes correctly | | | System should continue accepting input after invalid selection |
| TC019 | View balance after multiple operations | Application with balance changed through credits/debits | 1. Perform series of operations (credit 200, debit 100, credit 300, debit 150) 2. Select option 1 (View Balance) | Balance display reflects all accumulated changes correctly (final balance: 1250) | | | View Balance should always show current accurate balance |
| TC020 | Debit edge case - exact balance remaining | Application at $500.00 balance | 1. Debit exactly $500 2. Verify balance becomes $0 3. Attempt to debit any amount 4. Verify rejection | First debit succeeds; second debit is rejected as insufficient funds | | | System should handle zero balance correctly and prevent further debits |
| TC021 | Large credit followed by large debit | Application at $1000.00 balance | 1. Credit $5000 (balance becomes $6000) 2. Debit $3000 3. View balance | Balance shows $3000 after operations | | | System should handle large amounts correctly in both operations |
| TC022 | Decimal precision - credit with cents | Application at $1000.00 balance | 1. Credit $150.50 2. View balance | Display shows balance with correct decimal precision: "001150.50" | | | System should maintain decimal precision for currency amounts |
| TC023 | Decimal precision - debit with cents | Application at $1000.00 balance | 1. Debit $123.45 2. View balance | Display shows balance with correct decimal precision: "000876.55" | | | System should maintain decimal precision during debit operations |
| TC024 | Combined operations - complex scenario | Application at $1000.00 balance | 1. Credit $500 (balance: $1500) 2. Debit $600 (balance: $900) 3. Credit $200 (balance: $1100) 4. Debit $50 (balance: $1050) 5. View balance | Final display shows "Current balance: 001050.00" | | | Complex sequence of mixed operations should accumulate correctly |
| TC025 | Menu navigation - multiple cycles | Application running normally | 1. Perform 5 complete menu cycles (select, perform operation, return to menu) 2. Each time select different operations (1, 2, 3, 1, 2) | Menu displays correctly after each operation and returns to main menu without losing state | | | System should handle multiple menu cycles without degradation |

---

## Test Coverage Summary

### Functional Areas Covered

1. **Menu Navigation & Input Handling**
   - Valid menu selections (1-4)
   - Invalid menu selections (0, 5, negative)
   - Menu loop continuation
   - Exit functionality

2. **Balance Inquiry (Option 1)**
   - View initial balance
   - View balance after credit
   - View balance after debit
   - View balance after multiple operations

3. **Credit Operations (Option 2)**
   - Normal credit amount
   - Zero amount credit
   - Large amount credit
   - Decimal precision in credits
   - Multiple sequential credits
   - Credits after debits

4. **Debit Operations (Option 3)**
   - Normal debit amount
   - Zero amount debit
   - Debit equal to balance
   - Debit exceeding balance (rejection)
   - Decimal precision in debits
   - Multiple sequential debits with validation
   - Debits after credits
   - Edge case: debit at zero balance

5. **Business Rules Validation**
   - Insufficient funds prevention
   - Correct balance accumulation
   - Overdraft protection
   - Initial balance consistency

6. **Data Integrity**
   - Balance persistence across operations
   - Decimal precision maintenance
   - Correct arithmetic operations

---

## Test Execution Notes

- **Initial Setup**: Each test case starts with the application freshly launched with default balance of $1000.00
- **User Interaction**: Tests simulate user input via stdin or interactive terminal
- **Expected Results**: Results should match business logic as documented in system design
- **Decimal Format**: Balance is displayed as 6 digits total with 2 decimal places (e.g., 001000.00)
- **Validation Point**: Debit validation occurs before balance is modified; insufficient funds prevents any state change

---

## Notes for Future Node.js Implementation

When migrating this test plan to Node.js unit and integration tests:

1. **Test Framework**: Use Jest or Mocha for test framework
2. **Mocking**: Mock user input using test libraries
3. **Assertions**: Validate return values and balance state after each operation
4. **Database**: Node.js version should use persistent storage (consider SQL database or file-based state)
5. **API Structure**: Consider RESTful API endpoints for each operation:
   - GET /account/balance
   - POST /account/credit
   - POST /account/debit
6. **Error Responses**: Map COBOL error messages to HTTP status codes (400 for insufficient funds, 400 for invalid input)
7. **Concurrent Testing**: Node.js tests can run in parallel (unlike sequential COBOL testing)
8. **Type Safety**: Consider using TypeScript for better type validation
9. **Test Data**: Consider parameterized tests for boundary conditions
10. **Performance**: Add performance benchmarks for large transaction volumes

