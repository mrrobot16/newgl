import type {
  Account,
  AccountHierarchy,
  ChartOfAccount,
  CreateAccountInput,
  CreateTransactionInput,
  LedgerPosting,
  PostingEntryType,
  RegisterEntry,
  Transaction,
  UpdateAccountInput
} from "@/modules/accounting/domain/models";
import type {
  AccountService,
  LedgerService,
  RegisterService,
  TransactionService
} from "@/modules/accounting/application/contracts";
import type { LedgerDomainEvent } from "@/modules/accounting/domain/events";
import { ledgerEventBus } from "@/shared/event-bus";
import { createId } from "@/shared/utils/id";
import { nowIso, todayIsoDate } from "@/shared/utils/date";

type Store = {
  accounts: Account[];
  chartAccounts: ChartOfAccount[];
  transactions: Transaction[];
  ledgerPostings: LedgerPosting[];
  registerEntries: RegisterEntry[];
};

const DEBIT_NORMAL_CATEGORIES = new Set<Account["category"]>([
  "BANK",
  "FIXED_ASSET",
  "OTHER_CURRENT_ASSET"
]);

function emit(event: LedgerDomainEvent): void {
  ledgerEventBus.emit(event);
}

const ACCOUNT_TYPE_BY_CATEGORY: Record<Account["category"], ChartOfAccount["accountType"]> = {
  BANK: "ASSET",
  CREDIT_CARD: "LIABILITY",
  EQUITY: "EQUITY",
  FIXED_ASSET: "ASSET",
  LONG_TERM_LIABILITY: "LIABILITY",
  OTHER_CURRENT_ASSET: "ASSET",
  OTHER_CURRENT_LIABILITY: "LIABILITY"
};

const NORMAL_BALANCE_BY_TYPE: Record<ChartOfAccount["accountType"], ChartOfAccount["normalBalance"]> = {
  ASSET: "DEBIT",
  LIABILITY: "CREDIT",
  EQUITY: "CREDIT",
  REVENUE: "CREDIT",
  EXPENSE: "DEBIT"
};

const SEED_ACCOUNTS: Array<{ name: string; category: Account["category"] }> = [
  { name: "Cash on hand", category: "BANK" },
  { name: "Credit Card Payable", category: "CREDIT_CARD" },
  { name: "Charitable donations", category: "EQUITY" },
  { name: "Equity clearing (Credit Card Payment)", category: "EQUITY" },
  { name: "Equity clearing (Transfer)", category: "EQUITY" },
  { name: "Federal estimated tax", category: "EQUITY" },
  { name: "Federal tax", category: "EQUITY" },
  { name: "Health Savings Account", category: "EQUITY" },
  { name: "Health insurance premium", category: "EQUITY" },
  { name: "Mortgage", category: "EQUITY" },
  { name: "Owners investment", category: "EQUITY" },
  { name: "Owners pay", category: "EQUITY" },
  { name: "Personal expense", category: "EQUITY" },
  { name: "Personal income", category: "EQUITY" },
  { name: "Property tax", category: "EQUITY" },
  { name: "Retained Earnings", category: "EQUITY" },
  { name: "Retirement contributions", category: "EQUITY" },
  { name: "State estimated tax", category: "EQUITY" },
  { name: "State tax", category: "EQUITY" },
  { name: "Visits, copays, and prescriptions", category: "EQUITY" },
  { name: "Apps and software (> $200)", category: "FIXED_ASSET" },
  { name: "Building purchase", category: "FIXED_ASSET" },
  { name: "Computer (> $200)", category: "FIXED_ASSET" },
  { name: "Copier (> $200)", category: "FIXED_ASSET" },
  { name: "Furniture (> $200)", category: "FIXED_ASSET" },
  { name: "Land purchase", category: "FIXED_ASSET" },
  { name: "Machinery and equipment", category: "FIXED_ASSET" },
  { name: "Phone (> $200)", category: "FIXED_ASSET" },
  { name: "Photo and video equipment (> $200)", category: "FIXED_ASSET" },
  { name: "Tools and equipment (> $200)", category: "FIXED_ASSET" },
  { name: "Vehicle purchase", category: "FIXED_ASSET" },
  { name: "Business loan", category: "LONG_TERM_LIABILITY" },
  { name: "Mortgage principal (business property)", category: "LONG_TERM_LIABILITY" },
  { name: "Mortgage principal (home office)", category: "LONG_TERM_LIABILITY" },
  { name: "Vehicle loan", category: "LONG_TERM_LIABILITY" },
  { name: "Loans to others", category: "OTHER_CURRENT_ASSET" },
  { name: "Uncategorized Asset", category: "OTHER_CURRENT_ASSET" },
  { name: "Undeposited Funds", category: "OTHER_CURRENT_ASSET" },
  { name: "Sales tax to pay", category: "OTHER_CURRENT_LIABILITY" }
];

