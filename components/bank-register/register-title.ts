import type { Account } from "@/modules/accounting/domain/models";

export function getRegisterTitle(selectedAccount: Account | undefined): string {
  if (!selectedAccount) {
    return "Bank Register";
  }
  if (selectedAccount.name === "Cash on hand") {
    return "Bank Register";
  }
  if (selectedAccount.name === "Credit Card Payable") {
    return "Credit Card Register";
  }

  switch (selectedAccount.category) {
    case "EQUITY":
      return "Equity Register";
    case "FIXED_ASSET":
    case "OTHER_CURRENT_ASSET":
      return "Asset Register";
    case "LONG_TERM_LIABILITY":
    case "OTHER_CURRENT_LIABILITY":
      return "Liability Register";
    default:
      return "Bank Register";
  }
}
