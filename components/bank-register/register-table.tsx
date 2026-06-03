import { useEffect, useMemo, useRef, useState } from "react";
import { AddTransactionForm } from "@/components/bank-register/add-transaction-form";
import { ActionToolbar } from "@/components/bank-register/action-toolbar";
import { EditTransactionForm } from "@/components/bank-register/edit-transaction-form";
import { PayeeSideModal } from "@/components/bank-register/payee-side-modal";
import type { PayeeOption } from "@/components/bank-register/payee-side-modal";
import { SelectField } from "@/components/bank-register/select-field";
import type { SelectFieldOption } from "@/components/bank-register/select-field";
import { InputField } from "@/components/ui/input-field";
import { Funnel, Printer, Settings2, Upload } from "lucide-react";
import type { RegisterEntry } from "@/modules/accounting/domain/models";
import {
  nextReconcileStatus
} from "@/modules/accounting/presentation/hooks/use-bank-register";
import type {
  DraftTransactionErrors,
  DraftTransactionForm,
  InlineEntryEditorInput
} from "@/modules/accounting/presentation/hooks/use-bank-register";
import {
  getAllBankRegisterTransactionTypes,
  isAccountFieldDisabledForTransactionType,
  isInflowTransactionType,
  isOutflowTransactionType
} from "@/modules/accounting/presentation/transaction-type-policy";
import type {
  BankRegisterTransactionTypeId,
  BankRegisterTransactionTypeOption
} from "@/modules/accounting/presentation/transaction-type-policy";
import { TriangleArrowDownIcon } from "../icons/triangle-arrow-down-icon";

type RegisterTableProps = {
  entries: RegisterEntry[];
  draftTransaction: DraftTransactionForm | null;
  draftErrors: DraftTransactionErrors;
  isSavingDraft: boolean;
  onDraftFieldChange: (
    field: keyof Omit<DraftTransactionForm, "transactionTypeId" | "transactionTypeLabel">,
    value: string
  ) => void;
  onDraftSave: () => void;
  onDraftCancel: () => void;
  onDraftReconcileCycle: () => void;
  onUpdateEntry: (entryId: string, input: InlineEntryEditorInput) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onCycleReconcileStatus: (entryId: string) => void;
  availableTransactionTypes: BankRegisterTransactionTypeOption[];
  selectedTransactionType: BankRegisterTransactionTypeId;
  onAddSelectedTransaction: () => void;
  onSelectTransactionType: (transactionType: BankRegisterTransactionTypeId) => void;
};

function rowStyle(status: RegisterEntry["status"]): string {
  if (status === "VOIDED" || status === "DELETED") {
    return "line-through text-gray-400";
  }
  if (status === "DRAFT") {
    return "text-gray-700";
  }
  return "text-gray-800";
}

function formatTransactionTypeLabel(transactionType: RegisterEntry["transactionType"]): string {
  return transactionType
    .toLowerCase()
    .split("_")
    .map((segment) => (segment ? segment[0].toUpperCase() + segment.slice(1) : segment))
    .join(" ");
}

const INFLOW_ROW_TYPES = new Set<RegisterEntry["transactionType"]>([
  "DEPOSIT",
  "SALES_RECEIPT",
  "RECEIVE_PAYMENT"
]);

const OUTFLOW_ROW_TYPES = new Set<RegisterEntry["transactionType"]>([
  "CHECK",
  "BILL_PAYMENT",
  "REFUND",
  "EXPENSE"
]);

type ReconcileFilterValue = "ALL" | "RECONCILED" | "CLEAR" | "NO_STATUS" | "NO_RECONCILED";
type DateFilterValue =
  | "ALL_DATES"
  | "CUSTOM"
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "THIS_QUARTER"
  | "THIS_YEAR"
  | "LAST_WEEK"
  | "LAST_MONTH"
  | "LAST_QUARTER"
  | "LAST_YEAR";

type RegisterFilterState = {
  find: string;
  reconcileStatus: ReconcileFilterValue;
  transactionType: string;
  payee: string;
  datePreset: DateFilterValue;
  from: string;
  to: string;
};

