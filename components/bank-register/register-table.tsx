import { Fragment, useMemo, useState } from "react";
import type { RegisterEntry } from "@/modules/accounting/domain/models";
import { isInflowTransactionType, isOutflowTransactionType } from "@/modules/accounting/presentation/transaction-type-policy";
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
    return "line-through text-slate-400";
  }
  if (status === "DRAFT") {
    return "text-amber-700";
  }
  return "text-slate-700";
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

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId]
  );
  const isDraftInflowType = draftTransaction
    ? isInflowTransactionType(draftTransaction.transactionTypeId)
    : false;
  const isDraftOutflowType = draftTransaction
    ? isOutflowTransactionType(draftTransaction.transactionTypeId)
    : false;

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

  async function handleSaveRow() {
    if (!selectedEntryId) return;
    const payment = Number(editor.payment || 0);
    const deposit = Number(editor.deposit || 0);
    if (!editor.date || !editor.payee.trim()) {
      setRowError("Date and Payee are required.");
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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th rowSpan={2} className="px-4 py-2 align-top">
              Date
            </th>
            <th className="px-4 py-2">Ref No</th>
            <th className="px-4 py-2">Payee</th>
            <th rowSpan={2} className="px-4 py-2 align-top">
              Memo
            </th>
            <th rowSpan={2} className="px-4 py-2 text-right align-top">
              Payment
            </th>
            <th rowSpan={2} className="px-4 py-2 text-right align-top">
              Deposit
            </th>
            <th rowSpan={2} className="px-4 py-2 text-right align-top">
              Balance
            </th>
          </tr>
          <tr>
            <th className="px-4 pb-3 pt-0 normal-case text-[11px] tracking-normal text-slate-500">Type</th>
            <th className="px-4 pb-3 pt-0 normal-case text-[11px] tracking-normal text-slate-500">Account</th>
          </tr>
        </thead>
        <tbody>
          {draftTransaction ? (
            <>
              <tr className="border-t border-slate-200 bg-slate-50/70 align-top">
              <td className="px-2 py-2">
                <input
                  type="date"
                  value={draftTransaction.date}
                  onChange={(event) => onDraftFieldChange("date", event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
                {draftErrors.date ? <p className="mt-1 text-xs text-red-600">{draftErrors.date}</p> : null}
              </td>
              <td className="px-2 py-2">
                <input
                  type="text"
                  value={draftTransaction.refNo}
                  onChange={(event) => onDraftFieldChange("refNo", event.target.value)}
                  placeholder="Ref No"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
                <input
                  type="text"
                  value={draftTransaction.transactionTypeLabel}
                  disabled
                  className="mt-1 w-full rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600"
                />
              </td>
              <td className="px-2 py-2">
                <input
                  type="text"
                  value={draftTransaction.payee}
                  onChange={(event) => onDraftFieldChange("payee", event.target.value)}
                  placeholder="Payee"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
                <input
                  type="text"
                  value={draftTransaction.accountTypeLabel}
                  onChange={(event) => onDraftFieldChange("accountTypeLabel", event.target.value)}
                  placeholder="Account type"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
                {draftErrors.payee ? <p className="mt-1 text-xs text-red-600">{draftErrors.payee}</p> : null}
                {draftErrors.accountTypeLabel ? (
                  <p className="mt-1 text-xs text-red-600">{draftErrors.accountTypeLabel}</p>
                ) : null}
              </td>
              <td className="px-2 py-2">
                <input
                  type="text"
                  value={draftTransaction.memo}
                  onChange={(event) => onDraftFieldChange("memo", event.target.value)}
                  placeholder="Memo"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
              </td>
              <td className="px-2 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftTransaction.payment}
                  disabled={isDraftInflowType}
                  onChange={(event) => onDraftFieldChange("payment", event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs disabled:bg-slate-100"
                />
                {draftErrors.payment ? <p className="mt-1 text-xs text-red-600">{draftErrors.payment}</p> : null}
              </td>
              <td className="px-2 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftTransaction.deposit}
                  disabled={isDraftOutflowType}
                  onChange={(event) => onDraftFieldChange("deposit", event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs disabled:bg-slate-100"
                />
                {draftErrors.deposit ? <p className="mt-1 text-xs text-red-600">{draftErrors.deposit}</p> : null}
              </td>
              <td className="px-2 py-2">
                <div className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-right text-xs text-slate-500">
                  -
                </div>
              </td>
            </tr>
              <tr className="border-b border-slate-200 bg-slate-50/70">
              <td colSpan={7} className="px-2 pb-3 pt-0">
                {draftErrors.amount ? <p className="mb-1 text-xs text-red-600">{draftErrors.amount}</p> : null}
                {draftErrors.form ? <p className="mb-1 text-xs text-red-600">{draftErrors.form}</p> : null}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onDraftCancel}
                    disabled={isSavingDraft}
                    className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onDraftSave}
                    disabled={isSavingDraft}
                    className="rounded border border-emerald-600 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                No register entries yet. Create a transaction from the toolbar.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              selectedEntryId === entry.id ? (
                <Fragment key={entry.id}>
                  <tr className="border-t border-slate-200 bg-blue-50/40 align-top">
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      value={editor.date}
                      disabled={false}
                      onChange={(event) => setEditor((current) => ({ ...current, date: event.target.value }))}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={editor.refNo}
                      disabled
                      onChange={(event) => setEditor((current) => ({ ...current, refNo: event.target.value }))}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    />
                    <input
                      type="text"
                      value={entry.transactionType}
                      disabled
                      className="mt-1 w-full rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={editor.payee}
                      disabled={false}
                      onChange={(event) => setEditor((current) => ({ ...current, payee: event.target.value }))}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    />
                    <input
                      type="text"
                      value={accountLabel}
                      disabled
                      onChange={(event) => setAccountLabel(event.target.value)}
                      placeholder="Account"
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={editor.memo}
                      disabled={false}
                      onChange={(event) => setEditor((current) => ({ ...current, memo: event.target.value }))}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editor.payment}
                      disabled={selectedEntry ? INFLOW_ROW_TYPES.has(selectedEntry.transactionType) : false}
                      onChange={(event) => setEditor((current) => ({ ...current, payment: event.target.value }))}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editor.deposit}
                      disabled={selectedEntry ? OUTFLOW_ROW_TYPES.has(selectedEntry.transactionType) : false}
                      onChange={(event) => setEditor((current) => ({ ...current, deposit: event.target.value }))}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-right text-xs text-slate-500">
                      -
                    </div>
                  </td>
                </tr>
                  <tr className="border-b border-slate-200 bg-blue-50/40">
                  <td colSpan={7} className="px-2 pb-3 pt-0">
                    {rowError ? <p className="mb-1 text-xs text-red-600">{rowError}</p> : null}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={isDeletingRow || isSavingRow}
                        onClick={handleDeleteRow}
                        className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingRow || isSavingRow}
                        onClick={() => undefined}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
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
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingRow || isSavingRow}
                        onClick={handleSaveRow}
                        className="rounded border border-emerald-600 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
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
                  className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${rowStyle(entry.status)}`}
                  onClick={() => openRowEditor(entry)}
                >
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">
                    <div>{entry.refNumber ?? "-"}</div>
                    <div className="text-xs text-slate-500">{entry.transactionType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{entry.payee ?? "-"}</div>
                    <div className="text-xs text-slate-500">-</div>
                  </td>
                  <td className="px-4 py-3">{entry.memo ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {entry.payment ? entry.payment.toFixed(2) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {entry.deposit ? entry.deposit.toFixed(2) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {entry.runningBalance.toFixed(2)}
                  </td>
                </tr>
              )
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
