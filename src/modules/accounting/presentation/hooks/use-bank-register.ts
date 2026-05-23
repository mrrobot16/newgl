"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getServiceContainer } from "@/lib/services/service-container";
import { ledgerEventBus } from "@/shared/event-bus";
import type {
  Account,
  LedgerPosting,
  RegisterEntry,
  Transaction
} from "@/modules/accounting/domain/models";
import {
  getSupportedTransactionTypesForAccount,
  isInflowTransactionType,
  isOutflowTransactionType,
  toDomainTransactionType
} from "@/modules/accounting/presentation/transaction-type-policy";
import type {
  BankRegisterTransactionTypeId,
  BankRegisterTransactionTypeOption
} from "@/modules/accounting/presentation/transaction-type-policy";

export type DraftTransactionForm = {
  transactionTypeId: BankRegisterTransactionTypeId;
  transactionTypeLabel: string;
  date: string;
  refNo: string;
  payee: string;
  accountTypeLabel: string;
  memo: string;
  payment: string;
  deposit: string;
};

export type DraftTransactionErrors = Partial<
  Record<"date" | "payee" | "accountTypeLabel" | "payment" | "deposit" | "amount" | "form", string>
>;

function findCounterpartyAccount(
  accounts: Account[],
  selectedAccountId: string,
  preferredNames: string[]
): Account | undefined {
  return (
    preferredNames
      .map((name) => accounts.find((account) => account.name === name))
      .find((account): account is Account => Boolean(account && account.id !== selectedAccountId)) ??
    accounts.find((account) => account.id !== selectedAccountId)
  );
}

