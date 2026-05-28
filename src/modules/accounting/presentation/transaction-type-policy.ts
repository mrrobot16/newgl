import type { Account, TransactionType } from "@/modules/accounting/domain/models";

export type BankRegisterTransactionTypeId =
  | TransactionType
  | "CC_EXPENSE"
  | "CC_CREDIT";

export type BankRegisterTransactionTypeOption = {
  id: BankRegisterTransactionTypeId;
  label: string;
};

const CASH_ON_HAND_TRANSACTION_TYPES: BankRegisterTransactionTypeOption[] = [
  { id: "CHECK", label: "Check" },
  { id: "DEPOSIT", label: "Deposit" },
  { id: "SALES_RECEIPT", label: "Sales Receipt" },
  { id: "RECEIVE_PAYMENT", label: "Receive Payment" },
  { id: "BILL_PAYMENT", label: "Bill Payment" },
  { id: "REFUND", label: "Refund" },
  { id: "EXPENSE", label: "Expense" },
  { id: "TRANSFER", label: "Transfer" },
  { id: "JOURNAL_ENTRY", label: "Journal Entry" }
];

const CREDIT_CARD_PAYABLE_TRANSACTION_TYPES: BankRegisterTransactionTypeOption[] = [
  { id: "CC_EXPENSE", label: "CC Expense" },
  { id: "EXPENSE", label: "Expense" },
  { id: "CC_CREDIT", label: "CC Credit" },
  { id: "BILL_PAYMENT", label: "Bill Payment" },
  { id: "TRANSFER", label: "Transfer" },
  { id: "JOURNAL_ENTRY", label: "Journal Entry" }
];

const CHARITABLE_DONATIONS_TRANSACTION_TYPES: BankRegisterTransactionTypeOption[] = [
  { id: "TRANSFER", label: "Transfer" },
  { id: "JOURNAL_ENTRY", label: "Journal Entry" }
];

const TODO_ACCOUNT_TRANSACTION_TYPES: BankRegisterTransactionTypeOption[] = [
  { id: "TRANSFER", label: "Transfer" },
  { id: "JOURNAL_ENTRY", label: "Journal Entry" }
];

const OTHER_CURRENT_ASSET_TRANSACTION_TYPES: BankRegisterTransactionTypeOption[] = [
  { id: "DEPOSIT", label: "Deposit" },
  { id: "SALES_RECEIPT", label: "Sales Receipt" },
  { id: "RECEIVE_PAYMENT", label: "Receive Payment" },
  { id: "REFUND", label: "Refund" },
  { id: "TRANSFER", label: "Transfer" },
  { id: "JOURNAL_ENTRY", label: "Journal Entry" }
];

const EQUITY_CLEARING_CREDIT_CARD_PAYMENT_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const EQUITY_CLEARING_TRANSFER_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const FEDERAL_ESTIMATED_TAX_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const FEDERAL_TAX_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const HEALTH_SAVINGS_ACCOUNT_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const HEALTH_INSURANCE_PREMIUM_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const MORTGAGE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const OWNERS_INVESTMENT_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const OWNERS_PAY_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const PERSONAL_EXPENSE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const PERSONAL_INCOME_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const PROPERTY_TAX_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const RETAINED_EARNINGS_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const RETIREMENT_CONTRIBUTIONS_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const STATE_ESTIMATED_TAX_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const STATE_TAX_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const VISITS_COPAYS_AND_PRESCRIPTIONS_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const APPS_AND_SOFTWARE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const BUILDING_PURCHASE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const COMPUTER_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const COPIER_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const FURNITURE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const LAND_PURCHASE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const MACHINERY_AND_EQUIPMENT_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const PHONE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const PHOTO_AND_VIDEO_EQUIPMENT_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const TOOLS_AND_EQUIPMENT_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const VEHICLE_PURCHASE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const BUSINESS_LOAN_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const MORTGAGE_PRINCIPAL_BUSINESS_PROPERTY_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const MORTGAGE_PRINCIPAL_HOME_OFFICE_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const VEHICLE_LOAN_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;
const LOANS_TO_OTHERS_TRANSACTION_TYPES = OTHER_CURRENT_ASSET_TRANSACTION_TYPES;
const UNCATEGORIZED_ASSET_TRANSACTION_TYPES = OTHER_CURRENT_ASSET_TRANSACTION_TYPES;
const UNDEPOSITED_FUNDS_TRANSACTION_TYPES = OTHER_CURRENT_ASSET_TRANSACTION_TYPES;
const SALES_TAX_TO_PAY_TRANSACTION_TYPES = TODO_ACCOUNT_TRANSACTION_TYPES;

