import type { RegisterEntry } from "@/modules/accounting/domain/models";
import type {
  DraftTransactionErrors,
  DraftTransactionForm
} from "@/modules/accounting/presentation/hooks/use-bank-register";

type RegisterTableProps = {
  entries: RegisterEntry[];
  onSelect: (transactionId: string) => void;
  draftTransaction: DraftTransactionForm | null;
  draftErrors: DraftTransactionErrors;
  draftBalancePreview: number | null;
  isSavingDraft: boolean;
  onDraftFieldChange: (
    field: keyof Omit<DraftTransactionForm, "transactionTypeId" | "transactionTypeLabel">,
    value: string
  ) => void;
  onDraftSave: () => void;
  onDraftCancel: () => void;
};

function rowStyle(status: RegisterEntry["status"]): string {
  if (status === "VOIDED") {
    return "line-through text-slate-400";
  }
  if (status === "DRAFT") {
    return "text-amber-700";
  }
  return "text-slate-700";
}

export function RegisterTable({
  entries,
  onSelect,
  draftTransaction,
  draftErrors,
  draftBalancePreview,
  isSavingDraft,
  onDraftFieldChange,
  onDraftSave,
  onDraftCancel
}: RegisterTableProps) {
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
                  onChange={(event) => onDraftFieldChange("payment", event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs"
                />
                {draftErrors.payment ? <p className="mt-1 text-xs text-red-600">{draftErrors.payment}</p> : null}
              </td>
              <td className="px-2 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftTransaction.deposit}
                  onChange={(event) => onDraftFieldChange("deposit", event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs"
                />
                {draftErrors.deposit ? <p className="mt-1 text-xs text-red-600">{draftErrors.deposit}</p> : null}
              </td>
              <td className="px-2 py-2">
                <div className="rounded border border-slate-200 bg-white px-2 py-1 text-right text-xs font-semibold text-slate-700">
                  {draftBalancePreview !== null ? draftBalancePreview.toFixed(2) : "-"}
                </div>
                {draftErrors.amount ? <p className="mt-1 text-xs text-red-600">{draftErrors.amount}</p> : null}
                {draftErrors.form ? <p className="mt-1 text-xs text-red-600">{draftErrors.form}</p> : null}
                <div className="mt-2 flex justify-end gap-2">
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
          ) : null}

          {entries.length === 0 && !draftTransaction ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                No register entries yet. Create a transaction from the toolbar.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr
                key={entry.id}
                className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${rowStyle(entry.status)}`}
                onClick={() => onSelect(entry.transactionId)}
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