export function useBankRegister() {
  const services = useMemo(() => getServiceContainer(), []);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<BankRegisterTransactionTypeId>("CHECK");
  const [draftTransaction, setDraftTransaction] = useState<DraftTransactionForm | null>(null);
  const [draftErrors, setDraftErrors] = useState<DraftTransactionErrors>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [entries, setEntries] = useState<RegisterEntry[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPostings, setSelectedPostings] = useState<LedgerPosting[]>([]);
  const [error, setError] = useState<string | null>(null);
  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId),
    [accounts, selectedAccountId]
  );
  const availableTransactionTypes = useMemo<BankRegisterTransactionTypeOption[]>(
    () => getSupportedTransactionTypesForAccount(selectedAccount),
    [selectedAccount]
  );
  const generalBalance = useMemo(() => {
    if (entries.length > 0) {
      return entries[0].runningBalance;
    }
    if (selectedAccount) {
      return selectedAccount.currentBalance;
    }
    return 0;
  }, [entries, selectedAccount]);
  const draftBalancePreview = useMemo(() => {
    if (!draftTransaction || !selectedAccount) {
      return null;
    }
    const latestRunningBalance = entries.length > 0 ? entries[0].runningBalance : selectedAccount.openingBalance ?? 0;
    const payment = Number(draftTransaction.payment || 0);
    const deposit = Number(draftTransaction.deposit || 0);
    return latestRunningBalance + deposit - payment;
  }, [draftTransaction, entries, selectedAccount]);

  const refreshAccounts = useCallback(async () => {
    const accountList = await services.accountService.listAccounts();
    setAccounts(accountList);
    if (!selectedAccountId && accountList.length > 0) {
      setSelectedAccountId(accountList[0].id);
    }
  }, [selectedAccountId, services.accountService]);

  const refreshEntries = useCallback(async () => {
    if (!selectedAccountId) {
      setEntries([]);
      return;
    }
    const registerEntries = await services.registerService.listRegisterEntries(selectedAccountId);
    setEntries(registerEntries);
  }, [selectedAccountId, services.registerService]);

  useEffect(() => {
    refreshAccounts().catch((value: unknown) => {
      setError(value instanceof Error ? value.message : "Failed to load accounts.");
    });
  }, [refreshAccounts]);

  useEffect(() => {
    refreshEntries().catch((value: unknown) => {
      setError(value instanceof Error ? value.message : "Failed to load register entries.");
    });
  }, [refreshEntries]);

  useEffect(() => {
    const unsubscribe = ledgerEventBus.subscribe("*", () => {
      refreshAccounts().catch(() => undefined);
      refreshEntries().catch(() => undefined);
    });
    return unsubscribe;
  }, [refreshAccounts, refreshEntries]);

  useEffect(() => {
    const selectedSupported = availableTransactionTypes.some(
      (transactionType) => transactionType.id === selectedTransactionType
    );
    if (!selectedSupported && availableTransactionTypes.length > 0) {
      setSelectedTransactionType(availableTransactionTypes[0].id);
    }
  }, [availableTransactionTypes, selectedTransactionType]);

  useEffect(() => {
    setDraftTransaction(null);
    setDraftErrors({});
  }, [selectedAccountId]);

  const startDraftTransaction = useCallback(
    (transactionTypeId: BankRegisterTransactionTypeId) => {
      if (!selectedAccountId) {
        setError("Select an account first.");
        return;
      }
      const selectedTypeLabel =
        availableTransactionTypes.find((option) => option.id === transactionTypeId)?.label ??
        transactionTypeId.replaceAll("_", " ");
      setSelectedTransactionType(transactionTypeId);
      setDraftTransaction({
        transactionTypeId,
        transactionTypeLabel: selectedTypeLabel,
        date: new Date().toISOString().slice(0, 10),
        refNo: `TX-${Math.floor(Math.random() * 100000)}`,
        payee: "",
        accountTypeLabel: "",
        memo: "",
        payment: "",
        deposit: ""
      });
      setDraftErrors({});
      setError(null);
    },
    [availableTransactionTypes, selectedAccountId]
  );

  const updateDraftField = useCallback(
    (field: keyof Omit<DraftTransactionForm, "transactionTypeId" | "transactionTypeLabel">, value: string) => {
      setDraftTransaction((current) => (current ? { ...current, [field]: value } : current));
      setDraftErrors((current) => ({ ...current, [field]: undefined, amount: undefined, form: undefined }));
    },
    []
  );

  const cancelDraftTransaction = useCallback(() => {
    setDraftTransaction(null);
    setDraftErrors({});
  }, []);

  const selectTransaction = useCallback(
    async (transactionId: string) => {
      try {
        const detail = await services.registerService.getTransactionDetail(transactionId);
        setSelectedTransaction(detail.transaction);
        setSelectedPostings(detail.postings);
        setError(null);
      } catch (value: unknown) {
        setError(value instanceof Error ? value.message : "Unable to load transaction detail.");
      }
    },
    [services.registerService]
  );

  const saveDraftTransaction = useCallback(async () => {
    if (!draftTransaction || !selectedAccountId || isSavingDraft) {
      return;
    }

    const payment = Number(draftTransaction.payment || 0);
    const deposit = Number(draftTransaction.deposit || 0);
    const amount = deposit > 0 ? deposit : payment;
    const errors: DraftTransactionErrors = {};

    if (!draftTransaction.date) {
      errors.date = "Date is required.";
    }
    if (!draftTransaction.payee.trim()) {
      errors.payee = "Payee is required.";
    }
    if (!draftTransaction.accountTypeLabel.trim()) {
      errors.accountTypeLabel = "Account type text is required.";
    }
    if (payment > 0 && deposit > 0) {
      errors.amount = "Use payment or deposit, not both.";
    }
    if (payment <= 0 && deposit <= 0) {
      errors.amount = "Enter payment or deposit.";
    }
    if (payment < 0 || deposit < 0) {
      errors.amount = "Amounts must be positive.";
    }
    if (isInflowTransactionType(draftTransaction.transactionTypeId) && payment > 0) {
      errors.payment = "This transaction type expects a deposit.";
    }
    if (isOutflowTransactionType(draftTransaction.transactionTypeId) && deposit > 0) {
      errors.deposit = "This transaction type expects a payment.";
    }

    if (Object.keys(errors).length > 0) {
      setDraftErrors(errors);
      return;
    }

    const referenceNumber = draftTransaction.refNo.trim() || `TX-${Math.floor(Math.random() * 100000)}`;
    const domainTransactionType = toDomainTransactionType(draftTransaction.transactionTypeId);

    const counterpartyFromTypedName = accounts.find(
      (account) =>
        account.id !== selectedAccountId &&
        account.name.toLowerCase() === draftTransaction.accountTypeLabel.trim().toLowerCase()
    );

    try {
      setIsSavingDraft(true);
      if (draftTransaction.transactionTypeId === "TRANSFER") {
        const destination =
          counterpartyFromTypedName ?? accounts.find((account) => account.id !== selectedAccountId);
        if (!destination) {
          setDraftErrors({ form: "Need at least two accounts for transfers." });
          return;
        }

        const selectedIsDestination = deposit > 0;
        await services.transactionService.createTransfer({
          transactionDate: draftTransaction.date,
          referenceNumber,
          memo: draftTransaction.memo.trim() || undefined,
          payee: draftTransaction.payee.trim(),
          postings: selectedIsDestination
            ? [
                { accountId: selectedAccountId, type: "DEBIT", amount },
                { accountId: destination.id, type: "CREDIT", amount }
              ]
            : [
                { accountId: destination.id, type: "DEBIT", amount },
                { accountId: selectedAccountId, type: "CREDIT", amount }
              ]
        });
      } else if (isInflowTransactionType(draftTransaction.transactionTypeId)) {
        const incomeAccount =
          counterpartyFromTypedName ??
          findCounterpartyAccount(accounts, selectedAccountId, [
            "Personal income",
            "Owners investment",
            "Retained Earnings"
          ]) ??
          accounts[0];

        if (domainTransactionType === "DEPOSIT") {
          await services.transactionService.createDeposit({
            transactionDate: draftTransaction.date,
            referenceNumber,
            memo: draftTransaction.memo.trim() || undefined,
            payee: draftTransaction.payee.trim(),
            postings: [
              { accountId: selectedAccountId, type: "DEBIT", amount },
              { accountId: incomeAccount.id, type: "CREDIT", amount }
            ]
          });
        } else {
          const transaction = await services.transactionService.createTransaction({
            type: domainTransactionType,
            transactionDate: draftTransaction.date,
            referenceNumber,
            memo: draftTransaction.memo.trim() || undefined,
            payee: draftTransaction.payee.trim(),
            postings: [
              { accountId: selectedAccountId, type: "DEBIT", amount },
              { accountId: incomeAccount.id, type: "CREDIT", amount }
            ]
          });
          await services.transactionService.postTransaction(transaction.id);
        }
      } else {
        const expenseOrOffset =
          counterpartyFromTypedName ??
          findCounterpartyAccount(accounts, selectedAccountId, [
            "Personal expense",
            "Charitable donations",
            "Retained Earnings"
          ]) ??
          accounts[0];
        const selectedPostingType = payment > 0 ? "CREDIT" : "DEBIT";
        const offsetPostingType = selectedPostingType === "CREDIT" ? "DEBIT" : "CREDIT";
        const transaction = await services.transactionService.createTransaction({
          type: domainTransactionType,
          transactionDate: draftTransaction.date,
          referenceNumber,
          memo: draftTransaction.memo.trim() || undefined,
          payee: draftTransaction.payee.trim(),
          postings: [
            { accountId: expenseOrOffset.id, type: offsetPostingType, amount },
            { accountId: selectedAccountId, type: selectedPostingType, amount }
          ]
        });
        await services.transactionService.postTransaction(transaction.id);
      }

      setDraftTransaction(null);
      setDraftErrors({});
      setError(null);
    } catch (value: unknown) {
      setDraftErrors({
        form: value instanceof Error ? value.message : "Failed to create transaction."
      });
    } finally {
      setIsSavingDraft(false);
    }
  }, [accounts, draftTransaction, isSavingDraft, selectedAccountId, services.transactionService]);

  const addSelectedTransaction = useCallback(() => {
    startDraftTransaction(selectedTransactionType);
  }, [selectedTransactionType, startDraftTransaction]);

  const selectTransactionType = useCallback(
    (transactionTypeId: BankRegisterTransactionTypeId) => {
      setSelectedTransactionType(transactionTypeId);
      startDraftTransaction(transactionTypeId);
    },
    [startDraftTransaction]
  );

  const voidTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await services.transactionService.voidTransaction(transactionId);
        setSelectedTransaction(null);
        setSelectedPostings([]);
        setError(null);
      } catch (value: unknown) {
        setError(value instanceof Error ? value.message : "Void failed.");
      }
    },
    [services.transactionService]
  );

  const reverseTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await services.transactionService.reverseTransaction(transactionId);
        setSelectedTransaction(null);
        setSelectedPostings([]);
        setError(null);
      } catch (value: unknown) {
        setError(value instanceof Error ? value.message : "Reversal failed.");
      }
    },
    [services.transactionService]
  );

  return {
    accounts,
    entries,
    availableTransactionTypes,
    generalBalance,
    selectedAccountId,
    selectedAccount,
    selectedTransaction,
    selectedTransactionType,
    selectedPostings,
    draftBalancePreview,
    draftErrors,
    draftTransaction,
    error,
    isSavingDraft,
    setSelectedAccountId,
    addSelectedTransaction,
    cancelDraftTransaction,
    selectTransactionType,
    saveDraftTransaction,
    selectTransaction,
    updateDraftField,
    voidTransaction,
    reverseTransaction
  };
}