const DEFAULT_CATEGORY_TRANSACTION_TYPES: Partial<
  Record<Account["category"], BankRegisterTransactionTypeOption[]>
> = {
  BANK: CASH_ON_HAND_TRANSACTION_TYPES,
  CREDIT_CARD: CREDIT_CARD_PAYABLE_TRANSACTION_TYPES,
  EQUITY: [
    { id: "JOURNAL_ENTRY", label: "Journal Entry" },
    { id: "TRANSFER", label: "Transfer" }
  ],
  FIXED_ASSET: [
    { id: "JOURNAL_ENTRY", label: "Journal Entry" },
    { id: "TRANSFER", label: "Transfer" }
  ],
  LONG_TERM_LIABILITY: [
    { id: "JOURNAL_ENTRY", label: "Journal Entry" },
    { id: "TRANSFER", label: "Transfer" }
  ],
  OTHER_CURRENT_ASSET: [
    { id: "JOURNAL_ENTRY", label: "Journal Entry" },
    { id: "TRANSFER", label: "Transfer" }
  ],
  OTHER_CURRENT_LIABILITY: [
    { id: "JOURNAL_ENTRY", label: "Journal Entry" },
    { id: "TRANSFER", label: "Transfer" }
  ]
};

const ACCOUNT_NAME_TRANSACTION_TYPES: Record<string, BankRegisterTransactionTypeOption[]> = {
  "Cash on hand": CASH_ON_HAND_TRANSACTION_TYPES,
  "Credit Card Payable": CREDIT_CARD_PAYABLE_TRANSACTION_TYPES,
  "Charitable donations": CHARITABLE_DONATIONS_TRANSACTION_TYPES,
  "Equity clearing (Credit Card Payment)": EQUITY_CLEARING_CREDIT_CARD_PAYMENT_TRANSACTION_TYPES,
  "Equity clearing (Transfer)": EQUITY_CLEARING_TRANSFER_TRANSACTION_TYPES,
  "Federal estimated tax": FEDERAL_ESTIMATED_TAX_TRANSACTION_TYPES,
  "Federal tax": FEDERAL_TAX_TRANSACTION_TYPES,
  "Health Savings Account": HEALTH_SAVINGS_ACCOUNT_TRANSACTION_TYPES,
  "Health insurance premium": HEALTH_INSURANCE_PREMIUM_TRANSACTION_TYPES,
  Mortgage: MORTGAGE_TRANSACTION_TYPES,
  "Owners investment": OWNERS_INVESTMENT_TRANSACTION_TYPES,
  "Owners pay": OWNERS_PAY_TRANSACTION_TYPES,
  "Personal expense": PERSONAL_EXPENSE_TRANSACTION_TYPES,
  "Personal income": PERSONAL_INCOME_TRANSACTION_TYPES,
  "Property tax": PROPERTY_TAX_TRANSACTION_TYPES,
  "Retained Earnings": RETAINED_EARNINGS_TRANSACTION_TYPES,
  "Retirement contributions": RETIREMENT_CONTRIBUTIONS_TRANSACTION_TYPES,
  "State estimated tax": STATE_ESTIMATED_TAX_TRANSACTION_TYPES,
  "State tax": STATE_TAX_TRANSACTION_TYPES,
  "Visits, copays, and prescriptions": VISITS_COPAYS_AND_PRESCRIPTIONS_TRANSACTION_TYPES,
  "Apps and software (> $200)": APPS_AND_SOFTWARE_TRANSACTION_TYPES,
  "Building purchase": BUILDING_PURCHASE_TRANSACTION_TYPES,
  "Computer (> $200)": COMPUTER_TRANSACTION_TYPES,
  "Copier (> $200)": COPIER_TRANSACTION_TYPES,
  "Furniture (> $200)": FURNITURE_TRANSACTION_TYPES,
  "Land purchase": LAND_PURCHASE_TRANSACTION_TYPES,
  "Machinery and equipment": MACHINERY_AND_EQUIPMENT_TRANSACTION_TYPES,
  "Phone (> $200)": PHONE_TRANSACTION_TYPES,
  "Photo and video equipment (> $200)": PHOTO_AND_VIDEO_EQUIPMENT_TRANSACTION_TYPES,
  "Tools and equipment (> $200)": TOOLS_AND_EQUIPMENT_TRANSACTION_TYPES,
  "Vehicle purchase": VEHICLE_PURCHASE_TRANSACTION_TYPES,
  "Business loan": BUSINESS_LOAN_TRANSACTION_TYPES,
  "Mortgage principal (business property)": MORTGAGE_PRINCIPAL_BUSINESS_PROPERTY_TRANSACTION_TYPES,
  "Mortgage principal (home office)": MORTGAGE_PRINCIPAL_HOME_OFFICE_TRANSACTION_TYPES,
  "Vehicle loan": VEHICLE_LOAN_TRANSACTION_TYPES,
  "Loans to others": LOANS_TO_OTHERS_TRANSACTION_TYPES,
  "Uncategorized Asset": UNCATEGORIZED_ASSET_TRANSACTION_TYPES,
  "Undeposited Funds": UNDEPOSITED_FUNDS_TRANSACTION_TYPES,
  "Sales tax to pay": SALES_TAX_TO_PAY_TRANSACTION_TYPES
};

