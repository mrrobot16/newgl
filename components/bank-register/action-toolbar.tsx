"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TriangleArrowDownIcon } from "@/components/icons/triangle-arrow-down-icon";
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
    <div className="relative inline-flex" ref={wrapperRef}>
      <button
        type="button"
        onClick={onAddSelectedTransaction}
        className="actions-quickadd-button flex items-center"
      >
        {selectedLabel}
      </button>
      <button
        type="button"
        aria-label="Open transaction type list"
        onClick={() => setIsOpen((open) => !open)}
        className="actions-quickadd-button-icon"
      >
        <TriangleArrowDownIcon className="" />
      </button>

      {isOpen ? (
        <div className="absolute top-10 z-50 min-w-40 rounded border border-gray-200 bg-white py-1 shadow-md">
          {availableTransactionTypes.map((transactionType) => (
            <button
              key={transactionType.id}
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSelectTransactionType(transactionType.id);
              }}
              className={`block w-full px-4 py-2 text-left text-sm ${
                transactionType.id === selectedTransactionType
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {transactionType.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
