import React, { useState } from "react";
import Modal from "./Modal";
import FormattedNumberInput from "../forms/FormattedNumberInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useCreateDeductionMutation,
  useEmployeesQuery,
} from "../../hooks/useApiQueries";
import type {
  DeductionModalProps,
  employeeProps,
} from "../../store/sharedinterfaces";
import { formatterUtility } from "../../utilities/FormatterUtility";
import { toast } from "sonner";

const DeductionModal: React.FC<DeductionModalProps> = ({
  isOpen,
  title = "Add Deduction",
  employee,
  onClose,
  onSuccess,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const createDeductionMutation = useCreateDeductionMutation();

  const { data: employeesData, isLoading: loadingEmployees } =
    useEmployeesQuery({
      per_page: 100,
    });
  const allEmployees: employeeProps[] = employeesData?.data?.data || [];
  const targetEmployee =
    employee ||
    allEmployees.find((e) => String(e.id) === String(selectedEmpId)) ||
    null;

  const formik = useFormik({
    initialValues: {
      amount: "" as number | "",
      no_of_month: "" as number | "",
      reason: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Please enter a valid amount")
        .required("Deduction amount is required")
        .positive("Amount must be greater than 0"),
      no_of_month: Yup.number()
        .typeError("Please enter valid number of months")
        .required("Number of months is required")
        .integer("Must be a whole number")
        .min(1, "Must be at least 1 month"),
      reason: Yup.string()
        .trim()
        .required("Reason for deduction is required")
        .min(3, "Reason must be at least 3 characters"),
    }),
    onSubmit: (values, { resetForm }) => {
      const empId = employee?.id || selectedEmpId;
      if (!empId) {
        toast.error("Please select an employee");
        return;
      }

      createDeductionMutation.mutate(
        {
          employee_id: Number(empId),
          amount: Number(values.amount),
          reason: values.reason.trim(),
          no_of_month: Number(values.no_of_month),
        },
        {
          onSuccess: () => {
            resetForm();
            setSelectedEmpId("");
            onClose();
            onSuccess?.();
          },
        },
      );
    },
  });

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
        <div>
          <h3 className="md:text-2xl text-xl font-bold text-gray-900">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Apply a recurring or one-off deduction to employee salary.
          </p>
        </div>

        {!employee && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="select_employee"
              className="text-xs font-medium text-gray-700"
            >
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              id="select_employee"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="md:text-sm text-xs py-2 px-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr w-full"
            >
              <option value="">
                {loadingEmployees ? "Loading employees..." : "-- Choose an employee --"}
              </option>
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.department || emp.company_branch} - ₦
                  {formatterUtility(Number(emp.salary_amount || 0))})
                </option>
              ))}
            </select>
          </div>
        )}

        {targetEmployee && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs flex flex-wrap justify-between items-center gap-2">
            <div>
              <p className="text-gray-500">Employee</p>
              <p className="font-semibold text-gray-800 text-sm">
                {targetEmployee.full_name}
              </p>
              <p className="text-gray-500 text-[11px]">
                {targetEmployee.jobTitle || targetEmployee.department || "Staff"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Current Salary</p>
              <p className="font-bold text-pryClr text-sm">
                ₦{formatterUtility(Number(targetEmployee.salary_amount || 0))}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Amount to Deduct */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="amount"
              className="text-xs font-medium text-gray-700"
            >
              Amount to Deduct (₦) <span className="text-red-500">*</span>
            </label>
            <FormattedNumberInput
              name="amount"
              id="amount"
              placeholder="e.g. 15,000"
              value={formik.values.amount}
              onChange={(val) => formik.setFieldValue("amount", val)}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr w-full"
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-xs text-red-600">
                {formik.errors.amount as string}
              </p>
            )}
          </div>

          {/* Number of Months */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="no_of_month"
              className="text-xs font-medium text-gray-700"
            >
              Duration (Number of Months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="no_of_month"
              id="no_of_month"
              min={1}
              step={1}
              placeholder="e.g. 3"
              value={formik.values.no_of_month}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr w-full"
            />
            {formik.touched.no_of_month && formik.errors.no_of_month && (
              <p className="text-xs text-red-600">
                {formik.errors.no_of_month as string}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reason"
              className="text-xs font-medium text-gray-700"
            >
              Reason for Deduction <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              id="reason"
              rows={3}
              placeholder="e.g. Uncompleted task deadline penalty"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 px-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr w-full resize-none"
            />
            {formik.touched.reason && formik.errors.reason && (
              <p className="text-xs text-red-600">
                {formik.errors.reason as string}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={createDeductionMutation.isPending}
            className="w-full md:w-auto px-5 h-[45px] rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createDeductionMutation.isPending}
            className="w-full md:w-auto px-6 h-[45px] bg-pryClr text-white rounded-lg hover:bg-pryClr/90 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm font-medium"
          >
            {createDeductionMutation.isPending
              ? "Applying Deduction..."
              : "Apply Deduction"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeductionModal;