import type { ReconcileStatus } from "@/modules/accounting/domain/models";

export function reconcileStatusClassName(status: ReconcileStatus): string {
  if (status === "C") {
    return "text-gray-500 font-medium text-sm";
  }
  if (status === "R") {
    return "text-green-600 font-medium text-sm";
  }
  return "";
}

type ReconcileStatusCellProps = {
  status: ReconcileStatus;
  className?: string;
  onCycle: () => void;
};

export function ReconcileStatusCell({ status, className = "", onCycle }: ReconcileStatusCellProps) {
  return (
    <td className="form-control">
      <div
        onClick={(event) => {
          event.stopPropagation();
          onCycle();
        }}
        className={`flex h-[32px] w-full rounded-full cursor-pointer items-center justify-center bg-white text-[13px] ${className}`.trim()}
      >
        <span className={reconcileStatusClassName(status)}>{status}</span>
      </div>
    </td>
  );
}