type ActiveFilterChipKey =
  | "find"
  | "reconcileStatus"
  | "transactionType"
  | "payee"
  | "datePreset"
  | "from"
  | "to";

const DATE_FILTER_OPTIONS: SelectFieldOption[] = [
  { value: "ALL_DATES", label: "All dates" },
  { value: "CUSTOM", label: "Custom" },
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "THIS_MONTH", label: "This month" },
  { value: "THIS_QUARTER", label: "This quarter" },
  { value: "THIS_YEAR", label: "This year" },
  { value: "LAST_WEEK", label: "Last week" },
  { value: "LAST_MONTH", label: "Last month" },
  { value: "LAST_QUARTER", label: "Last quarter" },
  { value: "LAST_YEAR", label: "Last year" }
];

const RECONCILE_FILTER_OPTIONS: SelectFieldOption[] = [
  { value: "ALL", label: "All" },
  { value: "RECONCILED", label: "Reconciled" },
  { value: "CLEAR", label: "Clear" },
  { value: "NO_STATUS", label: "No status" },
  { value: "NO_RECONCILED", label: "No reconciled" }
];

const INITIAL_FILTER_STATE: RegisterFilterState = {
  find: "",
  reconcileStatus: "ALL",
  transactionType: "ALL",
  payee: "ALL",
  datePreset: "ALL_DATES",
  from: "",
  to: ""
};

type ActiveFilterChip = {
  key: ActiveFilterChipKey;
  label: string;
};

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function withDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function resolveDateRange(preset: DateFilterValue, reference = new Date()): { from: string; to: string } {
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());

  if (preset === "ALL_DATES" || preset === "CUSTOM") {
    return { from: "", to: "" };
  }
  if (preset === "TODAY") {
    const value = toIsoDate(today);
    return { from: value, to: value };
  }
  if (preset === "YESTERDAY") {
    const yesterday = withDays(today, -1);
    const value = toIsoDate(yesterday);
    return { from: value, to: value };
  }

  const startOfWeek = withDays(today, -((today.getDay() + 6) % 7));
  const endOfWeek = withDays(startOfWeek, 6);

  if (preset === "THIS_WEEK") {
    return { from: toIsoDate(startOfWeek), to: toIsoDate(endOfWeek) };
  }
  if (preset === "LAST_WEEK") {
    const start = withDays(startOfWeek, -7);
    return { from: toIsoDate(start), to: toIsoDate(withDays(start, 6)) };
  }

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  if (preset === "THIS_MONTH") {
    return { from: toIsoDate(startOfMonth), to: toIsoDate(endOfMonth) };
  }
  if (preset === "LAST_MONTH") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: toIsoDate(start), to: toIsoDate(end) };
  }

  const quarter = Math.floor(today.getMonth() / 3);
  const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
  const endOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0);

  if (preset === "THIS_QUARTER") {
    return { from: toIsoDate(startOfQuarter), to: toIsoDate(endOfQuarter) };
  }
  if (preset === "LAST_QUARTER") {
    const start = new Date(today.getFullYear(), quarter * 3 - 3, 1);
    const end = new Date(today.getFullYear(), quarter * 3, 0);
    return { from: toIsoDate(start), to: toIsoDate(end) };
  }

  if (preset === "THIS_YEAR") {
    return {
      from: toIsoDate(new Date(today.getFullYear(), 0, 1)),
      to: toIsoDate(new Date(today.getFullYear(), 11, 31))
    };
  }
  return {
    from: toIsoDate(new Date(today.getFullYear() - 1, 0, 1)),
    to: toIsoDate(new Date(today.getFullYear() - 1, 11, 31))
  };
}

function parseAmountCondition(find: string): { operator: "lt" | "gt" | "eq"; amount: number } | null {
  const value = find.trim();
  if (!value) return null;

  const greater = value.match(/^>\s*\$?\s*([0-9]+(?:\.[0-9]+)?)$/);
  if (greater) return { operator: "gt", amount: Number(greater[1]) };
  const less = value.match(/^<\s*\$?\s*([0-9]+(?:\.[0-9]+)?)$/);
  if (less) return { operator: "lt", amount: Number(less[1]) };
  const exact = value.match(/^\$?\s*([0-9]+(?:\.[0-9]+)?)$/);
  if (exact) return { operator: "eq", amount: Number(exact[1]) };
  return null;
}

