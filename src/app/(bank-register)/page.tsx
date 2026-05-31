import { BankRegisterLayout } from "@/components/bank-register/bank-register-layout";

export default function BankRegisterPage() {
  return (
    <div className="h-screen bg-[#f4f5f8] p-[6px] pl-0">
      <div className="flex h-full">
        <aside className="h-full w-[73px] bg-[#f0f4f6]" />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="h-[57px] rounded-t-[var(--radius-x-large)] bg-[#ffffff]" />
          <div className="min-h-0 flex-1 overflow-auto rounded-b-[var(--radius-x-large)]">
            <BankRegisterLayout />
          </div>
        </div>
      </div>
    </div>
  );
}
