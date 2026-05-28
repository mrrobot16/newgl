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
- render compact selector control with bordered style and chevron affordance

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
- apply QuickBooks-like blue-link visual style for split button and menu

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
- render payee combobox-style input with chevron toggle and `+ Add new` option
- open and wire payee side modal from payee selector
- render account combobox-style input with chevron toggle and searchable dropdown
- render account options with left-aligned name and right-aligned category
- disable/enable draft `Account` select based on selected transaction type policy and gray it out when disabled
- apply shared selector field styling (`h-9`, bordered surface, transition states, custom chevron SVG)
- support selector width modes: compact (`min-w-fit w-fit` + `208px`) and fluid (`w-full`)
- render filter toolbar above the table (`All`, print/export/settings)
- support small-screen horizontal scrolling without clipping payee/account dropdown overlays
- use QuickBooks-like table spacing, header treatments, and numeric alignment

## 5. Payee Modal Layer

### PayeeSelect + PayeeSideModal

Responsibilities:

- maintain payee options and allow selecting a payee from a filterable input + dropdown
- provide chevron toggle to open/close payee options list
- open dropdown with full payee list and filter list while typing
- provide `+ Add new` entry pinned at top in payee dropdown
- ensure payee and account dropdowns can overlay the register table without clipping
- render side modal (`752px`, `100vh`) with overlay-close behavior
- render type-specific forms for `Customer`, `Vendor`, and `Employee`
- render full `Customer` form sections (name/contact, permissions, address, notes, payments, additional info)
- render `Employee` form with fields: First name*, M.I., Last name*, Email, Hire date
- implement collapsible form cards with header chevron and right-side icon
- persist created payee in selector options and auto-select it in active form
- clear payee modal form state after successful save

---