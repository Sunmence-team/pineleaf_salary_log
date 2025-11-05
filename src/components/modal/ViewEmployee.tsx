import Modal from "./Modal";
import type { employeeProps } from "../../store/sharedinterfaces";

interface ViewEmployeeProps {
  isOpen: boolean;
  title?: string;
  employee: employeeProps | null;
  onClose: () => void;
  onUpdate: () => void;
}

const ViewEmployee = ({
  isOpen,
  title = "Employee Details",
  employee,
  onClose,
  onUpdate,
}: ViewEmployeeProps) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="md:text-2xl text-xl font-bold">{title}</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-x-4 md:h-[30vh] h-[50vh] lg:h-[40vh] overflow-y-scroll styled-scrollbar pr-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Full Name</p>
            <p className="text-sm capitalize font-semibold">{employee?.full_name}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Email Address</p>
            <p className="text-sm font-semibold">{employee?.email}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Phone Number</p>
            <p className="text-sm capitalize font-semibold">{employee?.phone}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Department</p>
            <p className="text-sm capitalize font-semibold">{employee?.company_branch}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Bank Name</p>
            <p className="text-sm capitalize font-semibold">{employee?.bank_name}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Account Number</p>
            <p className="text-sm capitalize font-semibold">{employee?.account_number}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Account Name</p>
            <p className="text-sm capitalize font-semibold">{employee?.account_name}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">Estimate Pay</p>
            <p className="text-sm capitalize font-semibold">₦{employee?.salary_amount}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={onUpdate}
            className="text-sm h-[50px] bg-pryClr px-4 text-white rounded-lg cursor-pointer"
          >
            Edit Details
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewEmployee;
