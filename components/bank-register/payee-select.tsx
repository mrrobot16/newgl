"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PayeeOption } from "@/components/bank-register/payee-side-modal";

type PayeeSelectProps = {
  value: string;
  payees: PayeeOption[];
  onChange: (value: string) => void;
  onAddNew: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

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

export function PayeeSelect({ value, payees, onChange, onAddNew, disabled, fullWidth = true }: PayeeSelectProps) {
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

  const filteredPayees = useMemo(() => {
    if (!isFiltering) return payees;
    const text = query.trim().toLowerCase();
    if (!text) return payees;
    return payees.filter((payee) => payee.name.toLowerCase().includes(text));
  }, [isFiltering, payees, query]);

  function handleSelectPayee(payeeName: string) {
    setQuery(payeeName);
    setIsFiltering(false);
    onChange(payeeName);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? "w-full min-w-0" : "min-w-fit w-fit"}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder="Payee"
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
          aria-label="Toggle payee list"
        >
          <SelectorChevronIcon />
        </button>
      </div>

      {isOpen && !disabled ? (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded border border-gray-200 bg-white py-1 shadow-md">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setIsOpen(false);
              setIsFiltering(false);
              onAddNew();
            }}
            className="block w-full border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-gray-100"
          >
            + Add new
          </button>
          {filteredPayees.length > 0 ? (
            filteredPayees.map((payee) => (
              <button
                key={payee.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectPayee(payee.name)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                {payee.name} ({payee.kind.toLowerCase()})
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
