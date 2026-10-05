import { useState } from "react";
import Modal from "./Modal";
import type { PaymentTypeSelectorModalProps } from "../../store/sharedinterfaces";
import { IoIosGitBranch } from "react-icons/io";
import { HiOutlineUsers, HiOutlineArrowRight } from "react-icons/hi2";
import { branches } from "../../store/globals";

const PaymentTypeSelectorModal = ({
  isOpen,
  onCancel,
  onConfirm,
}: PaymentTypeSelectorModalProps) => {
  const [selectedType, setSelectedType] = useState<"branch" | "all">("branch");

  const [selectedBranch, setSelectedBranch] = useState("");

  if (!isOpen) return null;

  return (
    <Modal onClose={onCancel}>
      <div className="p-2 md:p-4 flex flex-col gap-6">
        <div className="text-center md:text-left pr-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            How do you want to pay staff?
          </h3>
          <p className="text-sm text-gray-500">
            Select how you would like to process salary payments for your
            employees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setSelectedType("branch")}
            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-4 ${
              selectedType === "branch"
                ? "border-pryClr bg-pryClr/5 shadow-sm"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`p-3 rounded-lg ${
                  selectedType === "branch"
                    ? "bg-pryClr text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <IoIosGitBranch className="w-6 h-6" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedType === "branch"
                    ? "border-pryClr bg-pryClr"
                    : "border-gray-300"
                }`}
              >
                {selectedType === "branch" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-base mb-1">
                By Branch
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pay staff grouped by their assigned branch location.
              </p>
            </div>
          </div>

          <div
            onClick={() => {
              setSelectedType("all");
              setSelectedBranch("");
            }}
            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-4 ${
              selectedType === "all"
                ? "border-pryClr bg-pryClr/5 shadow-sm"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`p-3 rounded-lg ${
                  selectedType === "all"
                    ? "bg-pryClr text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <HiOutlineUsers className="w-6 h-6" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedType === "all"
                    ? "border-pryClr bg-pryClr"
                    : "border-gray-300"
                }`}
              >
                {selectedType === "all" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-base mb-1">
                All Staff
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Process salary payment for all eligible employees at once.
              </p>
            </div>
          </div>
        </div>

        {selectedType === "branch" && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="branch" className="text-sm font-medium">
                Select branch
              </label>
              <select
                name="branch"
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                }}
                className="border border-gray-300 outline-0 p-2 bg-pryClr/2 rounded-lg"
              >
                <option>Not selected</option>
                {branches.map((branch, idx) => (
                  <option key={idx} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse md:flex-row gap-3 pt-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="w-full md:w-auto px-6 h-11 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm({
                payroll_type: selectedType,
                branch: selectedBranch,
              })
            }
            disabled={
              !selectedType ||
              (selectedType === "branch" && !selectedBranch ? true : false)
            }
            className="w-full md:w-auto px-6 h-11 rounded-lg bg-pryClr text-white font-medium hover:bg-pryClr/90 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Next</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentTypeSelectorModal;