function buildMockData(): Store {
  const createdAt = nowIso();
  const accounts: Account[] = SEED_ACCOUNTS.map((seed, index) => ({
    id: createId(),
    code: (1000 + index * 10).toString(),
    name: seed.name,
    category: seed.category,
    currency: "USD",
    openingBalance: 0,
    currentBalance: 0,
    allowManualEntries: true,
    status: "ACTIVE",
    createdAt
  }));

  const chartAccounts: ChartOfAccount[] = accounts.map((account) => {
    const accountType = ACCOUNT_TYPE_BY_CATEGORY[account.category];
    return {
      id: account.id,
      accountNumber: account.code,
      name: account.name,
      accountType,
      normalBalance: NORMAL_BALANCE_BY_TYPE[accountType],
      isParent: false,
      isSystemAccount: false,
      allowsManualPostings: true,
      currency: account.currency,
      openingBalance: 0,
      currentBalance: 0,
      availableBalance: 0,
      status: "ACTIVE",
      createdAt
    };
  });

  return {
    accounts,
    chartAccounts,
    transactions: [],
    ledgerPostings: [],
    registerEntries: []
  };
}

function requireAccount(store: Store, accountId: string): Account {
  const account = store.accounts.find((item) => item.id === accountId);
  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }
  return account;
}

function ensureBalanced(postings: Transaction["postings"]): void {
  const debitTotal = postings
    .filter((posting) => posting.type === "DEBIT")
    .reduce((total, posting) => total + posting.amount, 0);
  const creditTotal = postings
    .filter((posting) => posting.type === "CREDIT")
    .reduce((total, posting) => total + posting.amount, 0);
  if (debitTotal !== creditTotal) {
    throw new Error("Total debits must equal total credits.");
  }
}

function ensureAccountsActive(store: Store, transaction: Transaction): void {
  transaction.postings.forEach((posting) => {
    const account = requireAccount(store, posting.accountId);
    if (account.status !== "ACTIVE") {
      throw new Error("Closed or archived accounts cannot receive transactions.");
    }
  });
}

function computeBalanceImpact(category: Account["category"], side: PostingEntryType, amount: number): number {
  if (DEBIT_NORMAL_CATEGORIES.has(category)) {
    return side === "DEBIT" ? amount : -amount;
  }
  return side === "CREDIT" ? amount : -amount;
}

function updateAccountBalances(store: Store, accountIds: string[]): void {
  const uniqueIds = [...new Set(accountIds)];
  uniqueIds.forEach((accountId) => {
    const account = requireAccount(store, accountId);
    const posted = store.ledgerPostings.filter(
      (posting) => posting.accountId === accountId && posting.status === "POSTED"
    );
    const base = account.openingBalance ?? 0;
    const impact = posted.reduce(
      (sum, posting) => sum + computeBalanceImpact(account.category, posting.entryType, posting.amount),
      0
    );
    account.currentBalance = base + impact;
    account.updatedAt = nowIso();

    const chart = store.chartAccounts.find((item) => item.id === account.id);
    if (chart) {
      chart.currentBalance = account.currentBalance;
      chart.availableBalance = account.currentBalance;
      chart.updatedAt = account.updatedAt;
    }

    emit({
      eventType: "AccountBalanceUpdated",
      accountId,
      currentBalance: account.currentBalance,
      updatedAt: account.updatedAt
    });
  });
}

