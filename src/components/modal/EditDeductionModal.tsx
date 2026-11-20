import React from "react";
import Modal from "./Modal";
import FormattedNumberInput from "../forms/FormattedNumberInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateDeductionMutation } from "../../hooks/useApiQueries";
import type { EditDeductionModalProps } from "../../store/sharedinterfaces";
import { formatterUtility } from "../../utilities/FormatterUtility";

const EditDeductionModal: React.FC<EditDeductionModalProps> = ({
  isOpen,
  title = "Edit Deduction",
  deduction,
  onClose,
  onSuccess,
}) => {
  const updateDeductionMutation = useUpdateDeductionMutation();
  const employer = deduction?.employer;

  const formik = useFormik({
    initialValues: {
      amount: deduction?.amount
        ? Number(deduction.amount)
        : ("" as number | ""),
      no_of_month: deduction?.no_of_month
        ? Number(deduction.no_of_month)
        : ("" as number | ""),
      reason: deduction?.reason || "",
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
      if (!deduction?.id) return;

      updateDeductionMutation.mutate(
        {
          id: deduction.id,
          payload: {
            amount: Number(values.amount),
            reason: values.reason.trim(),
            no_of_month: Number(values.no_of_month),
          },
        },
        {
          onSuccess: () => {
            resetForm();
            onClose();
            onSuccess?.();
          },
        },
      );
    },
  });

  if (!isOpen || !deduction) return null;

  return (
    <Modal onClose={onClose}>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
        <div>
          <h3 className="md:text-2xl text-xl font-bold text-gray-900">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Update deduction amount, duration, or reason for this employee.
          </p>
        </div>

        {employer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs flex flex-wrap justify-between items-center gap-2">
            <div>
              <p className="text-gray-500">Employee</p>
              <p className="font-semibold text-gray-800 text-sm">
                {employer.full_name}
              </p>
              <p className="text-gray-500 text-[11px]">
                {employer.jobTitle || employer.department || employer.company_branch || "Staff"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Base Salary</p>
              <p className="font-bold text-pryClr text-sm">
                ₦{formatterUtility(Number(employer.salary_amount || 0))}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Amount to Deduct */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit_amount"
              className="text-xs font-medium text-gray-700"
            >
              Deduction Amount (₦) <span className="text-red-500">*</span>
            </label>
            <FormattedNumberInput
              name="amount"
              id="edit_amount"
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
              htmlFor="edit_no_of_month"
              className="text-xs font-medium text-gray-700"
            >
              Duration (Number of Months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="no_of_month"
              id="edit_no_of_month"
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
              htmlFor="edit_reason"
              className="text-xs font-medium text-gray-700"
            >
              Reason for Deduction <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              id="edit_reason"
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
            disabled={updateDeductionMutation.isPending}
            className="w-full md:w-auto px-5 h-[45px] rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateDeductionMutation.isPending}
            className="w-full md:w-auto px-6 h-[45px] bg-pryClr text-white rounded-lg hover:bg-pryClr/90 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm font-medium"
          >
            {updateDeductionMutation.isPending
              ? "Updating Deduction..."
              : "Update Deduction"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDeductionModal;