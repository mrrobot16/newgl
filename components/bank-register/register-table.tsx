import type { RegisterEntry } from "@/modules/accounting/domain/models";

type RegisterTableProps = {
  entries: RegisterEntry[];
  onSelect: (transactionId: string) => void;
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

export function RegisterTable({ entries, onSelect }: RegisterTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Ref No</th>
            <th className="px-4 py-3">Payee / Account</th>
            <th className="px-4 py-3">Memo</th>
            <th className="px-4 py-3 text-right">Payment</th>
            <th className="px-4 py-3 text-right">Deposit</th>
            <th className="px-4 py-3 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
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
                <td className="px-4 py-3">{entry.transactionType}</td>
                <td className="px-4 py-3">{entry.refNumber ?? "-"}</td>
                <td className="px-4 py-3">{entry.payee ?? "-"}</td>
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