function recalculateRunningBalances(store: Store, accountId: string): void {
  const account = requireAccount(store, accountId);
  const entries = store.registerEntries
    .filter((entry) => entry.accountId === accountId)
    .sort((a, b) =>
      `${a.date}-${a.createdAt}`.localeCompare(`${b.date}-${b.createdAt}`)
    );

  let running = account.openingBalance ?? 0;
  entries.forEach((entry) => {
    running = running + (entry.deposit ?? 0) - (entry.payment ?? 0);
    entry.runningBalance = running;
  });
}

function createRegisterEntries(store: Store, transaction: Transaction): void {
  const perAccount = new Map<string, { payment: number; deposit: number }>();
  transaction.postings.forEach((posting) => {
    const current = perAccount.get(posting.accountId) ?? { payment: 0, deposit: 0 };
    if (posting.type === "DEBIT") {
      current.deposit += posting.amount;
    } else {
      current.payment += posting.amount;
    }
    perAccount.set(posting.accountId, current);
  });

  perAccount.forEach((value, accountId) => {
    const counterpartyAccountNames = [
      ...new Set(
        transaction.postings
          .filter((posting) => posting.accountId !== accountId)
          .map((posting) => requireAccount(store, posting.accountId).name)
      )
    ];
    const displayAccountLabel =
      transaction.sourceAccountId === accountId
        ? transaction.accountLabel ?? counterpartyAccountNames[0]
        : counterpartyAccountNames[0];

    const entry: RegisterEntry = {
      id: createId(),
      accountId,
      transactionId: transaction.id,
      transactionType: transaction.type,
      refNumber: transaction.referenceNumber,
      payee: transaction.payee,
      accountLabel: displayAccountLabel,
      memo: transaction.memo,
      payment: value.payment > 0 ? value.payment : undefined,
      deposit: value.deposit > 0 ? value.deposit : undefined,
      runningBalance: 0,
      postedAt: nowIso(),
      date: transaction.transactionDate,
      status: transaction.status,
      createdBy: transaction.createdBy ?? "system",
      createdAt: nowIso()
    };
    store.registerEntries.push(entry);
    recalculateRunningBalances(store, accountId);
  });
}

function postingFiscalPeriod(date: string): string {
  return date.slice(0, 7);
}

export class MockAccountService implements AccountService {
  constructor(private readonly store: Store) {}

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const exists = this.store.accounts.find((account) => account.code === input.code);
    if (exists) {
      throw new Error("Account code must be unique.");
    }
    const createdAt = nowIso();
    const account: Account = {
      id: createId(),
      code: input.code,
      name: input.name,
      category: input.category,
      subtype: input.subtype,
      currency: input.currency ?? "USD",
      openingBalance: input.openingBalance ?? 0,
      currentBalance: input.openingBalance ?? 0,
      allowManualEntries: true,
      status: "ACTIVE",
      createdAt
    };
    this.store.accounts.push(account);
    return account;
  }

  async updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
    const account = requireAccount(this.store, id);
    Object.assign(account, input, { updatedAt: nowIso() });
    return account;
  }

  async closeAccount(id: string): Promise<void> {
    const account = requireAccount(this.store, id);
    account.status = "CLOSED";
    account.updatedAt = nowIso();
  }

  async getAccountById(id: string): Promise<Account> {
    return requireAccount(this.store, id);
  }

  async listAccounts(): Promise<Account[]> {
    return [...this.store.accounts];
  }

  async getAccountHierarchy(): Promise<AccountHierarchy> {
    return this.store.chartAccounts.map((account) => ({
      ...account,
      children: this.store.chartAccounts.filter((candidate) => candidate.parentAccountId === account.id)
    }));
  }
}

