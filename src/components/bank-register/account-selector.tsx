import type { Account } from "@/modules/accounting/domain/models";
import { SelectField } from "@/components/bank-register/select-field";

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
  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.name,
    rightLabel: formatCategory(account.category),
    keywords: [formatCategory(account.category), account.id]
  }));

  return (
    <div className="inline-flex min-w-fit w-fit items-center">
      <SelectField
        value={selectedAccountId}
        onChange={onChange}
        options={accountOptions}
        placeholder="Register bank"
        allowCustomValue={false}
        fullWidth={false}
      />
    </div>
  );
}
