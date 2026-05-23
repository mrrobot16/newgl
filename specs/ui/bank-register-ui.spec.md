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

The screen is divided into 5 main sections:

## 1. General Balance Overview (Top Summary)

- Shows a single "Balance General" amount across all visible accounts
- Initial value must be 0.00 at startup
- Value updates as account balances update

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

Buttons:

- + Check
- + Deposit
- + Expense
- + Transfer
- + Journal Entry

Each button opens a transaction modal.

---

## 4. Register Table (Core Component)

This is the main ledger view.

### Columns

| Column | Description |
|--------|-------------|
| Date | Transaction date |
| Type | Check / Deposit / Expense |
| Ref No | Reference ID |
| Payee / Account | Counterparty |
| Memo | Description |
| Payment | Money out |
| Deposit | Money in |
| Balance | Running balance |

---

## 5. Detail Panel (Optional Side Panel)

Shows:

- full transaction details
- ledger postings
- audit history
- actions (void, reverse, edit draft)

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

Click action button:

- opens modal
- uses TransactionService
- posts via Ledger Engine

---

## Row Click

Opens detail panel:

- shows ledger postings
- shows events history
- shows audit trail

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