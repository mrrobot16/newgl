"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AccountOption = {
  id: string;
  name: string;
  category: string;
};

type AccountSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  { id: "cash-on-hand", name: "Cash on hand", category: "Bank" },
  { id: "credit-card-payable", name: "Credit Card Payable", category: "Credit Card" },
  { id: "charitable-donations", name: "Charitable donations", category: "Equity" },
  { id: "equity-clearing-credit-card-payment", name: "Equity clearing (Credit Card Payment)", category: "Equity" },
  { id: "equity-clearing-transfer", name: "Equity clearing (Transfer)", category: "Equity" },
  { id: "federal-estimated-tax", name: "Federal estimated tax", category: "Equity" },
  { id: "federal-tax", name: "Federal tax", category: "Equity" },
  { id: "health-savings-account", name: "Health Savings Account", category: "Equity" },
  { id: "health-insurance-premium", name: "Health insurance premium", category: "Equity" },
  { id: "mortgage", name: "Mortgage", category: "Equity" },
  { id: "owners-investment", name: "Owners investment", category: "Equity" },
  { id: "owners-pay", name: "Owners pay", category: "Equity" },
  { id: "personal-expense", name: "Personal expense", category: "Equity" },
  { id: "personal-income", name: "Personal income", category: "Equity" },
  { id: "property-tax", name: "Property tax", category: "Equity" },
  { id: "retained-earnings", name: "Retained Earnings", category: "Equity" },
  { id: "retirement-contributions", name: "Retirement contributions", category: "Equity" },
  { id: "state-estimated-tax", name: "State estimated tax", category: "Equity" },
  { id: "state-tax", name: "State tax", category: "Equity" },
  { id: "visits-copays-prescriptions", name: "Visits, copays, and prescriptions", category: "Equity" },
  { id: "advertising-marketing", name: "Advertising and Marketing", category: "Expense" },
  { id: "airfare", name: "Airfare", category: "Expense" },
  { id: "apps-software", name: "Apps and software", category: "Expense" },
  { id: "business-licenses", name: "Business licenses", category: "Expense" },
  { id: "business-loan-interest", name: "Business loan (interest)", category: "Expense" },
  { id: "commissions-fees", name: "Commissions and fees", category: "Expense" },
  { id: "communications", name: "Communications", category: "Expense" },
  { id: "continued-education", name: "Continued education", category: "Expense" },
  { id: "contract-labor", name: "Contract labor", category: "Expense" },
  { id: "credit-card-interest", name: "Credit card interest", category: "Expense" },
  { id: "entertainment", name: "Entertainment", category: "Expense" },
  { id: "equipment-rent-lease", name: "Equipment rent and lease", category: "Expense" },
  { id: "legal-professional-services", name: "Legal and professional services", category: "Expense" },
  { id: "liability-insurance", name: "Liability insurance", category: "Expense" },
  { id: "local-taxes", name: "Local taxes", category: "Expense" },
  { id: "lodging", name: "Lodging", category: "Expense" },
  { id: "materials-supplies", name: "Materials and supplies", category: "Expense" },
  { id: "meals-with-clients", name: "Meals with clients", category: "Expense" },
  { id: "miscellaneous-expenses", name: "Miscellaneous expenses", category: "Expense" },
  { id: "mortgage-interest-business-property", name: "Mortgage interest (business property)", category: "Expense" },
  { id: "office-expenses", name: "Office Expenses", category: "Expense" },
  { id: "other-business-expenses", name: "Other business expenses", category: "Expense" },
  { id: "other-interest", name: "Other interest", category: "Expense" },
  { id: "other-travel-expenses", name: "Other travel expenses", category: "Expense" },
  { id: "property-rents-leases", name: "Property rents and leases", category: "Expense" },
  { id: "property-tax-business-property", name: "Property tax (business property)", category: "Expense" },
  { id: "repairs-maintenance", name: "Repairs and maintenance", category: "Expense" },
  { id: "shipping-fees", name: "Shipping fees", category: "Expense" },
  { id: "subscriptions-memberships", name: "Subscriptions and memberships", category: "Expense" },
  { id: "transaction-fees", name: "Transaction fees", category: "Expense" },
  { id: "travel-meals", name: "Travel meals", category: "Expense" },
  { id: "uncategorized-expense", name: "Uncategorized Expense", category: "Expense" },
  { id: "uniforms", name: "Uniforms", category: "Expense" },
  { id: "utilities-business-property", name: "Utilities (business property)", category: "Expense" },
  { id: "vehicle-rental-public-transportation", name: "Vehicle rental/public transportation", category: "Expense" },
  { id: "apps-software-200", name: "Apps and software (> $200)", category: "Fixed Asset" },
  { id: "building-purchase", name: "Building purchase", category: "Fixed Asset" },
  { id: "computer-200", name: "Computer (> $200)", category: "Fixed Asset" },
  { id: "copier-200", name: "Copier (> $200)", category: "Fixed Asset" },
  { id: "furniture-200", name: "Furniture (> $200)", category: "Fixed Asset" },
  { id: "land-purchase", name: "Land purchase", category: "Fixed Asset" },
  { id: "machinery-equipment", name: "Machinery and equipment", category: "Fixed Asset" },
  { id: "phone-200", name: "Phone (> $200)", category: "Fixed Asset" },
  { id: "photo-video-equipment-200", name: "Photo and video equipment (> $200)", category: "Fixed Asset" },
  { id: "tools-equipment-200", name: "Tools and equipment (> $200)", category: "Fixed Asset" },
  { id: "vehicle-purchase", name: "Vehicle purchase", category: "Fixed Asset" },
  { id: "billable-expense-income", name: "Billable Expense Income", category: "Income" },
  { id: "sales", name: "Sales", category: "Income" },
  { id: "services", name: "Services", category: "Income" },
  { id: "services-6", name: "Services ( 6 )", category: "Income" },
  { id: "uncategorized-income", name: "Uncategorized Income", category: "Income" },
  { id: "business-loan", name: "Business loan", category: "Long Term Liability" },
  { id: "mortgage-principal-business-property", name: "Mortgage principal (business property)", category: "Long Term Liability" },
  { id: "mortgage-principal-home-office", name: "Mortgage principal (home office)", category: "Long Term Liability" },
  { id: "vehicle-loan", name: "Vehicle loan", category: "Long Term Liability" },
  { id: "loans-to-others", name: "Loans to others", category: "Other Current Asset" },
  { id: "uncategorized-asset", name: "Uncategorized Asset", category: "Other Current Asset" },
  { id: "undeposited-funds", name: "Undeposited Funds", category: "Other Current Asset" },
  { id: "sales-tax-to-pay", name: "Sales tax to pay", category: "Other Current Liability" },
  { id: "gas-fuel", name: "Gas and fuel", category: "Other Expense" },
  { id: "homeowner-rental-insurance-home-office", name: "Homeowner/rental insurance (home office)", category: "Other Expense" },
  { id: "mortgage-interest-home-office", name: "Mortgage interest (home office)", category: "Other Expense" },
  { id: "other-home-office-expenses", name: "Other home office expenses", category: "Other Expense" },
  { id: "other-vehicle-expenses", name: "Other vehicle expenses", category: "Other Expense" },
  { id: "parking-tolls", name: "Parking and tolls", category: "Other Expense" },
  { id: "property-tax-home-office", name: "Property tax (home office)", category: "Other Expense" },
  { id: "reconciliation-discrepancies", name: "Reconciliation Discrepancies", category: "Other Expense" },
  { id: "rent-lease-home-office", name: "Rent and lease (home office)", category: "Other Expense" },
  { id: "repairs-maintenance-home-office", name: "Repairs and maintenance (home office)", category: "Other Expense" },
  { id: "utilities-home-office", name: "Utilities (home office)", category: "Other Expense" },
  { id: "vehicle-insurance", name: "Vehicle insurance", category: "Other Expense" },
  { id: "vehicle-lease", name: "Vehicle lease", category: "Other Expense" },
  { id: "vehicle-loan-interest", name: "Vehicle loan interest", category: "Other Expense" },
  { id: "vehicle-registration", name: "Vehicle registration", category: "Other Expense" },
  { id: "vehicle-repairs-maintenance", name: "Vehicle repairs and maintenance", category: "Other Expense" },
  { id: "other-income", name: "Other income", category: "Other Income" }
];

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
      className="h-5 w-5"
    >
      <path
        d="M12.014 16.018a1 1 0 0 1-.708-.294L5.314 9.715A1.001 1.001 0 0 1 6.73 8.3l5.286 5.3 5.3-5.285a1 1 0 0 1 1.413 1.416l-6.009 5.995a1 1 0 0 1-.706.292Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AccountSelect({ value, onChange, disabled, fullWidth = true }: AccountSelectProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!isFiltering) return ACCOUNT_OPTIONS;
    const text = query.trim().toLowerCase();
    if (!text) return ACCOUNT_OPTIONS;
    return ACCOUNT_OPTIONS.filter((option) => {
      return (
        option.name.toLowerCase().includes(text) ||
        option.category.toLowerCase().includes(text)
      );
    });
  }, [isFiltering, query]);

  function handleSelectAccount(name: string) {
    setQuery(name);
    setIsFiltering(false);
    onChange(name);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative mt-1 ${fullWidth ? "w-full min-w-0" : "min-w-fit w-fit"}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder="Account"
          onFocus={() => setIsOpen(true)}
          onClick={() => {
            setIsOpen(true);
            setIsFiltering(false);
          }}
          onChange={(event) => {
            const text = event.target.value;
            setQuery(text);
            setIsFiltering(true);
            onChange(text);
            setIsOpen(true);
          }}
          className={`${fullWidth ? "w-full" : "w-[208px]"} h-9 rounded border border-gray-300 bg-white px-3 pr-9 text-sm font-normal leading-[1.2] text-gray-900 placeholder:text-gray-400 transition-[background-color,border-color,box-shadow] duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setIsFiltering(false);
            setIsOpen((open) => !open);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
          aria-label="Toggle account list"
        >
          <SelectorChevronIcon />
        </button>
      </div>

      {isOpen && !disabled ? (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded border border-gray-200 bg-white py-1 shadow-md">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectAccount(option.name)}
                className="flex w-full items-center justify-between gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <span className="truncate text-left text-gray-700">{option.name}</span>
                <span className="shrink-0 text-right text-gray-500">{option.category}</span>
              </button>
            ))
          ) : (
            <p className="px-4 py-2 text-sm text-gray-500">No matches</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
