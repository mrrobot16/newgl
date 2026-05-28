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

function SelectorChevronIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
      focusable="false"
      aria-hidden="true"
      className="h-5 w-5 text-gray-600"
    >
      <path
        d="M12.014 16.018a1 1 0 0 1-.708-.294L5.314 9.715A1.001 1.001 0 0 1 6.73 8.3l5.286 5.3 5.3-5.285a1 1 0 0 1 1.413 1.416l-6.009 5.995a1 1 0 0 1-.706.292Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AccountSelector({ accounts, selectedAccountId, onChange }: AccountSelectorProps) {
  return (
    <div className="inline-flex min-w-fit w-fit items-center">
      <label htmlFor="account-selector" className="sr-only">
        Account
      </label>
      <div className="relative min-w-fit w-fit">
        <select
          id="account-selector"
          value={selectedAccountId}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-[208px] appearance-none rounded border border-gray-300 bg-white px-3 pr-9 text-sm font-normal leading-[1.2] text-gray-900 transition-[background-color,border-color,box-shadow] duration-200"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({formatCategory(account.category)})
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <SelectorChevronIcon />
        </span>
      </div>
    </div>
  );
}
