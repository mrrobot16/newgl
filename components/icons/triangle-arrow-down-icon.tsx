type TriangleArrowDownIconProps = {
  className?: string;
};

export function TriangleArrowDownIcon({ className = "h-4 w-4" }: TriangleArrowDownIconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M5.25 7.5 10 12.25 14.75 7.5" />
    </svg>
  );
}
