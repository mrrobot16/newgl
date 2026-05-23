# Bank Register Domain Specification

## Overview

The Bank Register module is responsible for managing accounting transactions
associated with financial accounts.

The system behaves similarly to QuickBooks Bank Register.

It supports:

- Income tracking
- Expense tracking
- Transfers
- Journal entries
- Deposits
- Refunds
- Bill payments
- Balance calculations
- Running balances
- Ledger history

---

# Core Concepts

## Account

Represents a financial or accounting account.

Examples:

- Cash on hand
- Credit Card Payable
- Mortgage
- Retained Earnings
- Undeposited Funds

Each account belongs to an Account Category.

---

## Account Category

Represents the accounting classification.

Supported categories:

- Bank
- Credit Card
- Equity
- Fixed Asset
- Long Term Liability
- Other Current Asset
- Other Current Liability

---

## Register Entry

Represents a transaction line displayed in the bank register table.

A register entry affects an account balance.

---

## Transaction Types

Supported transaction types:

- Check
- Deposit
- Sales Receipt
- Receive Payment
- Bill Payment
- Refund
- Expense
- Transfer
- Journal Entry

---

# Register Table

The register table displays transaction history for a selected account.

## Columns

- Date
- Ref Number / Type
- Payee / Account
- Memo
- Payment
- Deposit
- Running Balance

---

# Accounting Behavior

## Deposits

Deposits increase account balance.

## Payments

Payments decrease account balance.

## Transfers

Transfers move money between two accounts.

A transfer must:

- decrease source account
- increase destination account

## Journal Entries

Journal entries must preserve accounting balance.

Total debits must equal total credits.

---

# Running Balance Rules

The running balance is calculated sequentially.

Formula:

RunningBalance = PreviousBalance + Deposits - Payments

---

# Account Selection

Users can select one active account at a time.

The register table updates dynamically based on the selected account.

Default account catalog for bootstrap:

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

# General Balance View

The screen includes a global "Balance General" summary.

Rules:

- Starts at 0.00 when the app boots
- Aggregates current balances across the active account list
- Updates reactively when ledger events update account balances

---

# Register Entry States

Supported states:

- Draft
- Posted
- Voided
- Deleted

Deleted entries should remain in audit history.

---

# Audit Requirements

The system must maintain:

- Created by
- Created at
- Updated at
- Voided at
- Deleted at

No transaction should be physically removed.

---

# Future Scope

Future versions may support:

- Multi-currency
- Reconciliation
- Attachments
- Tax handling
- Recurring transactions
- AI categorization
- CSV imports
- Bank synchronization