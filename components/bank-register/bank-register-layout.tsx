"use client";

import { AccountSelector } from "@/components/bank-register/account-selector";
import { ActionToolbar } from "@/components/bank-register/action-toolbar";
import { DetailPanel } from "@/components/bank-register/detail-panel";
import { RegisterTable } from "@/components/bank-register/register-table";
import { useBankRegister } from "@/modules/accounting/presentation/hooks/use-bank-register";

export function BankRegisterLayout() {
  const {
    accounts,
    availableTransactionTypes,
    entries,
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
  } = useBankRegister();

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Bank Register</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ledger-first view with event-driven updates and immutable transaction history.
        </p>
        <div className="mt-4 inline-flex min-w-64 items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="text-sm font-medium text-emerald-900">Balance General</span>
          <span className="text-lg font-semibold text-emerald-800">
            {generalBalance.toLocaleString("en-US", {
              style: "currency",
              currency: "USD"
            })}
          </span>
        </div>
      </header>

      <div className="space-y-4">
        <AccountSelector
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onChange={setSelectedAccountId}
        />
        <ActionToolbar
          availableTransactionTypes={availableTransactionTypes}
          selectedTransactionType={selectedTransactionType}
          onAddSelectedTransaction={addSelectedTransaction}
          onSelectTransactionType={selectTransactionType}
        />
        {selectedAccount ? (
          <p className="text-xs text-slate-500">
            Transaction types for {selectedAccount.name} ({selectedAccount.category.toLowerCase().replaceAll("_", " ")}).
          </p>
        ) : null}
        {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RegisterTable
          entries={entries}
          onSelect={selectTransaction}
          draftTransaction={draftTransaction}
          draftErrors={draftErrors}
          draftBalancePreview={draftBalancePreview}
          isSavingDraft={isSavingDraft}
          onDraftFieldChange={updateDraftField}
          onDraftSave={saveDraftTransaction}
          onDraftCancel={cancelDraftTransaction}
        />
        <DetailPanel
          transaction={selectedTransaction}
          postings={selectedPostings}
          onVoid={voidTransaction}
          onReverse={reverseTransaction}
        />
      </section>
    </main>
  );
}
