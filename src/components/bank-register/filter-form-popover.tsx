import type { RefObject } from "react";
import { SelectField } from "@/components/bank-register/select-field";
import type { SelectFieldOption } from "@/components/bank-register/select-field";
import { InputField } from "@/components/ui/input-field";

type FilterFormState = {
  find: string;
  reconcileStatus: string;
  transactionType: string;
  payee: string;
  datePreset: string;
  from: string;
  to: string;
};

type FilterFormPopoverProps = {
  popoverRef: RefObject<HTMLDivElement | null>;
  filterDraft: FilterFormState;
  isFromDateActive: boolean;
  isToDateActive: boolean;
  reconcileOptions: SelectFieldOption[];
  transactionTypeOptions: SelectFieldOption[];
  payeeOptions: SelectFieldOption[];
  dateOptions: SelectFieldOption[];
  onFindChange: (value: string) => void;
  onReconcileStatusChange: (value: string) => void;
  onTransactionTypeChange: (value: string) => void;
  onPayeeChange: (value: string) => void;
  onDatePresetChange: (value: string) => void;
  onFromFocus: () => void;
  onFromBlur: () => void;
  onFromChange: (value: string) => void;
  onToFocus: () => void;
  onToBlur: () => void;
  onToChange: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
};

export function FilterFormPopover({
  popoverRef,
  filterDraft,
  isFromDateActive,
  isToDateActive,
  reconcileOptions,
  transactionTypeOptions,
  payeeOptions,
  dateOptions,
  onFindChange,
  onReconcileStatusChange,
  onTransactionTypeChange,
  onPayeeChange,
  onDatePresetChange,
  onFromFocus,
  onFromBlur,
  onFromChange,
  onToFocus,
  onToBlur,
  onToChange,
  onReset,
  onApply
}: FilterFormPopoverProps) {
  return (
    <div
      ref={popoverRef}
      className="form-popover absolute left-0 top-full z-50 mt-1 w-[530px] overflow-visible rounded-md border border-gray-200 bg-white p-0 pt-[5px] shadow-lg"
    >
      <div className="space-y-3 px-4 pb-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Find</label>
          <InputField
            type="text"
            value={filterDraft.find}
            onChange={(event) => onFindChange(event.target.value)}
            placeholder="Memo, Ref no, $amt, > $amt, < $amt"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Reconcile status</label>
            <SelectField
              value={filterDraft.reconcileStatus}
              onChange={onReconcileStatusChange}
              options={reconcileOptions}
              placeholder="Select status"
              allowCustomValue={false}
              optionSize="sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Transaction type</label>
            <SelectField
              value={filterDraft.transactionType}
              onChange={onTransactionTypeChange}
              options={transactionTypeOptions}
              placeholder="All"
              allowCustomValue={false}
              optionSize="sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Payee</label>
            <SelectField
              value={filterDraft.payee}
              onChange={onPayeeChange}
              options={payeeOptions}
              placeholder="All"
              allowCustomValue={false}
              optionSize="sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Date</label>
            <SelectField
              value={filterDraft.datePreset}
              onChange={onDatePresetChange}
              options={dateOptions}
              placeholder="All dates"
              allowCustomValue={false}
              optionSize="sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">From</label>
            <InputField
              type={isFromDateActive || Boolean(filterDraft.from) ? "date" : "text"}
              value={filterDraft.from || ""}
              placeholder=""
              onFocus={onFromFocus}
              onBlur={onFromBlur}
              onChange={(event) => onFromChange(event.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">To</label>
            <InputField
              type={isToDateActive || Boolean(filterDraft.to) ? "date" : "text"}
              value={filterDraft.to || ""}
              placeholder=""
              onFocus={onToFocus}
              onBlur={onToBlur}
              onChange={(event) => onToChange(event.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="button secondary" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="button primary" onClick={onApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
