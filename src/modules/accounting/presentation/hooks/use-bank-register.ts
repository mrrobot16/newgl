"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getServiceContainer } from "@/lib/services/service-container";
import { ledgerEventBus } from "@/shared/event-bus";
import type {
  Account,
  LedgerPosting,
  RegisterEntry,
  Transaction,
  TransactionType
} from "@/modules/accounting/domain/models";

type TransactionAction = "CHECK" | "DEPOSIT" | "EXPENSE" | "TRANSFER" | "JOURNAL_ENTRY";

function mapActionToTransactionType(action: TransactionAction): TransactionType {
  if (action === "CHECK") {
    return "EXPENSE";
  }
  return action;
}

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
  const [entries, setEntries] = useState<RegisterEntry[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPostings, setSelectedPostings] = useState<LedgerPosting[]>([]);
  const [error, setError] = useState<string | null>(null);
  const generalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.currentBalance, 0),
    [accounts]
  );

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

  const addTransaction = useCallback(
    async (action: TransactionAction) => {
      if (!selectedAccountId) {
        setError("Select an account first.");
        return;
      }

      const amountRaw = window.prompt(`${action} amount`, "100");
      if (!amountRaw) {
        return;
      }
      const amount = Number(amountRaw);
      if (!Number.isFinite(amount) || amount <= 0) {
        setError("Amount must be greater than 0.");
        return;
      }
      const payee = window.prompt("Payee / Counterparty", "Vendor");
      const memo = window.prompt("Memo", `${action} from toolbar`);
      const referenceNumber = `TX-${Math.floor(Math.random() * 100000)}`;

      try {
        if (action === "DEPOSIT") {
          const incomeAccount =
            findCounterpartyAccount(accounts, selectedAccountId, [
              "Personal income",
              "Owners investment",
              "Retained Earnings"
            ]) ?? accounts[0];
          await services.transactionService.createDeposit({
            transactionDate: new Date().toISOString().slice(0, 10),
            referenceNumber,
            memo: memo ?? undefined,
            payee: payee ?? undefined,
            postings: [
              { accountId: selectedAccountId, type: "DEBIT", amount },
              { accountId: incomeAccount.id, type: "CREDIT", amount }
            ]
          });
        } else if (action === "TRANSFER") {
          const destination = accounts.find((account) => account.id !== selectedAccountId);
          if (!destination) {
            setError("Need at least two accounts for transfers.");
            return;
          }
          await services.transactionService.createTransfer({
            transactionDate: new Date().toISOString().slice(0, 10),
            referenceNumber,
            memo: memo ?? undefined,
            payee: payee ?? undefined,
            postings: [
              { accountId: destination.id, type: "DEBIT", amount },
              { accountId: selectedAccountId, type: "CREDIT", amount }
            ]
          });
        } else {
          const expenseOrOffset =
            findCounterpartyAccount(accounts, selectedAccountId, [
              "Personal expense",
              "Charitable donations",
              "Retained Earnings"
            ]) ?? accounts[0];
          const transaction = await services.transactionService.createTransaction({
            type: mapActionToTransactionType(action),
            transactionDate: new Date().toISOString().slice(0, 10),
            referenceNumber,
            memo: memo ?? undefined,
            payee: payee ?? undefined,
            postings: [
              { accountId: expenseOrOffset.id, type: "DEBIT", amount },
              { accountId: selectedAccountId, type: "CREDIT", amount }
            ]
          });
          await services.transactionService.postTransaction(transaction.id);
        }
        setError(null);
      } catch (value: unknown) {
        setError(value instanceof Error ? value.message : "Failed to create transaction.");
      }
    },
    [accounts, selectedAccountId, services.transactionService]
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
    generalBalance,
    selectedAccountId,
    selectedTransaction,
    selectedPostings,
    error,
    setSelectedAccountId,
    addTransaction,
    selectTransaction,
    voidTransaction,
    reverseTransaction
  };
}
