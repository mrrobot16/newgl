"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InputField } from "@/components/ui/input-field";

export type SelectFieldOption = {
  value: string;
  label: string;
  rightLabel?: string;
  keywords?: string[];
};

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  allowCustomValue?: boolean;
  optionSize?: "default" | "sm";
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

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  fullWidth = true,
  className = "",
  onAddNew,
  addNewLabel = "+ Add new",
  allowCustomValue = true,
  optionSize = "default"
}: SelectFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    if (allowCustomValue) {
      setQuery(value);
      return;
    }
    setQuery(selectedOption?.label ?? "");
  }, [allowCustomValue, selectedOption?.label, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!allowCustomValue) {
          setQuery(selectedOption?.label ?? "");
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [allowCustomValue, selectedOption?.label]);

  const filteredOptions = useMemo(() => {
    if (!isFiltering) return options;
    const text = query.trim().toLowerCase();
    if (!text) return options;
    return options.filter((option) => {
      if (option.label.toLowerCase().includes(text)) return true;
      if (option.rightLabel?.toLowerCase().includes(text)) return true;
      if (!option.keywords) return false;
      return option.keywords.some((keyword) => keyword.toLowerCase().includes(text));
    });
  }, [isFiltering, options, query]);

  function handleSelectOption(option: SelectFieldOption) {
    setQuery(option.label);
    setIsFiltering(false);
    onChange(option.value);
    setIsOpen(false);
  }

  const optionTextClassName = optionSize === "sm" ? "text-[13px]" : "text-sm";
  const optionLabelClassName = optionSize === "sm" ? "text-[13px] text-gray-700" : "text-left text-gray-700";
  const optionRightLabelClassName = optionSize === "sm" ? "text-[13px] text-gray-500" : "text-right text-gray-500";

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full min-w-0" : "min-w-fit w-fit"} ${className}`}
    >
      <div className="relative">
        <InputField
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onClick={() => {
            setIsOpen(true);
            setIsFiltering(false);
          }}
          onChange={(event) => {
            const text = event.target.value;
            setQuery(text);
            setIsFiltering(true);
            if (allowCustomValue) {
              onChange(text);
            }
            setIsOpen(true);
          }}
          className={`selector-field ${fullWidth ? "w-full" : "w-[208px]"} pr-9`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setIsFiltering(false);
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            if (!nextOpen && !allowCustomValue) {
              setQuery(selectedOption?.label ?? "");
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
          aria-label="Toggle options list"
        >
          <SelectorChevronIcon />
        </button>
      </div>

      {isOpen && !disabled ? (
        <div className="absolute left-0 z-50 mt-1 max-h-64 w-max min-w-full max-w-[min(90vw,56rem)] overflow-y-auto rounded border border-gray-200 bg-white py-1 shadow-md">
          {onAddNew ? (
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
              {addNewLabel}
            </button>
          ) : null}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectOption(option)}
                className={`selector-option grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-2 text-left ${
                  option.value === value
                    ? `selector-option-selected ${optionTextClassName}`
                    : `${optionTextClassName} hover:bg-gray-100`
                }`}
              >
                <span className={`selector-option-label whitespace-nowrap ${optionLabelClassName}`}>{option.label}</span>
                {option.rightLabel ? (
                  <span className={`shrink-0 ${optionRightLabelClassName}`}>{option.rightLabel}</span>
                ) : null}
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