export class MockLedgerService implements LedgerService {
  constructor(private readonly store: Store) {}

  async getPostingsByTransactionId(transactionId: string): Promise<LedgerPosting[]> {
    return this.store.ledgerPostings.filter((posting) => posting.transactionId === transactionId);
  }

  async listPostings(): Promise<LedgerPosting[]> {
    return [...this.store.ledgerPostings];
  }
}

export class MockTransactionService implements TransactionService {
  constructor(private readonly store: Store) {}

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const transaction: Transaction = {
      id: createId(),
      type: input.type,
      status: "DRAFT",
      transactionDate: input.transactionDate,
      referenceNumber: input.referenceNumber,
      memo: input.memo,
      payee: input.payee,
      accountLabel: input.accountLabel,
      sourceAccountId: input.sourceAccountId,
      postings: input.postings,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: "user"
    };
    this.store.transactions.push(transaction);

    emit({
      eventType: "TransactionCreated",
      transactionId: transaction.id,
      transactionType: transaction.type,
      status: "DRAFT",
      createdAt: transaction.createdAt ?? nowIso()
    });

    return transaction;
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const transaction = this.store.transactions.find((item) => item.id === id);
    if (!transaction) {
      throw new Error(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async listTransactions(): Promise<Transaction[]> {
    return [...this.store.transactions];
  }

  async postTransaction(id: string): Promise<Transaction> {
    const transaction = await this.getTransactionById(id);
    if (transaction.status !== "DRAFT") {
      throw new Error("Only DRAFT transactions can be posted.");
    }
    ensureAccountsActive(this.store, transaction);
    ensureBalanced(transaction.postings);

    const createdAt = nowIso();
    const postings: LedgerPosting[] = transaction.postings.map((posting) => {
      const account = requireAccount(this.store, posting.accountId);
      return {
        id: createId(),
        transactionId: transaction.id,
        accountId: posting.accountId,
        accountCode: account.code,
        accountName: account.name,
        entryType: posting.type,
        amount: posting.amount,
        currency: account.currency,
        exchangeRate: 1,
        postingDate: transaction.transactionDate,
        fiscalPeriod: postingFiscalPeriod(transaction.transactionDate),
        memo: transaction.memo,
        referenceNumber: transaction.referenceNumber,
        sourceDocumentType: transaction.type,
        sourceDocumentId: transaction.id,
        reconciliationStatus: "UNRECONCILED",
        status: "POSTED",
        createdBy: transaction.createdBy,
        createdAt,
        postedAt: createdAt
      };
    });

    transaction.status = "POSTED";
    transaction.postedAt = createdAt;
    transaction.updatedAt = createdAt;
    this.store.ledgerPostings.push(...postings);

    createRegisterEntries(this.store, transaction);
    updateAccountBalances(
      this.store,
      postings.map((posting) => posting.accountId)
    );

    emit({
      eventType: "LedgerPostingsCreated",
      transactionId: transaction.id,
      postings,
      createdAt
    });
    emit({ eventType: "TransactionPosted", transactionId: transaction.id, postedAt: createdAt });

    return transaction;
  }

  async voidTransaction(id: string): Promise<Transaction> {
    const original = await this.getTransactionById(id);
    if (original.status === "VOIDED") {
      throw new Error("Transaction is already voided.");
    }

    if (original.status === "DRAFT") {
      original.status = "VOIDED";
      original.voidedAt = nowIso();
      original.updatedAt = original.voidedAt;
      emit({ eventType: "TransactionVoided", transactionId: id, voidedAt: original.voidedAt });
      return original;
    }

    if (original.status !== "POSTED") {
      throw new Error("Only DRAFT or POSTED transactions can be voided.");
    }

    const voidTx = await this.createTransaction({
      type: original.type,
      transactionDate: todayIsoDate(),
      memo: `VOID of ${original.id}`,
      payee: original.payee,
      referenceNumber: original.referenceNumber,
      postings: original.postings.map((posting) => ({
        accountId: posting.accountId,
        type: posting.type === "DEBIT" ? "CREDIT" : "DEBIT",
        amount: posting.amount
      }))
    });
    await this.postTransaction(voidTx.id);
    voidTx.status = "VOIDED";
    voidTx.voidedAt = nowIso();
    voidTx.referenceOriginalTransactionId = original.id;
    original.status = "VOIDED";
    original.voidedAt = voidTx.voidedAt;
    original.updatedAt = voidTx.voidedAt;

    emit({ eventType: "LedgerVoidCreated", transactionId: voidTx.id, createdAt: voidTx.voidedAt });
    emit({ eventType: "TransactionVoided", transactionId: original.id, voidedAt: original.voidedAt });
    return original;
  }

  async reverseTransaction(id: string): Promise<Transaction> {
    const original = await this.getTransactionById(id);
    if (original.status !== "POSTED") {
      throw new Error("Only POSTED transactions can be reversed.");
    }
    if (original.reversedAt) {
      throw new Error("Transaction has already been reversed.");
    }

    const reversal = await this.createTransaction({
      type: original.type,
      transactionDate: todayIsoDate(),
      memo: `REVERSAL of ${original.id}`,
      payee: original.payee,
      referenceNumber: original.referenceNumber,
      postings: original.postings.map((posting) => ({
        accountId: posting.accountId,
        type: posting.type === "DEBIT" ? "CREDIT" : "DEBIT",
        amount: posting.amount
      }))
    });
    await this.postTransaction(reversal.id);
    const reversedAt = nowIso();
    original.reversedAt = reversedAt;
    original.updatedAt = reversedAt;
    reversal.referenceOriginalTransactionId = original.id;

    emit({
      eventType: "TransactionReversed",
      transactionId: reversal.id,
      reversedAt,
      referenceOriginalTransactionId: original.id
    });
    emit({ eventType: "LedgerReversalCreated", transactionId: reversal.id, createdAt: reversedAt });
    return reversal;
  }

  async createDeposit(input: Omit<CreateTransactionInput, "type">): Promise<Transaction> {
    const transaction = await this.createTransaction({ ...input, type: "DEPOSIT" });
    return this.postTransaction(transaction.id);
  }

  async createTransfer(input: Omit<CreateTransactionInput, "type">): Promise<Transaction> {
    const accounts = new Set(input.postings.map((posting) => posting.accountId));
    if (accounts.size < 2) {
      throw new Error("Transfers require source and destination accounts.");
    }
    const transaction = await this.createTransaction({ ...input, type: "TRANSFER" });
    return this.postTransaction(transaction.id);
  }
}

export class MockRegisterService implements RegisterService {
  constructor(private readonly store: Store) {}

  async listRegisterEntries(accountId: string): Promise<RegisterEntry[]> {
    return this.store.registerEntries
      .filter((entry) => entry.accountId === accountId)
      .sort((a, b) => `${b.date}-${b.createdAt}`.localeCompare(`${a.date}-${a.createdAt}`));
  }

  async getTransactionDetail(transactionId: string): Promise<{
    transaction: Transaction;
    postings: LedgerPosting[];
    registerEntries: RegisterEntry[];
  }> {
    const transaction = this.store.transactions.find((item) => item.id === transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    return {
      transaction,
      postings: this.store.ledgerPostings.filter((posting) => posting.transactionId === transactionId),
      registerEntries: this.store.registerEntries.filter((entry) => entry.transactionId === transactionId)
    };
  }

  async updateRegisterEntry(
    entryId: string,
    input: Pick<RegisterEntry, "date" | "refNumber" | "payee" | "memo"> & {
      payment?: number;
      deposit?: number;
    }
  ): Promise<RegisterEntry> {
    const entry = this.store.registerEntries.find((item) => item.id === entryId);
    if (!entry) {
      throw new Error(`Register entry ${entryId} not found`);
    }
    if ((input.payment ?? 0) > 0 && (input.deposit ?? 0) > 0) {
      throw new Error("Register entry cannot contain both payment and deposit.");
    }

    entry.date = input.date;
    entry.refNumber = input.refNumber;
    entry.payee = input.payee;
    entry.memo = input.memo;
    entry.payment = input.payment && input.payment > 0 ? input.payment : undefined;
    entry.deposit = input.deposit && input.deposit > 0 ? input.deposit : undefined;

    const transaction = this.store.transactions.find((item) => item.id === entry.transactionId);
    if (transaction) {
      transaction.transactionDate = input.date;
      transaction.referenceNumber = input.refNumber;
      transaction.payee = input.payee;
      transaction.memo = input.memo;
      transaction.updatedAt = nowIso();
    }

    this.store.ledgerPostings
      .filter((posting) => posting.transactionId === entry.transactionId)
      .forEach((posting) => {
        posting.postingDate = input.date;
        posting.referenceNumber = input.refNumber;
        posting.memo = input.memo;
      });

    recalculateRunningBalances(this.store, entry.accountId);
    const accountEntries = this.store.registerEntries
      .filter((item) => item.accountId === entry.accountId)
      .sort((a, b) => `${b.date}-${b.createdAt}`.localeCompare(`${a.date}-${a.createdAt}`));
    const account = requireAccount(this.store, entry.accountId);
    account.currentBalance = accountEntries[0]?.runningBalance ?? account.openingBalance ?? 0;
    account.updatedAt = nowIso();
    emit({
      eventType: "AccountBalanceUpdated",
      accountId: account.id,
      currentBalance: account.currentBalance,
      updatedAt: account.updatedAt
    });

    return entry;
  }

  async deleteRegisterEntry(entryId: string): Promise<RegisterEntry> {
    const entryIndex = this.store.registerEntries.findIndex((item) => item.id === entryId);
    if (entryIndex === -1) {
      throw new Error(`Register entry ${entryId} not found`);
    }
    const entry = this.store.registerEntries[entryIndex];
    const accountId = entry.accountId;

    // Remove row from the register table data source.
    this.store.registerEntries.splice(entryIndex, 1);

    // Rebuild running balances from remaining rows.
    recalculateRunningBalances(this.store, accountId);

    // Keep selected account balance in sync with the remaining rows.
    const account = requireAccount(this.store, accountId);
    const accountEntries = this.store.registerEntries
      .filter((item) => item.accountId === accountId)
      .sort((a, b) => `${b.date}-${b.createdAt}`.localeCompare(`${a.date}-${a.createdAt}`));
    account.currentBalance = accountEntries[0]?.runningBalance ?? account.openingBalance ?? 0;
    account.updatedAt = nowIso();

    const chart = this.store.chartAccounts.find((item) => item.id === accountId);
    if (chart) {
      chart.currentBalance = account.currentBalance;
      chart.availableBalance = account.currentBalance;
      chart.updatedAt = account.updatedAt;
    }

    emit({
      eventType: "AccountBalanceUpdated",
      accountId,
      currentBalance: account.currentBalance,
      updatedAt: account.updatedAt
    });

    const transaction = this.store.transactions.find((item) => item.id === entry.transactionId);
    if (transaction) {
      transaction.status = "DELETED";
      transaction.updatedAt = nowIso();
    }

    return entry;
  }
}

export function createMockAccountingServices() {
  const store = buildMockData();
  return {
    accountService: new MockAccountService(store),
    ledgerService: new MockLedgerService(store),
    transactionService: new MockTransactionService(store),
    registerService: new MockRegisterService(store)
  };
}
