import type { LedgerPosting, Transaction } from "@/modules/accounting/domain/models";

type DetailPanelProps = {
  transaction: Transaction | null;
  postings: LedgerPosting[];
  onVoid: (transactionId: string) => void;
  onReverse: (transactionId: string) => void;
};

export function DetailPanel({ transaction, postings, onVoid, onReverse }: DetailPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Detail Panel</h2>
      {!transaction ? (
        <p className="mt-3 text-sm text-slate-500">Select a register row to inspect transaction detail.</p>
      ) : (
        <div className="mt-3 space-y-4 text-sm">
          <div className="space-y-1 text-slate-700">
            <p>
              <span className="font-medium">Transaction:</span> {transaction.id}
            </p>
            <p>
              <span className="font-medium">Type:</span> {transaction.type}
            </p>
            <p>
              <span className="font-medium">Status:</span> {transaction.status}
            </p>
            <p>
              <span className="font-medium">Memo:</span> {transaction.memo ?? "-"}
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-slate-900">Ledger Postings</h3>
            <ul className="space-y-2">
              {postings.map((posting) => (
                <li key={posting.id} className="rounded border border-slate-200 p-2 text-xs text-slate-700">
                  {posting.entryType} {posting.amount.toFixed(2)} on {posting.accountName ?? posting.accountCode}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onVoid(transaction.id)}
              className="rounded-md border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Void
            </button>
            <button
              type="button"
              onClick={() => onReverse(transaction.id)}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Reverse
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
