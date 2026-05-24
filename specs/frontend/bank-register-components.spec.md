# Bank Register Components Specification

## Overview

This document defines the React component architecture
for the Bank Register screen.

It translates the UI specification into implementable components
for a Next.js + TypeScript frontend.

---

# Core Principle

## Component = Domain View

Each component MUST map to:

- a domain concept
- or a service contract
- or a ledger event stream

No UI-only components without domain meaning.

---

# COMPONENT ARCHITECTURE

The Bank Register screen is composed of 5 main layers:

---

## 1. Page Layer

### BankRegisterPage

Entry point of the screen.

Responsibilities:

- load selected account
- initialize services
- connect event listeners
- orchestrate layout

```tsx id="cmp1"
function BankRegisterPage() {
  return (
    <BankRegisterProvider>
      <BankRegisterLayout />
    </BankRegisterProvider>
  );
}
```

---

## 2. Account Selector Layer

### AccountSelector

Responsibilities:

- render account options as `Name (Category)`
- drive selected account state
- trigger action toolbar type recalculation

---

## 3. Action Toolbar Layer

### ActionToolbar (Split Button)

Responsibilities:

- render primary button `Add <Selected Type>`
- render chevron dropdown with transaction type list
- update selected transaction type from dropdown
- open inline draft row on primary click
- open inline draft row when selecting a type in dropdown
- consume account transaction type resolver (`getSupportedTransactionTypesForAccount(account)`)

For `Cash on hand (Bank)` the dropdown list must include:

- Check
- Deposit
- Sales Receipt
- Receive Payment
- Bill Payment
- Refund
- Expense
- Transfer
- Journal Entry

For `Credit Card Payable (Credit Card)` the dropdown list must include:

- CC Expense
- Expense
- CC Credit
- Bill Payment
- Transfer
- Journal Entry

For `Charitable donations (Equity)` the dropdown list must include:

- Transfer
- Journal Entry

---

## 4. Register Table Layer

### RegisterTable

Responsibilities:

- render ledger-oriented rows
- render two-level column headers (`Ref No/Type` and `Payee/Account`)
- render header labels top-aligned
- support row click for inline row editor
- render inline draft row at top when action is initiated
- handle inline draft field editing by column
- expose `Save` and `Cancel` actions for draft row in a separate action row below the form
- show field validation messages before save (no balance preview while editing)
- lock draft save action while request is in-flight
- render existing-row actions: `Delete`, `Edit`, `Cancel`, `Save` in a separate row below inline row form
- persist row updates/deletes through RegisterService
- on delete, remove row from list and trigger running balance recomputation
- allow immediate inline editing for Date, Payee, Memo, Payment, and Deposit
- keep `Edit` button visible as reserved no-op for future behavior

---