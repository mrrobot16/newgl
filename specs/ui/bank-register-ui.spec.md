# Bank Register UI Specification

## Overview

The Bank Register screen is the primary accounting interface
for viewing and managing transactions per account.

It behaves like a continuous ledger view similar to QuickBooks.

---

# Core Purpose

The Bank Register allows users to:

- view account transaction history
- add new financial entries
- inspect running balance
- perform actions (post, reverse, void)
- maintain audit visibility

---

# Layout Structure

The screen is divided into 4 main sections:

## Visual Style (QuickBooks-like)

- white, minimal layout with consistent `text-sm` baseline
- primary text colors use gray scale (`gray-800` / `gray-900`)
- app-wide font stack should prefer `Avenir Next forINTUIT`, then `Avenir Next`, `Avenir`, `Helvetica`, `Arial`, `sans-serif`
- top header includes:
  - back link (`Back to Chart of Accounts`) with left arrow, blue hoverable text
  - `Bank Register` title with semibold emphasis
  - account selector in compact bordered control with right chevron
  - right-side `Reconcile` green action button
  - ending balance label (`uppercase`, `tracking-wide`) with prominent amount
- pagination/navigation strip includes `Go to` input, first/prev/next/last actions, and range summary
- action toolbar uses blue text split control (`Add <Type>`) with chevron dropdown
- table container includes filter bar above header:
  - left filter indicator (`All`)
  - right-side utility actions (print/export/settings)
- table uses:
  - gray header background and uppercase tiny labels
  - fixed-width numeric columns and right-aligned amounts
  - hoverable ledger rows with subtle border separators
- draft/edit input rows use blue-tinted background and focus-ring input styles
- disabled fields use gray background, gray text, and non-interactive cursor
- table area can support horizontal scrolling on small screens, but dropdown menus must never be clipped
- selector fields follow a shared text-field style:
  - `h-9` (36px), inherited font, `text-sm`, `leading-[1.2]`
  - bordered white surface with small radius and transition on background/border/shadow
  - custom chevron icon uses the shared 24x24 down-chevron SVG
  - supports width behavior: parent `min-w-fit w-fit` keeps compact `208px`; `w-full` expands to container width
- global CSS override file is available at `src/styles/tailwind-overrides.css` and loaded after Tailwind globals for higher-priority rules

## 1. General Balance Overview (Top Summary)

- Shows a single "Balance General" amount for the currently selected account register
- Initial value must be 0.00 at startup
- Value updates from latest running balance in selected register (fallback: selected account balance)

---

## 2. Account Selector (Top Bar)

- Dropdown of Chart of Accounts
- Only accounts of type:
  - ASSET
  - LIABILITY
  - EQUITY

Each option must render:

- Account Name + Category label
- Example: Cash on hand (Bank)

Supported default options:

- Cash on hand (Bank)
- Credit Card Payable (Credit Card)
- Charitable donations (Equity)
- Equity clearing (Credit Card Payment) (Equity)
- Equity clearing (Transfer) (Equity)
- Federal estimated tax (Equity)
- Federal tax (Equity)
- Health Savings Account (Equity)
- Health insurance premium (Equity)
- Mortgage (Equity)
- Owners investment (Equity)
- Owners pay (Equity)
- Personal expense (Equity)
- Personal income (Equity)
- Property tax (Equity)
- Retained Earnings (Equity)
- Retirement contributions (Equity)
- State estimated tax (Equity)
- State tax (Equity)
- Visits, copays, and prescriptions (Equity)
- Apps and software (> $200) (Fixed Asset)
- Building purchase (Fixed Asset)
- Computer (> $200) (Fixed Asset)
- Copier (> $200) (Fixed Asset)
- Furniture (> $200) (Fixed Asset)
- Land purchase (Fixed Asset)
- Machinery and equipment (Fixed Asset)
- Phone (> $200) (Fixed Asset)
- Photo and video equipment (> $200) (Fixed Asset)
- Tools and equipment (> $200) (Fixed Asset)
- Vehicle purchase (Fixed Asset)
- Business loan (Long Term Liability)
- Mortgage principal (business property) (Long Term Liability)
- Mortgage principal (home office) (Long Term Liability)
- Vehicle loan (Long Term Liability)
- Loans to others (Other Current Asset)
- Uncategorized Asset (Other Current Asset)
- Undeposited Funds (Other Current Asset)
- Sales tax to pay (Other Current Liability)

