import type { Account } from "@/modules/accounting/domain/models";

type AccountSelectorProps = {
  accounts: Account[];
  selectedAccountId: string;
  onChange: (accountId: string) => void;
};

function formatCategory(category: Account["category"]): string {
  return category
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function AccountSelector({ accounts, selectedAccountId, onChange }: AccountSelectorProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <label htmlFor="account-selector" className="text-sm font-medium text-slate-700">
        Account
      </label>
      <select
        id="account-selector"
        value={selectedAccountId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} ({formatCategory(account.category)})
          </option>
        ))}
      </select>
    </div>
  );
}
