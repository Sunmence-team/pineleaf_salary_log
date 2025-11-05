import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  fetchPaystackBanks,
  resolveAccountNumber,
} from "../utilities/paystackHelper";
import type { bankProps } from "../store/sharedinterfaces";
import axios from "axios";
import { SiTrueup } from "react-icons/si";
import api from "../utilities/api";

const API_URL = import.meta.env.VITE_API_BASE_URL;
interface CountryApiResponse {
  error: boolean;
  msg: string;
  data: {
    country: string;
    iso2: string;
  }[];
}

interface CountryItem {
  name: string;
  isoCode: string;
}

const AddEmployee = () => {
  const [banks, setBanks] = useState<bankProps[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [countries, setCountries] = useState<{}[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [states, setStates] = useState<{}[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  useEffect(() => {
    const fetchCountries = async (): Promise<void> => {
      setLoadingCountries(true);
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries"
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const resData: CountryApiResponse = await response.json();

        if (resData.error) {
          throw new Error(resData.msg || "Failed to fetch countries");
        }

        const countryList: CountryItem[] = resData.data
          .map((c) => ({ name: c.country, isoCode: c.iso2 }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const countryMap = new Map<string, string>();
        countryList.forEach((c) => countryMap.set(c.name, c.isoCode));

        setCountries(countryList.map((c) => c.name));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching countries:", message);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

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

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      dob: "",
      jobTitle: "",
      department: "",
      employmentType: "",
      employmentDate: "",
      bank_name: "",
      account_name: "",
      account_number: "",
      salary_amount: "",
      address: "",
      state: "",
      country: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      email: Yup.string()
        .email("Invalid Email address")
        .required("Email address is required"),
      phoneNumber: Yup.string().required("Phone Number is required"),
      gender: Yup.string().required("Gender is required"),
      dob: Yup.string().required("Date of Birth is required"),
      jobTitle: Yup.string().required("Job Title is required"),
      department: Yup.string().required("Department is required"),
      employmentType: Yup.string().required("Employment Type is required"),
      employmentDate: Yup.string().required("Employment Date is required"),
      bank_name: Yup.string().required("Bank Name is required"),
      account_number: Yup.string()
        .required("Account Number is required")
        .matches(/^\d{10}$/, "Account Number must be exactly 10 digits"),
      account_name: Yup.string().required("Account Name is required"),
      salary_amount: Yup.string().required("Employee estimate pay is required"),
      address: Yup.string().required("Adress is required"),
      country: Yup.string().required("Country is required"),
      state: Yup.string().required("State is required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          full_name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          phone: values.phoneNumber,
          gender: values.gender,
          dob: values.dob,
          job_title: values.jobTitle,
          employment_type: values.employmentType,
          employment_date: values.employmentDate,
          bank_name: values.bank_name,
          account_name: values.account_name,
          account_number: values.account_number,
          salary_amount: values.salary_amount,
          company_branch: values.department,
          address: values.address,
          state: values.state,
          country: values.country,
        };
        console.log("employee create values: ", payload);

        const response = await api.post(`${API_URL}/employers`, payload);

        if (response.status === 200 || response.status === 201) {
          toast.success(
            response.data.message || "Employee added successfully!"
          );
          resetForm();
          setSelectedBankCode(""); // Reset bank code too
        }
      } catch (error: any) {
        console.error("Creation failed!", error);
        toast.error(
          error?.response?.data?.message || "Error creating employee"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Extract setFieldValue to avoid dependency issues
  const { setFieldValue } = formik;

  // Clear account name when account number changes or is not 10 digits
  useEffect(() => {
    if (formik.values.account_number.length !== 10) {
      setFieldValue("account_name", "");
    }
  }, [formik.values.account_number, setFieldValue]);

  // Resolve account name when account number is exactly 10 digits and bank is selected
  useEffect(() => {
    const resolveAccount = async () => {
      const accountNumber = formik.values.account_number;

      if (accountNumber.length === 10 && selectedBankCode) {
        setIsResolving(true);
        try {
          const resolvedData = await resolveAccountNumber(
            accountNumber,
            selectedBankCode
          );

          if (resolvedData && resolvedData.account_name) {
            setFieldValue("account_name", resolvedData.account_name);
            toast.success("Account name resolved successfully!");
          } else {
            setFieldValue("account_name", "");
            toast.error(
              "Could not resolve account name. Please check details."
            );
          }
        } catch (error) {
          console.error("Resolution error:", error);
          setFieldValue("account_name", "");
          toast.error("An error occurred while resolving the account.");
        } finally {
          setIsResolving(false);
        }
      }
    };

    // Debounce the resolution call
    const handler = setTimeout(() => resolveAccount(), 800);
    return () => clearTimeout(handler);
  }, [formik.values.account_number, selectedBankCode, setFieldValue]);

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = event.target.value;
    const selectedBank = banks.find((bank) => bank.name === selectedName);

    setFieldValue("bank_name", selectedName);
    setFieldValue("account_name", ""); // Clear account name when bank changes
    setSelectedBankCode(selectedBank ? selectedBank.code : "");
  };

  useEffect(() => {
    if (formik.values.country) {
      const fetchStates = async () => {
        setLoadingStates(true);
        try {
          const response = await fetch(
            "https://countriesnow.space/api/v0.1/countries/states",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ country: formik.values.country }),
            }
          );
          const result = await response.json();
          if (result.error) throw new Error(result.msg);

          const stateList = result.data?.states?.map((s) => s.name) || [];
          setStates(stateList);
          formik.setFieldValue("state", "");
        } catch (err) {
          setStates([]);
          formik.setFieldValue("state", "");
        } finally {
          setLoadingStates(false);
        }
      };
      fetchStates();
    } else {
      setStates([]);
      formik.setFieldValue("state", "");
    }
  }, [formik.values.country]);

  return (
    <div className="px-4 md:px-6">
      <div className="w-full rounded-xl bg-white p-6 flex flex-col gap-8">
        <form
          onSubmit={formik.handleSubmit}
          className="grid md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-4"
        >
          {/* ================= PERSONAL INFO ================= */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold">Personal Information</h3>
          </div>

          {/* firstName */}
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-sm text-red-600">{formik.errors.firstName}</p>
            )}
          </div>

          {/* lastName */}
          <div className="flex flex-col gap-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-sm text-red-600">{formik.errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-600">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <p className="text-sm text-red-600">
                {formik.errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label htmlFor="gender" className="text-sm font-medium">
              Gender
            </label>
            <select
              name="gender"
              id="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {formik.touched.gender && formik.errors.gender && (
              <p className="text-sm text-red-600">{formik.errors.gender}</p>
            )}
          </div>

          {/* DOB */}
          <div className="flex flex-col gap-2">
            <label htmlFor="dob" className="text-sm font-medium">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              id="dob"
              value={formik.values.dob}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.dob && formik.errors.dob && (
              <p className="text-sm text-red-600">{formik.errors.dob}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="dob" className="text-sm font-medium">
              Country
            </label>
            <select
              name="country"
              id="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            >
              <option selected>
                {loadingCountries
                  ? "Fetching countries..."
                  : "Choose your country"}
              </option>
              {countries.map((c, idx) => (
                <option value={c} key={idx}>
                  {c}
                </option>
              ))}
            </select>
            {formik.touched.country && formik.errors.country && (
              <p className="text-sm text-red-600">{formik.errors.country}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="dob" className="text-sm font-medium">
              State
            </label>
            <select
              name="state"
              id="state"
              value={formik.values.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            >
              <option selected>
                {loadingStates
                  ? "Fetching country states..."
                  : "Select your state"}
              </option>
              {states.map((s, idx) => (
                <option value={s} key={idx}>
                  {s}
                </option>
              ))}
            </select>
            {formik.touched.state && formik.errors.state && (
              <p className="text-sm text-red-600">{formik.errors.state}</p>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <textarea
              name="address"
              id="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-4  indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            ></textarea>
            {formik.touched.address && formik.errors.address && (
              <p className="text-sm text-red-600">{formik.errors.address}</p>
            )}
          </div>
          {/* ================= JOB DETAILS ================= */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mt-8">Job Details</h3>
          </div>

          {/* Job Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="jobTitle" className="text-sm font-medium">
              Job Title
            </label>
            <input
              type="text"
              name="jobTitle"
              id="jobTitle"
              value={formik.values.jobTitle}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.jobTitle && formik.errors.jobTitle && (
              <p className="text-sm text-red-600">{formik.errors.jobTitle}</p>
            )}
          </div>

          {/* Department */}
          <div className="flex flex-col gap-2">
            <label htmlFor="department" className="text-sm font-medium">
              Department
            </label>
            <input
              type="text"
              name="department"
              id="department"
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.department && formik.errors.department && (
              <p className="text-sm text-red-600">{formik.errors.department}</p>
            )}
          </div>

          {/* Employment Type */}
          <div className="flex flex-col gap-2">
            <label htmlFor="employmentType" className="text-sm font-medium">
              Employment Type
            </label>
            <select
              name="employmentType"
              id="employmentType"
              value={formik.values.employmentType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            >
              <option value="">Select Employment Type</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {formik.touched.employmentType && formik.errors.employmentType && (
              <p className="text-sm text-red-600">
                {formik.errors.employmentType}
              </p>
            )}
          </div>

          {/* Employment Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="employmentDate" className="text-sm font-medium">
              Date Employed
            </label>
            <input
              type="date"
              name="employmentDate"
              id="employmentDate"
              value={formik.values.employmentDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.employmentDate && formik.errors.employmentDate && (
              <p className="text-sm text-red-600">
                {formik.errors.employmentDate}
              </p>
            )}
          </div>

          {/* ================= PAYMENT DETAILS ================= */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mt-8">Payment Details</h3>
          </div>

          {/* Bank Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="bank_name" className="text-sm font-medium">
              Bank Name
            </label>
            <select
              id="bank_name"
              name="bank_name"
              onChange={handleBankChange}
              onBlur={formik.handleBlur}
              value={formik.values.bank_name}
              disabled={isLoadingBanks}
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingBanks ? "Loading Banks..." : "Select Bank"}
              </option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
            {formik.touched.bank_name && formik.errors.bank_name && (
              <p className="text-sm text-red-600">{formik.errors.bank_name}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-2">
            <label htmlFor="account_number" className="text-sm font-medium">
              Account Number
            </label>
            <input
              type="text"
              name="account_number"
              id="account_number"
              value={formik.values.account_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              maxLength={10}
              placeholder="Enter 10-digit account number"
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.account_number && formik.errors.account_number && (
              <p className="text-sm text-red-600">
                {formik.errors.account_number}
              </p>
            )}
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="account_name" className="text-sm font-medium">
              Account Name{" "}
              {isResolving && (
                <span className="text-blue-600">(Resolving...)</span>
              )}
            </label>
            <input
              type="text"
              id="account_name"
              name="account_name"
              value={formik.values.account_name}
              readOnly
              placeholder={
                isResolving
                  ? "Resolving account name..."
                  : "Auto-filled after account number"
              }
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none bg-gray-50 cursor-not-allowed"
            />
            {formik.touched.account_name && formik.errors.account_name && (
              <p className="text-sm text-red-600">
                {formik.errors.account_name}
              </p>
            )}
          </div>

          {/* Salary */}
          <div className="flex flex-col gap-2">
            <label htmlFor="salary_amount" className="text-sm font-medium">
              Estimate Pay (₦)
            </label>
            <input
              type="number"
              name="salary_amount"
              id="salary_amount"
              value={formik.values.salary_amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter amount"
              className="py-2 indent-3 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr"
            />
            {formik.touched.salary_amount && formik.errors.salary_amount && (
              <p className="text-sm text-red-600">
                {formik.errors.salary_amount}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!formik.isValid || formik.isSubmitting}
              className="mt-5 h-[50px] w-full md:w-auto md:px-12 bg-pryClr text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {formik.isSubmitting ? "Adding Employee..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
