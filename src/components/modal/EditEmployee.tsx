import React, { useEffect, useState } from "react";
import type { bankProps, employeeProps } from "../../store/sharedinterfaces";
import Modal from "./Modal";
import { toast } from "sonner";
import {
  fetchPaystackBanks,
  resolveAccountNumber,
} from "../../utilities/paystackHelper";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../utilities/api";
import { useUser } from "../../context/UserContext";

interface EditEmployeeProps {
  isOpen: boolean;
  title?: string;
  employee: employeeProps | null;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const EditEmployee = ({
  isOpen,
  title = "Edit employee details",
  employee,
  confirmText = "Yes, Update",
  onCancel,
  onConfirm,
}: EditEmployeeProps) => {
  if (!isOpen) return null;

  const [banks, setBanks] = useState<bankProps[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const { token, logout } = useUser();

  useEffect(() => {
    window.scrollTo(0, 0);
    const getBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const fetchedBanks = await fetchPaystackBanks();
        setBanks(fetchedBanks);
      } catch (error) {
        toast.error("Failed to load banks.");
      } finally {
        setIsLoadingBanks(false);
      }
    };
    getBanks();
  }, []);

  const initialValues = employee ?? {
    full_name: "",
    email: "",
    phone: "",
    department: "",
    bank_name: "",
    account_number: "",
    account_name: "",
    salary_amount: "",
  };

  const formik = useFormik<any>({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      full_name: Yup.string().required("Full Name is required"),
      email: Yup.string()
        .email("Invalid Email address")
        .required("Email address is required"),
      phone: Yup.string().required("Phone Number is required"),
      department: Yup.string().required("Company branch is required"),
      bank_name: Yup.string().required("Bank Name is required"),
      account_number: Yup.string()
        .required("Account Number is required")
        .matches(/^\d{8,20}$/, "Account Number must be 8-20 digits"),
      account_name: Yup.string().required("Account Name is required"),
      salary_amount: Yup.string().required("Employee estimate pay is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log("employee create values: ", values);

      try {
        const response = await api.put(
          `/edit_employers/${employee?.id}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          toast.success(response.data.message);
          resetForm();
          onConfirm();
        }
      } catch (err: any) {
        console.error("Error fetching employees:", err);
        if (err.code === "ECONNABORTED") {
          toast.error("Request timed out. Please try again.");
        } else if (err.response) {
          toast.error(
            err.response.data?.message || "Something went wrong on the server."
          );
        } else if (err.request) {
          toast.error("Server not responding. Please check your connection.");
        } else if (err.response.data.message === "Unauthenticated.") {
          const load = toast.loading("Session timed out. logging out");
          setTimeout(() => {
            logout();
            toast.dismiss(load);
          }, 500);
        } else {
          toast.error(
            `An unexpected error occurred while editing ${employee?.full_name} details ` +
              err.message
          );
          console.error("Error during editing details: ", err);
        }
      }
    },
  });

  useEffect(() => {
    const resolveAccount = async () => {
      if (formik.values.account_number.length === 10 && selectedBankCode) {
        setIsResolving(true);
        try {
          const resolvedData = await resolveAccountNumber(
            formik.values.account_number,
            selectedBankCode
          );
          if (resolvedData && resolvedData.account_name) {
            formik.setFieldValue("account_name", resolvedData.account_name);
            toast.success("Account name resolved successfully!");
          } else {
            formik.setFieldValue("account_name", "");
            toast.error(
              "Could not resolve account name. Please check details."
            );
          }
        } catch (error) {
          toast.error("An error occurred while resolving the account.");
        } finally {
          setIsResolving(false);
        }
      }
    };

    const handler = setTimeout(() => {
      resolveAccount();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [formik.values.account_number, selectedBankCode]);

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = event.target.value;
    const selectedBank = banks.find((bank) => bank.name === selectedName);

    formik.setFieldValue("bank_name", selectedName);

    if (selectedBank) {
      setSelectedBankCode(selectedBank.code);
    } else {
      setSelectedBankCode("");
    }
  };

  return (
    <Modal onClose={onCancel}>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
        <div className="md:col-span-2">
          <h3 className="md:text-2xl text-lg font-bold">{title}</h3>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-5 h-[50vh] lg:h-[60vh] overflow-y-scroll styled-scrollbar pr-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="text-xs font-medium">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={formik.values.full_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
            />
            {formik.errors.full_name && formik.touched.full_name && (
              <p className="text-xs text-red-600">{formik.errors.full_name as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
            />
            {formik.errors.email && formik.touched.email && (
              <p className="text-xs text-red-600">{formik.errors.email as string}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-xs font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
            />
            {formik.errors.phone && formik.touched.phone && (
              <p className="text-xs text-red-600">{formik.errors.phone as string}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="department" className="text-xs font-medium">
              Department
            </label>
            <input
              type="text"
              name="department"
              id="department"
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
            />
            {formik.errors.department && formik.touched.department && (
              <p className="text-xs text-red-600">
                {formik.errors.department as string}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="bankName" className="text-xs font-medium">
              Bank Name
            </label>
            <select
              id="bank_name"
              name="bank_name"
              onChange={handleBankChange}
              onBlur={formik.handleBlur}
              // defaultValue={""}
              value={formik.values.bank_name}
              disabled={isLoadingBanks}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option disabled value="">
                {isLoadingBanks ? "Loading Banks..." : "Select Bank"}
              </option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
            {formik.errors.bank_name && formik.touched.bank_name && (
              <p className="text-xs text-red-600">{formik.errors.bank_name as string}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="account_number" className="text-xs font-medium">
              Account Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              name="account_number"
              id="account_number"
              value={formik.values.account_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
            />
            {formik.errors.account_number && formik.touched.account_number && (
              <p className="text-xs text-red-600">
                {formik.errors.account_number as string}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="account_name" className="text-xs font-medium">
              Account Name
            </label>
            <input
              type="text"
              id="account_name"
              name="account_name"
              value={isResolving ? "Resolving..." : formik.values.account_name}
              readOnly
              className={`md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr ${
                isResolving ? "opacity-50" : ""
              }`}
            />
            {formik.errors.account_name && formik.touched.account_name && (
              <p className="text-xs text-red-600">
                {formik.errors.account_name as string}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="salary_amount" className="text-xs font-medium">
              Estimate Pay
            </label>
            <input
              type="number"
              name="salary_amount"
              id="salary_amount"
              value={formik.values.salary_amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="md:text-sm text-xs py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
            />
            {formik.errors.salary_amount && formik.touched.salary_amount && (
              <p className="text-xs text-red-600">
                {formik.errors.salary_amount as string}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-5 text-base h-[50px] bg-pryClr px-4 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formik.isSubmitting ? "Updating Employee..." : confirmText}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditEmployee;
