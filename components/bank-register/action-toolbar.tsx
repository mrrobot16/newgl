"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  BankRegisterTransactionTypeId,
  BankRegisterTransactionTypeOption
} from "@/modules/accounting/presentation/transaction-type-policy";

type ActionToolbarProps = {
  availableTransactionTypes: BankRegisterTransactionTypeOption[];
  selectedTransactionType: BankRegisterTransactionTypeId;
  onAddSelectedTransaction: () => void;
  onSelectTransactionType: (transactionType: BankRegisterTransactionTypeId) => void;
};

export function ActionToolbar({
  availableTransactionTypes,
  selectedTransactionType,
  onAddSelectedTransaction,
  onSelectTransactionType
}: ActionToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current) {
        return;
      }
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedLabel = useMemo(
    () =>
      `Add ${
        availableTransactionTypes.find((transactionType) => transactionType.id === selectedTransactionType)
          ?.label ?? selectedTransactionType
      }`,
    [availableTransactionTypes, selectedTransactionType]
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="relative inline-flex" ref={wrapperRef}>
        <button
          type="button"
          onClick={onAddSelectedTransaction}
          className="rounded-l-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {selectedLabel}
        </button>
        <button
          type="button"
          aria-label="Open transaction type list"
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-r-md border border-l-0 border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M5.25 7.5 10 12.25 14.75 7.5" />
          </svg>
        </button>

        {isOpen ? (
          <div className="absolute top-11 z-10 w-64 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
            {availableTransactionTypes.map((transactionType) => (
              <button
                key={transactionType.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectTransactionType(transactionType.id);
                }}
                className={`block w-full rounded px-3 py-2 text-left text-sm ${
                  transactionType.id === selectedTransactionType
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {transactionType.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