---

## 3. Action Toolbar

The toolbar uses a split action control:

- Primary button: `Add <Selected Transaction Type>`
- Secondary button: chevron down to open transaction type menu

Behavior:

- Clicking the primary button creates a transaction using the last selected type
- Clicking chevron opens the available transaction types for the selected account
- Selecting a type in the menu:
  - updates the primary button label
  - opens a new inline draft row at the top of the register table

Transaction type availability is account-driven:

- UI calls a resolver with selected account
- resolver returns supported transaction types for that account
- each type provides both ID and label for rendering/behavior

For `Cash on hand (Bank)`, available types must be:

- Check
- Deposit
- Sales Receipt
- Receive Payment
- Bill Payment
- Refund
- Expense
- Transfer
- Journal Entry

For `Credit Card Payable (Credit Card)`, available types must be:

- CC Expense
- Expense
- CC Credit
- Bill Payment
- Transfer
- Journal Entry

For `Charitable donations (Equity)`, available types must be:

- Transfer
- Journal Entry

---

## 4. Register Table (Core Component)

This is the main ledger view.

### Columns

Header row 1:

- Date
- Ref No
- Payee
- Memo
- Payment
- Deposit
- Balance

Header row 2:

- Type (under Ref No)
- Account (under Payee)

Header alignment:

- all header labels are top-aligned

---

# Table Behavior

## Sorting

- Default sort: Date DESC
- Must preserve ledger ordering rules

---

## Running Balance

Balance is calculated row-by-row:

- starts from opening balance
- applies postings sequentially

---

## Row Types

Each row represents:

- Transaction
- Reversal
- Void entry

Visual states:

- normal
- reversed
- voided (strikethrough style)
- pending (draft)

---

# Interaction Model

## Add Transaction

Click primary action button:

- uses selected transaction type
- opens inline draft row in first table position

When selecting from chevron menu:

- selected type is updated
- inline draft row is shown for data entry

Inline draft row fields and layout:

- Date column: date input
- Ref/Type column: `Ref No` input and disabled `Type` input
- Payee/Account column: payee combobox + account combobox
- Memo column: memo input
- Payment column: payment amount input
- Deposit column: deposit amount input
- Balance column: hidden placeholder (no balance preview during edit)
- Action buttons appear in a separate row below the draft form (`Cancel`, `Save`)

Validation rules for draft row:

- date is required
- payee is optional
- account selection is required only when Account select is enabled
- only one of payment/deposit can be populated
- at least one of payment/deposit is required
- inflow transaction types must use deposit
- outflow transaction types must use payment
- payment input is disabled for inflow transaction types
- deposit input is disabled for outflow transaction types
- account input is disabled (grayed out) for `Sales Receipt`, `Receive Payment`, `Bill Payment`, `Refund`
- account input is enabled for `Check`, `Deposit`, `Expense`, `Transfer`, `Journal Entry`

Account select behavior:

- rendered as text input with adjacent chevron toggle button (same interaction pattern as Payee)
- input placeholder is `Account`
- clicking input or chevron opens dropdown list
- typing in input filters account options in real time
- each account option row shows account name left and category right
- selecting an account writes the account name into the input value
- uses the predefined accounting chart options list (Bank, Credit Card, Equity, Expense, Fixed Asset, Income, Long Term Liability, Other Current Asset, Other Current Liability, Other Expense, Other Income)

Payee select behavior:

- rendered as text input with adjacent chevron toggle button
- input placeholder is `Payee` when value is empty
- clicking input or chevron opens dropdown list
- typing in input filters payee list by name
- selecting an existing payee writes the selected value into the input
- dropdown shows full payee list when opened and filters only while typing
- dropdown includes `+ Add new` option pinned at the top, opening payee side modal
- payee and account dropdown menus render above table rows and must not be clipped by register container overflow

