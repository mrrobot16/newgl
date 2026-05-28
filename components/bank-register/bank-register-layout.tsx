"use client";

import { AccountSelector } from "@/components/bank-register/account-selector";
import { ActionToolbar } from "@/components/bank-register/action-toolbar";
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
    selectedTransactionType,
    draftErrors,
    draftTransaction,
    error,
    isSavingDraft,
    setSelectedAccountId,
    addSelectedTransaction,
    cancelDraftTransaction,
    deleteRegisterEntryInline,
    selectTransactionType,
    saveDraftTransaction,
    updateRegisterEntryInline,
    updateDraftField,
  } = useBankRegister();

  return (
    <main className="tw-override main bg-white text-sm text-gray-800">
      <header className="header mb-4 space-y-4">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          <div className="">
            <h1 className="page-title">Bank Register</h1>
            <AccountSelector
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onChange={setSelectedAccountId}
            />
          </div>

          <div className="space-y-3 text-right">
            <div>
              <p className="balance-label tracking-wide">Ending Balance</p>
              <p className="balance-amount">
                {generalBalance.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD"
                })}
              </p>
            </div>
          </div>
        </div>
        {/* <div className="flex flex-wrap items-center justify-between gap-3 border-y border-gray-200 py-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Go to:</span>
            <input
              type="text"
              value="1"
              readOnly
              className="w-10 rounded border border-gray-300 px-1 text-center text-sm text-gray-700"
            />
            <button type="button" className="cursor-not-allowed text-sm text-gray-400">
              First
            </button>
            <button type="button" className="cursor-not-allowed text-sm text-gray-400">
              Previous
            </button>
            <button type="button" className="cursor-pointer text-sm text-blue-600 hover:underline">
              Next
            </button>
            <button type="button" className="cursor-pointer text-sm text-blue-600 hover:underline">
              Last
            </button>
          </div>
          <span className="text-sm text-gray-600">
            1-{entries.length} of {entries.length}
          </span>
        </div> */}
      </header>

      {/* <div className="space-y-2">
        <ActionToolbar
          availableTransactionTypes={availableTransactionTypes}
          selectedTransactionType={selectedTransactionType}
          onAddSelectedTransaction={addSelectedTransaction}
          onSelectTransactionType={selectTransactionType}
        />
        {selectedAccount ? (
          <p className="px-4 text-xs text-gray-500">
            Transaction types for {selectedAccount.name} ({selectedAccount.category.toLowerCase().replaceAll("_", " ")}).
          </p>
        ) : null}
        {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      </div> */}

      <section className="mt-4">
        <RegisterTable
          entries={entries}
          draftTransaction={draftTransaction}
          draftErrors={draftErrors}
          isSavingDraft={isSavingDraft}
          onDraftFieldChange={updateDraftField}
          onDraftSave={saveDraftTransaction}
          onDraftCancel={cancelDraftTransaction}
          onUpdateEntry={updateRegisterEntryInline}
          onDeleteEntry={deleteRegisterEntryInline}
        />
      </section>
    </main>
  );
}