export function getSupportedTransactionTypesForAccount(
  account: Account | undefined
): BankRegisterTransactionTypeOption[] {
  if (!account) {
    return CASH_ON_HAND_TRANSACTION_TYPES;
  }

  const byName = ACCOUNT_NAME_TRANSACTION_TYPES[account.name];
  if (byName) {
    return byName;
  }

  return DEFAULT_CATEGORY_TRANSACTION_TYPES[account.category] ?? CASH_ON_HAND_TRANSACTION_TYPES;
}

export function isInflowTransactionType(transactionTypeId: BankRegisterTransactionTypeId): boolean {
  return (
    transactionTypeId === "DEPOSIT" ||
    transactionTypeId === "SALES_RECEIPT" ||
    transactionTypeId === "RECEIVE_PAYMENT" ||
    transactionTypeId === "CC_CREDIT"
  );
}

export function isOutflowTransactionType(transactionTypeId: BankRegisterTransactionTypeId): boolean {
  return (
    transactionTypeId === "CHECK" ||
    transactionTypeId === "BILL_PAYMENT" ||
    transactionTypeId === "REFUND" ||
    transactionTypeId === "EXPENSE" ||
    transactionTypeId === "CC_EXPENSE"
  );
}

export function isAccountFieldDisabledForTransactionType(
  transactionTypeId: BankRegisterTransactionTypeId
): boolean {
  return (
    transactionTypeId === "SALES_RECEIPT" ||
    transactionTypeId === "RECEIVE_PAYMENT" ||
    transactionTypeId === "BILL_PAYMENT" ||
    transactionTypeId === "REFUND"
  );
}

export function toDomainTransactionType(
  transactionTypeId: BankRegisterTransactionTypeId
): TransactionType {
  if (transactionTypeId === "CC_EXPENSE") {
    return "EXPENSE";
  }
  if (transactionTypeId === "CC_CREDIT") {
    return "BILL_PAYMENT";
  }
  return transactionTypeId;
}
