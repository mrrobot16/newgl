type ActionToolbarProps = {
  onAction: (action: "CHECK" | "DEPOSIT" | "EXPENSE" | "TRANSFER" | "JOURNAL_ENTRY") => void;
};

const ACTIONS: ActionToolbarProps["onAction"] extends (action: infer T) => void
  ? Array<{ label: string; value: T }>
  : never = [
  { label: "+ Check", value: "CHECK" },
  { label: "+ Deposit", value: "DEPOSIT" },
  { label: "+ Expense", value: "EXPENSE" },
  { label: "+ Transfer", value: "TRANSFER" },
  { label: "+ Journal Entry", value: "JOURNAL_ENTRY" }
];

export function ActionToolbar({ onAction }: ActionToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-4">
      {ACTIONS.map((action) => (
        <button
          key={action.value}
          type="button"
          onClick={() => onAction(action.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
