import React from "react";
import Modal from "./Modal";
import { MdModeEditOutline } from "react-icons/md";
import type { ViewDeductionModalProps } from "../../store/sharedinterfaces";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../../utilities/FormatterUtility";

const ViewDeductionModal: React.FC<ViewDeductionModalProps> = ({
  isOpen,
  deduction,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !deduction) return null;

  const employer = deduction.employer;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Completed
          </span>
        );
      case "stopped":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
            Stopped
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200 capitalize">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between pr-8">
          <h3 className="md:text-2xl text-xl font-bold text-gray-900">
            Deduction Details
          </h3>
          <div>{getStatusBadge(deduction.status)}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 max-h-[60vh] overflow-y-scroll styled-scrollbar pr-2">
          {/* Section: Deduction Details */}
          <div className="md:col-span-2 border-b border-gray-200 pb-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Deduction Information
            </h4>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Deduction Amount</p>
            <p className="text-base font-bold text-red-600">
              ₦{formatterUtility(Number(deduction.amount || 0))}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Duration</p>
            <p className="text-sm font-semibold text-gray-800">
              {deduction.no_of_month} month{Number(deduction.no_of_month) > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Deduction Period</p>
            <p className="text-sm font-semibold text-gray-800">
              {deduction.start_date || "-"} &rarr; {deduction.end_date || "-"}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Date Created</p>
            <p className="text-sm font-semibold text-gray-800">
              {formatISODateToCustom(deduction.created_at) || "-"}
            </p>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Reason</p>
            <p className="text-sm font-medium text-gray-800 bg-gray-50 p-2.5 rounded-md border border-gray-200">
              {deduction.reason || "No reason specified"}
            </p>
          </div>

          {/* Section: Employee Details */}
          <div className="md:col-span-2 border-b border-gray-200 pb-2 mt-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Employee Information
            </h4>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Full Name</p>
            <p className="text-sm font-semibold text-gray-800">
              {employer?.full_name || "N/A"}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Email Address</p>
            <p className="text-sm font-semibold text-gray-800">
              {employer?.email || "N/A"}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Phone</p>
            <p className="text-sm font-semibold text-gray-800">
              {employer?.phone || "N/A"}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Branch</p>
            <p className="text-sm font-semibold text-gray-800">
              {employer?.company_branch || "N/A"}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Job Title</p>
            <p className="text-sm font-semibold text-gray-800">
              {employer?.jobTitle || "N/A"}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Department</p>
            <p className="text-sm font-semibold text-gray-800">
              {employer?.department || "N/A"}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Base Salary</p>
            <p className="text-sm font-semibold text-pryClr">
              ₦{formatterUtility(Number(employer?.salary_amount || 0))}
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
            <p className="text-xs font-medium text-gray-500">Bank Details</p>
            <p className="text-sm font-semibold text-gray-800">
              {employer?.bank_name ? `${employer.bank_name} - ${employer.account_number}` : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-[45px] rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm font-medium cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-6 h-[45px] bg-pryClr text-white rounded-lg hover:bg-pryClr/90 transition text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <MdModeEditOutline size={16} />
              <span>Edit Deduction</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewDeductionModal;