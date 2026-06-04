import { RegisterTableColumnGroup } from "@/components/bank-register/register-table-column-group";

export function RegisterTableHeader() {
  return (
    <div className="header-table">
      <table className="w-full min-w-[1025px] table-fixed border-collapse text-sm">
        <RegisterTableColumnGroup />
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
  );
}
