import { Fragment, useEffect, useMemo, useState } from "react";
import { ACCOUNT_FIELD_OPTIONS } from "@/components/bank-register/account-field-options";
import { PayeeSideModal } from "@/components/bank-register/payee-side-modal";
import type { PayeeOption } from "@/components/bank-register/payee-side-modal";
import { SelectField } from "@/components/bank-register/select-field";
import type { RegisterEntry } from "@/modules/accounting/domain/models";
import {
  isAccountFieldDisabledForTransactionType,
  isInflowTransactionType,
  isOutflowTransactionType
} from "@/modules/accounting/presentation/transaction-type-policy";
import type {
  DraftTransactionErrors,
  DraftTransactionForm,
  InlineEntryEditorInput
} from "@/modules/accounting/presentation/hooks/use-bank-register";

type RegisterTableProps = {
  entries: RegisterEntry[];
  draftTransaction: DraftTransactionForm | null;
  draftErrors: DraftTransactionErrors;
  isSavingDraft: boolean;
  onDraftFieldChange: (
    field: keyof Omit<DraftTransactionForm, "transactionTypeId" | "transactionTypeLabel">,
    value: string
  ) => void;
  onDraftSave: () => void;
  onDraftCancel: () => void;
  onUpdateEntry: (entryId: string, input: InlineEntryEditorInput) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
};

function rowStyle(status: RegisterEntry["status"]): string {
  if (status === "VOIDED" || status === "DELETED") {
    return "line-through text-gray-400";
  }
  if (status === "DRAFT") {
    return "text-gray-700";
  }
  return "text-gray-800";
}

const INFLOW_ROW_TYPES = new Set<RegisterEntry["transactionType"]>([
  "DEPOSIT",
  "SALES_RECEIPT",
  "RECEIVE_PAYMENT"
]);

const OUTFLOW_ROW_TYPES = new Set<RegisterEntry["transactionType"]>([
  "CHECK",
  "BILL_PAYMENT",
  "REFUND",
  "EXPENSE"
]);