Payee side modal behavior:

- slides from right side with width `752px` and height `100vh`
- overlay covers rest of screen and clicking overlay closes modal
- includes type selector: `Customer`, `Vendor`, `Employee`
- each type has grouped form cards with shadow and collapsible headers
- card header includes left icon + group title and right chevron state
- labels are above fields and fields have no placeholder text
- on successful save, modal form state is reset for the next creation flow

Vendor form groups:

- Name and contact
- Address
- Notes and attachments
- Bill pay ACH info
- Additional info (Sales tax + Expense rates subgroups)

Customer form groups:

- Name and contact
  - title, first name, middle name, last name, suffix
  - Company name, Customer display name*
  - email, phone number, cc, Bcc, mobile number, Fax, Other, Website
  - Name to print on checks
  - Is a sub-customer (checkbox)
- Communication permissions
  - centered helper text for customer consent once email is present
- Address
  - Street address 1, Street address 2, City, State, ZIP code, Country
  - Shipping address checkbox: Same as billing address
- Notes and attachments
  - Notes
  - Attachments (max 20mb)
- Payments
  - Primary payment method: ACH, Cash, Check, Credit Card
  - Terms: Due on receipt, Net 15, Net 30, Net 60
  - Sales form delivery options
  - Language to use when sending invoices:
    English, French, Spanish, Italian, Chinese (traditional), Portuguese (Brazil)
- Additional info
  - Sales tax: Exemption details
  - Opening balance: Opening balance + As of (date)

Employee form groups:

- Employee details
  - First name *
  - M.I.
  - Last name *
  - Email
  - Hire date

Save behavior:

- valid draft creates transaction via TransactionService
- transaction is posted through Ledger Engine
- draft row is removed and persisted row appears in register
- save action is single-submit (button is disabled while saving)

Cancel behavior:

- removes draft row without creating transaction

---

## Row Click

Activates inline row editor in the clicked row position.

Inline row actions:

- Delete
- Edit
- Cancel
- Save

Row editing behavior:

- row opens with inline inputs ready for editing
- editable fields are: Date, Payee, Memo, Payment, Deposit
- Ref No and Account remain read-only in this version
- Edit button is reserved for future behavior (no-op in current version)
- payment/deposit input availability is constrained by transaction type
- Save persists row changes
- Delete removes row from the table
- after delete, running balances are recalculated from remaining rows
- top register balance updates to match remaining table state
- Cancel closes row editor without persisting
- row action buttons (`Delete`, `Edit`, `Cancel`, `Save`) render in a separate row below the inline form
- balance is not shown while editing an existing row

---

## Context Actions

Each row supports:

- View
- Void
- Reverse
- Print
- Duplicate

---

# Transaction Type Mapping

| UI Action | Transaction Type |
|----------|-----------------|
| Check | EXPENSE |
| Deposit | DEPOSIT |
| Expense | EXPENSE |
| Transfer | TRANSFER |
| Journal Entry | JOURNAL_ENTRY |

---

# State Behavior

UI state is driven by:

- RegisterService
- Ledger events
- Domain store sync

---

# Event Synchronization

UI updates on events:

- TransactionPosted
- TransactionVoided
- TransactionReversed
- AccountBalanceUpdated

---

# Loading States

- Skeleton rows for register table
- Optimistic insert for new transactions
- Event-confirmed updates

---

# Error Handling

- failed posting → rollback UI state
- invalid transaction → modal error message
- ledger mismatch → blocking state

---

# Performance Rules

- lazy load register rows
- paginate by date range
- cache per account
- virtualized table rendering

---

# Design Principles

- Ledger-first UI (not CRUD UI)
- Audit always visible
- No hidden financial changes
- Immutable transaction history
- Financial transparency

---

# Future Enhancements

- inline editing (draft only)
- bulk reconciliation mode
- AI categorization assistant
- bank feed import view
- multi-currency toggle