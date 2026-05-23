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

  useEffect(() => {
    const selectedSupported = availableTransactionTypes.some(
      (transactionType) => transactionType.id === selectedTransactionType
    );
    if (!selectedSupported && availableTransactionTypes.length > 0) {
      setSelectedTransactionType(availableTransactionTypes[0].id);
    }
  }, [availableTransactionTypes, selectedTransactionType]);

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
    async (transactionTypeId: BankRegisterTransactionTypeId) => {
      if (!selectedAccountId) {
        setError("Select an account first.");
        return;
      }

      const amount = 100;
      const selectedTypeLabel =
        availableTransactionTypes.find((option) => option.id === transactionTypeId)?.label ??
        transactionTypeId.replaceAll("_", " ");
      const payee = `${selectedTypeLabel} Counterparty`;
      const memo = `Auto ${selectedTypeLabel}`;
      const referenceNumber = `TX-${Math.floor(Math.random() * 100000)}`;
      const domainTransactionType = toDomainTransactionType(transactionTypeId);

      try {
        if (transactionTypeId === "TRANSFER") {
          const destination = accounts.find((account) => account.id !== selectedAccountId);
          if (!destination) {
            setError("Need at least two accounts for transfers.");
            return;
          }
          await services.transactionService.createTransfer({
            transactionDate: new Date().toISOString().slice(0, 10),
            referenceNumber,
            memo,
            payee,
            postings: [
              { accountId: destination.id, type: "DEBIT", amount },
              { accountId: selectedAccountId, type: "CREDIT", amount }
            ]
          });
        } else if (isInflowTransactionType(transactionTypeId)) {
          const incomeAccount =
            findCounterpartyAccount(accounts, selectedAccountId, [
              "Personal income",
              "Owners investment",
              "Retained Earnings"
            ]) ?? accounts[0];
          if (domainTransactionType === "DEPOSIT") {
            await services.transactionService.createDeposit({
              transactionDate: new Date().toISOString().slice(0, 10),
              referenceNumber,
              memo,
              payee,
              postings: [
                { accountId: selectedAccountId, type: "DEBIT", amount },
                { accountId: incomeAccount.id, type: "CREDIT", amount }
              ]
            });
          } else {
            const transaction = await services.transactionService.createTransaction({
              type: domainTransactionType,
              transactionDate: new Date().toISOString().slice(0, 10),
              referenceNumber,
              memo,
              payee,
              postings: [
                { accountId: selectedAccountId, type: "DEBIT", amount },
                { accountId: incomeAccount.id, type: "CREDIT", amount }
              ]
            });
            await services.transactionService.postTransaction(transaction.id);
          }
        } else {
          const expenseOrOffset =
            findCounterpartyAccount(accounts, selectedAccountId, [
              "Personal expense",
              "Charitable donations",
              "Retained Earnings"
            ]) ?? accounts[0];
          const selectedPostingType = isOutflowTransactionType(transactionTypeId) ? "CREDIT" : "DEBIT";
          const offsetPostingType = selectedPostingType === "CREDIT" ? "DEBIT" : "CREDIT";
          const transaction = await services.transactionService.createTransaction({
            type: domainTransactionType,
            transactionDate: new Date().toISOString().slice(0, 10),
            referenceNumber,
            memo,
            payee,
            postings: [
              { accountId: expenseOrOffset.id, type: offsetPostingType, amount },
              { accountId: selectedAccountId, type: selectedPostingType, amount }
            ]
          });
          await services.transactionService.postTransaction(transaction.id);
        }
        setError(null);
      } catch (value: unknown) {
        setError(value instanceof Error ? value.message : "Failed to create transaction.");
      }
    },
    [accounts, availableTransactionTypes, selectedAccountId, services.transactionService]
  );

  const addSelectedTransaction = useCallback(async () => {
    await addTransaction(selectedTransactionType);
  }, [addTransaction, selectedTransactionType]);

  const selectTransactionType = useCallback(
    async (transactionTypeId: BankRegisterTransactionTypeId) => {
      setSelectedTransactionType(transactionTypeId);
      await addTransaction(transactionTypeId);
    },
    [addTransaction]
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
    error,
    setSelectedAccountId,
    addSelectedTransaction,
    selectTransactionType,
    selectTransaction,
    voidTransaction,
    reverseTransaction
  };
}