export function RegisterTable({
  entries,
  draftTransaction,
  draftErrors,
  isSavingDraft,
  onDraftFieldChange,
  onDraftSave,
  onDraftCancel,
  onUpdateEntry,
  onDeleteEntry
}: RegisterTableProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [isDeletingRow, setIsDeletingRow] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [editor, setEditor] = useState<InlineEntryEditorInput>({
    date: "",
    refNo: "",
    payee: "",
    memo: "",
    payment: "",
    deposit: ""
  });
  const [accountLabel, setAccountLabel] = useState("");
  const [payees, setPayees] = useState<PayeeOption[]>([]);
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const [payeeModalTarget, setPayeeModalTarget] = useState<"draft" | "row">("draft");

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId]
  );
  const payeeOptions = useMemo(
    () =>
      payees.map((payee) => ({
        value: payee.name,
        label: payee.name,
        rightLabel: payee.kind.toLowerCase()
      })),
    [payees]
  );
  const isDraftInflowType = draftTransaction
    ? isInflowTransactionType(draftTransaction.transactionTypeId)
    : false;
  const isDraftOutflowType = draftTransaction
    ? isOutflowTransactionType(draftTransaction.transactionTypeId)
    : false;
  const isDraftAccountFieldDisabled = draftTransaction
    ? isAccountFieldDisabledForTransactionType(draftTransaction.transactionTypeId)
    : false;

  useEffect(() => {
    setPayees((previous) => {
      const map = new Map(previous.map((item) => [item.name.toLowerCase(), item]));
      entries.forEach((entry) => {
        if (!entry.payee) return;
        const key = entry.payee.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: crypto.randomUUID(),
            name: entry.payee,
            kind: "VENDOR"
          });
        }
      });
      return [...map.values()];
    });
  }, [entries]);

  function openRowEditor(entry: RegisterEntry) {
    setSelectedEntryId(entry.id);
    setRowError(null);
    setEditor({
      date: entry.date,
      refNo: entry.refNumber ?? "",
      payee: entry.payee ?? "",
      memo: entry.memo ?? "",
      payment: entry.payment ? String(entry.payment) : "",
      deposit: entry.deposit ? String(entry.deposit) : ""
    });
    setAccountLabel("");
  }

  function openPayeeModal(target: "draft" | "row") {
    setPayeeModalTarget(target);
    setIsPayeeModalOpen(true);
  }

  async function handleSaveRow() {
    if (!selectedEntryId) return;
    const payment = Number(editor.payment || 0);
    const deposit = Number(editor.deposit || 0);
    if (!editor.date) {
      setRowError("Date is required.");
      return;
    }
    if ((payment > 0 && deposit > 0) || (payment <= 0 && deposit <= 0)) {
      setRowError("Use only payment or deposit and provide one amount.");
      return;
    }
    try {
      setIsSavingRow(true);
      setRowError(null);
      await onUpdateEntry(selectedEntryId, editor);
      setSelectedEntryId(null);
    } catch (error) {
      setRowError(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setIsSavingRow(false);
    }
  }

  async function handleDeleteRow() {
    if (!selectedEntryId) return;
    try {
      setIsDeletingRow(true);
      setRowError(null);
      await onDeleteEntry(selectedEntryId);
      setSelectedEntryId(null);
    } catch (error) {
      setRowError(error instanceof Error ? error.message : "Failed to delete entry.");
    } finally {
      setIsDeletingRow(false);
    }
  }

  return (
    <div className="relative overflow-visible rounded border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span aria-hidden="true">⎚</span>
          <span>All</span>
          <span aria-hidden="true">▾</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <button type="button" className="hover:text-gray-600" aria-label="Print">
            🖨
          </button>
          <button type="button" className="hover:text-gray-600" aria-label="Export">
            ⭳
          </button>
          <button type="button" className="hover:text-gray-600" aria-label="Settings">
            ⚙
          </button>
        </div>
      </div>
      <table className="w-full min-w-[1120px] border-collapse text-sm">
        <thead className="border-y border-gray-200 bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th rowSpan={2} className="w-28 px-3 py-2 text-left font-semibold align-top">
              Date
            </th>
            <th className="w-24 px-3 py-2 text-left font-semibold">Ref No.</th>
            <th className="px-3 py-2 text-left font-semibold">Payee</th>
            <th rowSpan={2} className="w-40 px-3 py-2 text-left font-semibold align-top">
              Memo
            </th>
            <th rowSpan={2} className="w-28 px-3 py-2 text-right font-semibold align-top">
              Payment
            </th>
            <th rowSpan={2} className="w-28 px-3 py-2 text-right font-semibold align-top">
              Deposit
            </th>
            <th rowSpan={2} className="w-8 px-3 py-2 text-center font-semibold align-top">
              ✓
            </th>
            <th rowSpan={2} className="w-28 px-3 py-2 text-right font-semibold align-top">
              Balance
            </th>
          </tr>
          <tr>
            <th className="px-3 pb-2 pt-0 normal-case text-xs tracking-normal text-gray-500">Type</th>
            <th className="px-3 pb-2 pt-0 normal-case text-xs tracking-normal text-gray-500">Account</th>
          </tr>
        </thead>
        <tbody>
          {draftTransaction ? (
            <>
              <tr className="border border-blue-200 bg-blue-50 align-top">
              <td className="px-3 py-2">
                <input
                  type="date"
                  value={draftTransaction.date}
                  onChange={(event) => onDraftFieldChange("date", event.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {draftErrors.date ? <p className="mt-1 text-xs text-red-600">{draftErrors.date}</p> : null}
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={draftTransaction.refNo}
                  onChange={(event) => onDraftFieldChange("refNo", event.target.value)}
                  placeholder="Ref No"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={draftTransaction.transactionTypeLabel}
                  disabled
                  className="mt-1 w-full rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm text-gray-400"
                />
              </td>
              <td className="px-3 py-2">
                <SelectField
                  value={draftTransaction.payee}
                  options={payeeOptions}
                  placeholder="Payee"
                  onChange={(value) => onDraftFieldChange("payee", value)}
                  onAddNew={() => openPayeeModal("draft")}
                />
                <SelectField
                  value={draftTransaction.accountTypeLabel}
                  options={ACCOUNT_FIELD_OPTIONS}
                  placeholder="Account"
                  onChange={(value) => onDraftFieldChange("accountTypeLabel", value)}
                  disabled={isDraftAccountFieldDisabled}
                />
                {draftErrors.payee ? <p className="mt-1 text-xs text-red-600">{draftErrors.payee}</p> : null}
                {draftErrors.accountTypeLabel ? (
                  <p className="mt-1 text-xs text-red-600">{draftErrors.accountTypeLabel}</p>
                ) : null}
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={draftTransaction.memo}
                  onChange={(event) => onDraftFieldChange("memo", event.target.value)}
                  placeholder="Memo"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftTransaction.payment}
                  disabled={isDraftInflowType}
                  onChange={(event) => onDraftFieldChange("payment", event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-right text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                />
                {draftErrors.payment ? <p className="mt-1 text-xs text-red-600">{draftErrors.payment}</p> : null}
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftTransaction.deposit}
                  disabled={isDraftOutflowType}
                  onChange={(event) => onDraftFieldChange("deposit", event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-right text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                />
                {draftErrors.deposit ? <p className="mt-1 text-xs text-red-600">{draftErrors.deposit}</p> : null}
              </td>
              <td className="px-3 py-2 text-center text-gray-400">-</td>
              <td className="px-3 py-2">
                <div className="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-right text-xs text-gray-500">
                  -
                </div>
              </td>
            </tr>
              <tr className="border-b border-blue-200 bg-blue-50">
              <td colSpan={8} className="px-3 pb-3 pt-0">
                {draftErrors.amount ? <p className="mb-1 text-xs text-red-600">{draftErrors.amount}</p> : null}
                {draftErrors.form ? <p className="mb-1 text-xs text-red-600">{draftErrors.form}</p> : null}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onDraftCancel}
                    disabled={isSavingDraft}
                    className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onDraftSave}
                    disabled={isSavingDraft}
                    className="rounded bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingDraft ? "Saving..." : "Save"}
                  </button>
                </div>
              </td>
              </tr>
            </>
          ) : null}

          {entries.length === 0 && !draftTransaction ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                No register entries yet. Create a transaction from the toolbar.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              selectedEntryId === entry.id ? (
                <Fragment key={entry.id}>
                  <tr className="border border-blue-200 bg-blue-50 align-top">
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={editor.date}
                      disabled={false}
                      onChange={(event) => setEditor((current) => ({ ...current, date: event.target.value }))}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={editor.refNo}
                      disabled
                      onChange={(event) => setEditor((current) => ({ ...current, refNo: event.target.value }))}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <input
                      type="text"
                      value={entry.transactionType}
                      disabled
                      className="mt-1 w-full rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm text-gray-400"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <SelectField
                      value={editor.payee}
                      options={payeeOptions}
                      placeholder="Payee"
                      onChange={(value) => setEditor((current) => ({ ...current, payee: value }))}
                      onAddNew={() => openPayeeModal("row")}
                    />
                    <input
                      type="text"
                      value={accountLabel}
                      disabled
                      onChange={(event) => setAccountLabel(event.target.value)}
                      placeholder="Account"
                      className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={editor.memo}
                      disabled={false}
                      onChange={(event) => setEditor((current) => ({ ...current, memo: event.target.value }))}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editor.payment}
                      disabled={selectedEntry ? INFLOW_ROW_TYPES.has(selectedEntry.transactionType) : false}
                      onChange={(event) => setEditor((current) => ({ ...current, payment: event.target.value }))}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-right text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editor.deposit}
                      disabled={selectedEntry ? OUTFLOW_ROW_TYPES.has(selectedEntry.transactionType) : false}
                      onChange={(event) => setEditor((current) => ({ ...current, deposit: event.target.value }))}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-right text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-3 py-2 text-center text-gray-400">-</td>
                  <td className="px-3 py-2">
                    <div className="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-right text-xs text-gray-500">
                      -
                    </div>
                  </td>
                </tr>
                  <tr className="border-b border-blue-200 bg-blue-50">
                  <td colSpan={8} className="px-3 pb-3 pt-0">
                    {rowError ? <p className="mb-1 text-xs text-red-600">{rowError}</p> : null}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={isDeletingRow || isSavingRow}
                        onClick={handleDeleteRow}
                        className="rounded border border-red-300 px-4 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingRow || isSavingRow}
                        onClick={() => undefined}
                        className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingRow || isSavingRow}
                        onClick={() => {
                          setSelectedEntryId(null);
                          setRowError(null);
                        }}
                        className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingRow || isSavingRow}
                        onClick={handleSaveRow}
                        className="rounded bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {isSavingRow ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </td>
                  </tr>
                </Fragment>
              ) : (
                <tr
                  key={entry.id}
                  className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${rowStyle(entry.status)}`}
                  onClick={() => openRowEditor(entry)}
                >
                  <td className="px-3 py-2 align-top text-gray-800">{entry.date}</td>
                  <td className="px-3 py-2 align-top">
                    <div>{entry.refNumber ?? "-"}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{entry.transactionType}</div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div>{entry.payee ?? "-"}</div>
                    <div className="mt-0.5 text-xs text-gray-500">-</div>
                  </td>
                  <td className="px-3 py-2 align-top text-gray-800">{entry.memo ?? "-"}</td>
                  <td className="px-3 py-2 text-right align-top text-gray-800">
                    {entry.payment ? entry.payment.toFixed(2) : "-"}
                  </td>
                  <td className="px-3 py-2 text-right align-top text-gray-800">
                    {entry.deposit ? entry.deposit.toFixed(2) : "-"}
                  </td>
                  <td className="px-3 py-2 text-center align-top text-gray-400">-</td>
                  <td className="px-3 py-2 text-right align-top font-medium text-gray-900">
                    {entry.runningBalance.toFixed(2)}
                  </td>
                </tr>
              )
            ))
          )}
        </tbody>
      </table>
      <PayeeSideModal
        open={isPayeeModalOpen}
        onClose={() => setIsPayeeModalOpen(false)}
        onSave={(payee) => {
          setPayees((previous) => {
            const exists = previous.some((item) => item.name.toLowerCase() === payee.name.toLowerCase());
            return exists ? previous : [...previous, payee];
          });

          if (payeeModalTarget === "draft" && draftTransaction) {
            onDraftFieldChange("payee", payee.name);
          }
          if (payeeModalTarget === "row") {
            setEditor((current) => ({ ...current, payee: payee.name }));
          }
        }}
      />
    </div>
  );
}