export function RegisterTable({
  entries,
  draftTransaction,
  draftErrors,
  isSavingDraft,
  onDraftFieldChange,
  onDraftSave,
  onDraftCancel,
  onDraftReconcileCycle,
  onUpdateEntry,
  onDeleteEntry,
  onCycleReconcileStatus,
  availableTransactionTypes,
  selectedTransactionType,
  onAddSelectedTransaction,
  onSelectTransactionType
}: RegisterTableProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [isDeletingRow, setIsDeletingRow] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [editor, setEditor] = useState<InlineEntryEditorInput>({
    date: "",
    refNo: "",
    payee: "",
    memo: "",
    payment: "",
    deposit: "",
    reconcileStatus: ""
  });
  const [accountLabel, setAccountLabel] = useState("");
  const [payees, setPayees] = useState<PayeeOption[]>([]);
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const [payeeModalTarget, setPayeeModalTarget] = useState<"draft" | "row">("draft");
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<RegisterFilterState>(INITIAL_FILTER_STATE);
  const [appliedFilter, setAppliedFilter] = useState<RegisterFilterState>(INITIAL_FILTER_STATE);
  const [isFromDateActive, setIsFromDateActive] = useState(false);
  const [isToDateActive, setIsToDateActive] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const allTransactionTypeOptions = useMemo<SelectFieldOption[]>(
    () => [{ value: "ALL", label: "All" }, ...getAllBankRegisterTransactionTypes().map((item) => ({ value: item.id, label: item.label }))],
    []
  );
  const filteredEntries = useMemo(() => {
    const amountCondition = parseAmountCondition(appliedFilter.find);
    const findText = appliedFilter.find.trim().toLowerCase();

    return entries.filter((entry) => {
      if (appliedFilter.reconcileStatus === "RECONCILED" && entry.reconcileStatus !== "R") return false;
      if (appliedFilter.reconcileStatus === "CLEAR" && entry.reconcileStatus !== "C") return false;
      if (appliedFilter.reconcileStatus === "NO_STATUS" && entry.reconcileStatus !== "") return false;
      if (appliedFilter.reconcileStatus === "NO_RECONCILED" && entry.reconcileStatus === "R") return false;

      if (appliedFilter.transactionType !== "ALL" && entry.transactionType !== appliedFilter.transactionType) return false;
      if (appliedFilter.payee !== "ALL" && (entry.payee ?? "") !== appliedFilter.payee) return false;
      if (appliedFilter.from && entry.date < appliedFilter.from) return false;
      if (appliedFilter.to && entry.date > appliedFilter.to) return false;

      if (!findText) return true;

      if (amountCondition) {
        const amount = entry.payment ?? entry.deposit ?? 0;
        if (amountCondition.operator === "gt") return amount > amountCondition.amount;
        if (amountCondition.operator === "lt") return amount < amountCondition.amount;
        return amount === amountCondition.amount;
      }

      const entryTypeLabel = formatTransactionTypeLabel(entry.transactionType).toLowerCase();
      return (
        entry.memo?.toLowerCase().includes(findText) ||
        entry.refNumber?.toLowerCase().includes(findText) ||
        entry.payee?.toLowerCase().includes(findText) ||
        entry.accountLabel?.toLowerCase().includes(findText) ||
        entryTypeLabel.includes(findText)
      );
    });
  }, [appliedFilter, entries]);

  const selectedEntry = useMemo(
    () => filteredEntries.find((entry) => entry.id === selectedEntryId) ?? null,
    [filteredEntries, selectedEntryId]
  );
  const selectedEntryIndex = useMemo(
    () => (selectedEntryId ? filteredEntries.findIndex((entry) => entry.id === selectedEntryId) : -1),
    [filteredEntries, selectedEntryId]
  );
  const entriesBeforeSelected = useMemo(
    () => (selectedEntryIndex >= 0 ? filteredEntries.slice(0, selectedEntryIndex) : filteredEntries),
    [filteredEntries, selectedEntryIndex]
  );
  const entriesAfterSelected = useMemo(
    () => (selectedEntryIndex >= 0 ? filteredEntries.slice(selectedEntryIndex + 1) : []),
    [filteredEntries, selectedEntryIndex]
  );
  const payeeOptions = useMemo(
    () =>
      payees.map((payee) => ({
        value: payee.name,
        label: payee.name,
        rightLabel: payee.kind.toLowerCase()
      })),
    [payees]
  );
  const payeeFilterOptions = useMemo<SelectFieldOption[]>(
    () => [{ value: "ALL", label: "All" }, ...payeeOptions.map((option) => ({ value: option.value, label: option.label }))],
    [payeeOptions]
  );
  const isDraftInflowType = draftTransaction
    ? isInflowTransactionType(draftTransaction.transactionTypeId)
    : false;
  const isDraftOutflowType = draftTransaction
    ? isOutflowTransactionType(draftTransaction.transactionTypeId)
    : false;
  const isDraftAccountFieldDisabled = draftTransaction
    ? isAccountFieldDisabledForTransactionType(draftTransaction.transactionTypeId)
    : false;
  const hasActiveFilters = useMemo(
    () =>
      appliedFilter.find !== "" ||
      appliedFilter.reconcileStatus !== "ALL" ||
      appliedFilter.transactionType !== "ALL" ||
      appliedFilter.payee !== "ALL" ||
      appliedFilter.from !== "" ||
      appliedFilter.to !== "",
    [appliedFilter]
  );
  const reconcileFilterLabelByValue = useMemo(
    () => new Map(RECONCILE_FILTER_OPTIONS.map((option) => [option.value, option.label])),
    []
  );
  const dateFilterLabelByValue = useMemo(
    () => new Map(DATE_FILTER_OPTIONS.map((option) => [option.value, option.label])),
    []
  );
  const transactionTypeLabelByValue = useMemo(
    () => new Map(allTransactionTypeOptions.map((option) => [option.value, option.label])),
    [allTransactionTypeOptions]
  );
  const payeeLabelByValue = useMemo(
    () => new Map(payeeFilterOptions.map((option) => [option.value, option.label])),
    [payeeFilterOptions]
  );
  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];
    if (appliedFilter.transactionType !== "ALL") {
      chips.push({
        key: "transactionType",
        label: transactionTypeLabelByValue.get(appliedFilter.transactionType) ?? appliedFilter.transactionType
      });
    }
    if (appliedFilter.find.trim()) {
      chips.push({ key: "find", label: appliedFilter.find.trim() });
    }
    if (appliedFilter.reconcileStatus !== "ALL") {
      chips.push({
        key: "reconcileStatus",
        label: reconcileFilterLabelByValue.get(appliedFilter.reconcileStatus) ?? appliedFilter.reconcileStatus
      });
    }
    if (appliedFilter.payee !== "ALL") {
      chips.push({ key: "payee", label: payeeLabelByValue.get(appliedFilter.payee) ?? appliedFilter.payee });
    }
    if (appliedFilter.datePreset !== "ALL_DATES") {
      chips.push({
        key: "datePreset",
        label: dateFilterLabelByValue.get(appliedFilter.datePreset) ?? appliedFilter.datePreset
      });
    }
    if (appliedFilter.from) {
      chips.push({ key: "from", label: `From ${appliedFilter.from}` });
    }
    if (appliedFilter.to) {
      chips.push({ key: "to", label: `To ${appliedFilter.to}` });
    }
    return chips;
  }, [appliedFilter, dateFilterLabelByValue, payeeLabelByValue, reconcileFilterLabelByValue, transactionTypeLabelByValue]);

  useEffect(() => {
    setPayees((previous) => {
      const map = new Map(previous.map((item) => [item.name.toLowerCase(), item]));
      entries.forEach((entry) => {
        if (!entry.payee) return;
        const key = entry.payee.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: crypto.randomUUID(),
            name: entry.payee,
            kind: "VENDOR"
          });
        }
      });
      return [...map.values()];
    });
  }, [entries]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      const clickedPopover = filterPopoverRef.current?.contains(target);
      const clickedButton = filterButtonRef.current?.contains(target);
      if (!clickedPopover && !clickedButton) {
        setIsFilterPopoverOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!selectedEntryId) return;
    const stillVisible = filteredEntries.some((entry) => entry.id === selectedEntryId);
    if (!stillVisible) {
      setSelectedEntryId(null);
      setRowError(null);
    }
  }, [filteredEntries, selectedEntryId]);

  function openRowEditor(entry: RegisterEntry) {
    setSelectedEntryId(entry.id);
    setRowError(null);
    setEditor({
      date: entry.date,
      refNo: entry.refNumber ?? "",
      payee: entry.payee ?? "",
      memo: entry.memo ?? "",
      payment: entry.payment ? String(entry.payment) : "",
      deposit: entry.deposit ? String(entry.deposit) : "",
      reconcileStatus: entry.reconcileStatus ?? ""
    });
    setAccountLabel(entry.accountLabel ?? "");
  }

  function cycleEditorReconcileStatus() {
    setEditor((current) => ({ ...current, reconcileStatus: nextReconcileStatus(current.reconcileStatus) }));
  }

  function openPayeeModal(target: "draft" | "row") {
    setPayeeModalTarget(target);
    setIsPayeeModalOpen(true);
  }

  function handleDatePresetChange(value: string) {
    const preset = value as DateFilterValue;
    if (preset === "CUSTOM") {
      setFilterDraft((current) => ({ ...current, datePreset: "CUSTOM" }));
      return;
    }
    const range = resolveDateRange(preset);
    setFilterDraft((current) => ({ ...current, datePreset: preset, from: range.from, to: range.to }));
  }

  function handleApplyFilters() {
    setAppliedFilter(filterDraft);
    setIsFilterPopoverOpen(false);
  }

  function handleResetFilters() {
    setFilterDraft(INITIAL_FILTER_STATE);
    setAppliedFilter(INITIAL_FILTER_STATE);
    setIsFromDateActive(false);
    setIsToDateActive(false);
    setIsFilterPopoverOpen(false);
  }

  function removeActiveFilterChip(key: ActiveFilterChipKey) {
    const nextFilter: RegisterFilterState = { ...appliedFilter };
    if (key === "find") nextFilter.find = "";
    if (key === "reconcileStatus") nextFilter.reconcileStatus = "ALL";
    if (key === "transactionType") nextFilter.transactionType = "ALL";
    if (key === "payee") nextFilter.payee = "ALL";
    if (key === "datePreset") {
      nextFilter.datePreset = "ALL_DATES";
      nextFilter.from = "";
      nextFilter.to = "";
      setIsFromDateActive(false);
      setIsToDateActive(false);
    }
    if (key === "from") {
      nextFilter.from = "";
      nextFilter.datePreset = "CUSTOM";
      setIsFromDateActive(false);
    }
    if (key === "to") {
      nextFilter.to = "";
      nextFilter.datePreset = "CUSTOM";
      setIsToDateActive(false);
    }
    setAppliedFilter(nextFilter);
    setFilterDraft(nextFilter);
  }

  async function handleSaveRow() {
    if (!selectedEntryId) return;
    const payment = Number(editor.payment || 0);
    const deposit = Number(editor.deposit || 0);
    if (!editor.date) {
      setRowError("Date is required.");
      return;
    }
    if ((payment > 0 && deposit > 0) || (payment <= 0 && deposit <= 0)) {
      setRowError("Use only payment or deposit and provide one amount.");
      return;
    }
    try {
      setIsSavingRow(true);
      setRowError(null);
      await onUpdateEntry(selectedEntryId, editor);
      setSelectedEntryId(null);
    } catch (error) {
      setRowError(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setIsSavingRow(false);
    }
  }

  async function handleDeleteRow() {
    if (!selectedEntryId) return;
    try {
      setIsDeletingRow(true);
      setRowError(null);
      await onDeleteEntry(selectedEntryId);
      setSelectedEntryId(null);
    } catch (error) {
      setRowError(error instanceof Error ? error.message : "Failed to delete entry.");
    } finally {
      setIsDeletingRow(false);
    }
  }

  const renderColumnGroup = () => (
    <colgroup>
      <col className="w-[125px]" />
      <col className="w-[100px]" />
      <col className="w-[250px]" />
      <col className="w-[150px]" />
      <col className="w-[120px]" />
      <col className="w-[120px]" />
      <col className="w-[60px]" />
      <col className="w-[120px]" />
    </colgroup>
  );

  const renderReadOnlyEntryTable = (entry: RegisterEntry) => (
    <div key={entry.id}>
      <table className="group w-full min-w-[1025px] table-fixed border-collapse text-sm">
        {renderColumnGroup()}
        <tbody>
          <tr className={`cursor-pointer group-hover:bg-[#f3f8fe] ${rowStyle(entry.status)}`} onClick={() => openRowEditor(entry)}>
            <td className="p-2 text-[13px] align-top text-gray-800">
              {entry.date}
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] align-top">
              {entry.refNumber ?? ""}
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] align-top">
              {entry.payee ?? ""}
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] align-top text-gray-800">
              {entry.memo ?? ""}
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] text-right align-top text-gray-800">
              {entry.payment ? entry.payment.toFixed(2) : ""}
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] text-right align-top text-gray-800">
              {entry.deposit ? entry.deposit.toFixed(2) : ""}
            </td>
            <td className="border-l text-center border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] align-top text-gray-800">
              {entry.reconcileStatus}
            </td>
            <td className="p-2 border-l border-l-dotted border-l-[var(--color-divider-tertiary)] text-[13px] text-right align-top font-medium text-gray-900">
              {entry.runningBalance.toFixed(2)}
            </td>
          </tr>
          <tr
            className={`cursor-pointer border-b border-gray-100 bg-[#f9fafb] group-hover:bg-[#ebf0f7]`}
            onClick={() => openRowEditor(entry)}
          >
            <td className="p-2 text-[13px] align-top text-gray-500">
              &nbsp;
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] align-top text-gray-500">
              {formatTransactionTypeLabel(entry.transactionType)}
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] align-top text-gray-500">
              {entry.accountLabel ?? ""}
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] align-top text-gray-500">
              &nbsp;
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] text-right align-top text-gray-500">
              &nbsp;
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] text-right align-top text-gray-500">
              &nbsp;
            </td>
            <td className="border-l border-l-dotted border-l-[var(--color-divider-tertiary)] p-2 text-[13px] text-center align-top text-gray-500">
              &nbsp;
            </td>
            <td className="p-2 border-l border-l-dotted border-l-[var(--color-divider-tertiary)] text-[13px] text-right align-top text-gray-500">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="register-table relative overflow-visible bg-white">
      <div className="action-bar flex h-[45px] items-center justify-between border-b border-gray-200 px-4">
        <div className="relative flex items-center gap-1">
          <button
            ref={filterButtonRef}
            type="button"
            className="flex h-full items-center gap-1 text-sm text-[#BABEC5] hover:text-[var(--color-icon-secondary)]"
            aria-label="Filter register rows"
            onClick={() => setIsFilterPopoverOpen((current) => !current)}
          >
            <Funnel className="h-[18px] w-[18px]" aria-hidden="true" />
            <TriangleArrowDownIcon className="h-[18px] w-[18px] text-[var(--color-icon-primary)]" />
          </button>
          {hasActiveFilters ? (
            <div className="ml-1 flex flex-wrap items-center gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[13px] text-gray-700"
                >
                  {chip.label}
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={`Remove ${chip.label} filter`}
                    onClick={() => removeActiveFilterChip(chip.key)}
                  >
                    x
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="text-[13px] text-[var(--color-link-text)] hover:underline"
                onClick={handleResetFilters}
              >
                Clear filter / View All
              </button>
            </div>
          ) : (
            <span>All</span>
          )}
          {isFilterPopoverOpen ? (
            <div
              ref={filterPopoverRef}
              className="form-popover absolute left-0 top-full z-50 mt-1 w-[530px] overflow-visible rounded-md border border-gray-200 bg-white p-0 pt-[5px] shadow-lg"
            >
              <div className="space-y-3 px-4 pb-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Find</label>
                  <InputField
                    type="text"
                    value={filterDraft.find}
                    onChange={(event) => setFilterDraft((current) => ({ ...current, find: event.target.value }))}
                    placeholder="Memo, Ref no, $amt, > $amt, < $amt"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Reconcile status</label>
                    <SelectField
                      value={filterDraft.reconcileStatus}
                      onChange={(value) =>
                        setFilterDraft((current) => ({ ...current, reconcileStatus: value as ReconcileFilterValue }))
                      }
                      options={RECONCILE_FILTER_OPTIONS}
                      placeholder="Select status"
                      allowCustomValue={false}
                      optionSize="sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Transaction type</label>
                    <SelectField
                      value={filterDraft.transactionType}
                      onChange={(value) => setFilterDraft((current) => ({ ...current, transactionType: value }))}
                      options={allTransactionTypeOptions}
                      placeholder="All"
                      allowCustomValue={false}
                      optionSize="sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Payee</label>
                    <SelectField
                      value={filterDraft.payee}
                      onChange={(value) => setFilterDraft((current) => ({ ...current, payee: value }))}
                      options={payeeFilterOptions}
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
                      onChange={handleDatePresetChange}
                      options={DATE_FILTER_OPTIONS}
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
                      onFocus={() => setIsFromDateActive(true)}
                      onBlur={() => {
                        if (!filterDraft.from) {
                          setIsFromDateActive(false);
                        }
                      }}
                      onChange={(event) =>
                        setFilterDraft((current) => ({
                          ...current,
                          datePreset: "CUSTOM",
                          from: event.target.value
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">To</label>
                    <InputField
                      type={isToDateActive || Boolean(filterDraft.to) ? "date" : "text"}
                      value={filterDraft.to || ""}
                      placeholder=""
                      onFocus={() => setIsToDateActive(true)}
                      onBlur={() => {
                        if (!filterDraft.to) {
                          setIsToDateActive(false);
                        }
                      }}
                      onChange={(event) =>
                        setFilterDraft((current) => ({
                          ...current,
                          datePreset: "CUSTOM",
                          to: event.target.value
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" className="button secondary" onClick={handleResetFilters}>
                    Reset
                  </button>
                  <button type="button" className="button primary" onClick={handleApplyFilters}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex h-full items-center gap-4 text-[#BABEC5]">
          <button
            type="button"
            className="flex h-full items-center hover:text-[var(--color-icon-secondary)]"
            aria-label="Print"
          >
            <Printer className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-full items-center hover:text-[var(--color-icon-secondary)]"
            aria-label="Export"
          >
            <Upload className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-full items-center hover:text-[var(--color-icon-secondary)]"
            aria-label="Settings"
          >
            <Settings2 className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="header-table">
        <table className="w-full min-w-[1025px] table-fixed border-collapse text-sm">
          {renderColumnGroup()}
          <thead className="text-left uppercase tracking-wide">
            <tr>
              <th className="px-2 pb-[5px] pt-2 text-left align-middle">
                Date
              </th>
              <th className="border-l-custom px-2 pb-[5px] pt-2 text-left align-middle">
                Ref No.
              </th>
              <th className="border-l-custom px-2 pb-[5px] pt-2 text-left align-middle">
                Payee
              </th>
              <th className="border-l-custom px-2 pb-[5px] pt-2 text-left align-middle">
                Memo
              </th>
              <th className="border-l-custom px-2 pb-[5px] pt-2 text-right align-middle">
                Payment
              </th>
              <th className="border-l-custom px-2 pb-[5px] pt-2 text-right align-middle">
                Deposit
              </th>
              <th className="border-l-custom px-2 pb-[5px] pt-2 text-center align-middle">
                ✓
              </th>
              <th className="border-l-custom px-2 pb-[5px] pt-2 text-right align-middle">
                Balance
              </th>
            </tr>
            <tr>
              <th className=" px-2 pb-[6px] pt-0 text-left tracking-normal">
                &nbsp;
              </th>
              <th className="border-l-custom px-2 pb-[6px] pt-0 text-left tracking-normal">
                Type
              </th>
              <th className="border-l-custom px-2 pb-[6px] pt-0 text-left tracking-normal">
                Account
              </th>
              <th className="border-l-custom px-2 pb-[6px] pt-0 text-left tracking-normal">
                &nbsp;
              </th>
              <th className="border-l-custom px-2 pb-[6px] pt-0 text-right tracking-normal">
                &nbsp;
              </th>
              <th className="border-l-custom px-2 pb-[6px] pt-0 text-right tracking-normal">
                &nbsp;
              </th>
              <th className="border-l-custom px-2 pb-[6px] pt-0 text-center tracking-normal">
                &nbsp;
              </th>
              <th className="border-l-custom px-2 pb-[6px] pt-0 text-right tracking-normal">
                &nbsp;
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="content-table">
        <div className="actions-quickadd">
          <ActionToolbar
            availableTransactionTypes={availableTransactionTypes}
            selectedTransactionType={selectedTransactionType}
            onAddSelectedTransaction={onAddSelectedTransaction}
            onSelectTransactionType={onSelectTransactionType}
          />
        </div>

        {draftTransaction ? (
          <AddTransactionForm
            draftTransaction={draftTransaction}
            draftErrors={draftErrors}
            payeeOptions={payeeOptions}
            isDraftAccountFieldDisabled={isDraftAccountFieldDisabled}
            isDraftInflowType={isDraftInflowType}
            isDraftOutflowType={isDraftOutflowType}
            isSavingDraft={isSavingDraft}
            renderColumnGroup={renderColumnGroup}
            onDraftFieldChange={onDraftFieldChange}
            onDraftSave={onDraftSave}
            onDraftCancel={onDraftCancel}
            onReconcileCycle={onDraftReconcileCycle}
            onOpenPayeeModal={() => openPayeeModal("draft")}
          />
        ) : null}

        {filteredEntries.length === 0 ? (
          <div className="no-transactions-data ">There are no transactions matching the selected criteria</div>
        ) : (
          <>
            {entriesBeforeSelected.map(renderReadOnlyEntryTable)}

            {selectedEntry ? (
              <div key={selectedEntry.id}>
                <table className="w-full min-w-[1025px] table-fixed border-collapse text-sm">
                  {renderColumnGroup()}
                  <tbody>
                    <tr>
                      <td colSpan={8} className="p-0">
                        <EditTransactionForm
                          entry={selectedEntry}
                          editor={editor}
                          accountLabel={accountLabel}
                          payeeOptions={payeeOptions}
                          rowError={rowError}
                          isSavingRow={isSavingRow}
                          isDeletingRow={isDeletingRow}
                          isPaymentDisabled={INFLOW_ROW_TYPES.has(selectedEntry.transactionType)}
                          isDepositDisabled={OUTFLOW_ROW_TYPES.has(selectedEntry.transactionType)}
                          renderColumnGroup={renderColumnGroup}
                          onEditorChange={(field, value) => setEditor((current) => ({ ...current, [field]: value }))}
                          onReconcileCycle={cycleEditorReconcileStatus}
                          onAccountLabelChange={setAccountLabel}
                          onOpenPayeeModal={() => openPayeeModal("row")}
                          onDelete={handleDeleteRow}
                          onCancel={() => {
                            setSelectedEntryId(null);
                            setRowError(null);
                          }}
                          onSave={handleSaveRow}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : null}

            {entriesAfterSelected.map(renderReadOnlyEntryTable)}
          </>
        )}
      </div>

      <PayeeSideModal
        open={isPayeeModalOpen}
        onClose={() => setIsPayeeModalOpen(false)}
        onSave={(payee) => {
          setPayees((previous) => {
            const exists = previous.some((item) => item.name.toLowerCase() === payee.name.toLowerCase());
            return exists ? previous : [...previous, payee];
          });

          if (payeeModalTarget === "draft" && draftTransaction) {
            onDraftFieldChange("payee", payee.name);
          }
          if (payeeModalTarget === "row") {
            setEditor((current) => ({ ...current, payee: payee.name }));
          }
        }}
      />
    </div>
  );
}
