import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../utilities/api";
import { toast } from "sonner";
import { fetchPaystackBanks, resolveAccountNumber } from "../utilities/paystackHelper";
import type { bankProps } from "../store/sharedinterfaces";

const AddEmployee = () => {
    const [banks, setBanks] = useState<bankProps[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(true);
    const [isResolving, setIsResolving] = useState(false);
    const [selectedBankCode, setSelectedBankCode] = useState('');

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
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            email: Yup.string().email("Invalid Email address").required('Email address is required'),
            phoneNumber: Yup.string().required('Phone Number is required'),
            gender: Yup.string().required('Gender is required'),
            dob: Yup.string().required('Date of Birth is required'),
            jobTitle: Yup.string().required('Job Title is required'),
            department: Yup.string().required('Department is required'),
            employmentType: Yup.string().required('Employment Type is required'),
            employmentDate: Yup.string().required('employment Date is required'),
            bank_name: Yup.string().required('Bank Name is required'),
            account_number: Yup.string()
            .required('Account Number is required')
            .matches(/^\d{8,20}$/, "Account Number must be 8-20 digits"),
            account_name: Yup.string().required('Account Name is required'),
            salary_amount: Yup.string().required('Employee estimate pay is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            console.log("employee create values: ", values);

            try {
                const response = await api.post(`/api/route`, values, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                console.log("Employee creation successful!", response);
                
                if ((response.status === 200 || response.status === 201) && response.data.success) {
                    toast.success(response.data.message);
                    resetForm();
                }
            } catch (error: any) {
                toast.error(error.response.data.message);
                console.error("Creation failed!", error);
            }
        },
    });

    useEffect(() => {
        const resolveAccount = async () => {
        if (formik.values.account_number.length === 10 && selectedBankCode) {
            setIsResolving(true);
            try {
                const resolvedData = await resolveAccountNumber(formik.values.account_number, selectedBankCode);
                if (resolvedData && resolvedData.account_name) {
                    formik.setFieldValue('account_name', resolvedData.account_name);
                    toast.success("Account name resolved successfully!");
                } else {
                    formik.setFieldValue('account_name', '');
                    toast.error("Could not resolve account name. Please check details.");
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

    const handleBankChange = (event:React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = event.target.value;
        const selectedBank = banks.find(bank => bank.name === selectedName);
        
        formik.setFieldValue('bank_name', selectedName);
        
        if (selectedBank) {
        setSelectedBankCode(selectedBank.code);
        } else {
        setSelectedBankCode('');
        }
    };

    return (
        <div className="px-4 md:px-6">
            <div className="w-full rounded-xl bg-white p-6 flex gap-8 flex-col">
                <form
                    onSubmit={formik.handleSubmit}
                    className="grid md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-4"
                >
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold">Personal Information</h3>
                    </div>
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
                            className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.firstName && formik.touched.firstName && (
                            <p className="text-sm text-red-600">{formik.errors.firstName}</p>
                        )}
                    </div>
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
                            className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.lastName && formik.touched.lastName && (
                        <p className="text-sm text-red-600">{formik.errors.lastName}</p>
                        )}
                    </div>
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
                        className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.email && formik.touched.email && (
                        <p className="text-sm text-red-600">{formik.errors.email}</p>
                        )}
                    </div>
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
                        className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.phoneNumber && formik.touched.phoneNumber && (
                        <p className="text-sm text-red-600">
                            {formik.errors.phoneNumber}
                        </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="gender" className="text-sm font-medium">
                            Gender
                        </label>
                        <select
                            name="gender"
                            id="gender"
                            defaultValue={""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="py-2.5 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        >
                            <option value="" disabled>
                                Select a gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {formik.errors.gender && formik.touched.gender && (
                            <p className="text-sm text-red-600">{formik.errors.gender}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="dob" className="text-sm font-medium">
                        Date Of Birth
                        </label>
                        <input
                        type="date"
                        name="dob"
                        id="dob"
                        value={formik.values.dob}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.dob && formik.touched.dob && (
                        <p className="text-sm text-red-600">{formik.errors.dob}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold mt-8">Job Details</h3>
                    </div>
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
                        className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.jobTitle && formik.touched.jobTitle && (
                        <p className="text-sm text-red-600">{formik.errors.jobTitle}</p>
                        )}
                    </div>
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
                        className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.department && formik.touched.department && (
                        <p className="text-sm text-red-600">{formik.errors.department}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="employmentType" className="text-sm font-medium">
                        Employment Type
                        </label>
                        <select
                        name="employmentType"
                        id="employmentType"
                        defaultValue={""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        >
                        <option value="" disabled>
                            Select employment type
                        </option>
                        <option value="remote">Remote</option>
                        <option value="onsite">On-site</option>
                        <option value="hybrid">Hybrid</option>
                        </select>
                        {formik.errors.employmentType && formik.touched.employmentType && (
                        <p className="text-sm text-red-600">
                            {formik.errors.employmentType}
                        </p>
                        )}
                    </div>
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
                        className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.employmentDate && formik.touched.employmentDate && (
                        <p className="text-sm text-red-600">
                            {formik.errors.employmentDate}
                        </p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold mt-8">Payment Details</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="bankName" className="text-sm font-medium">
                            Bank Name
                        </label>
                        <select
                            id="bank_name"
                            name="bank_name"
                            onChange={handleBankChange}
                            onBlur={formik.handleBlur}
                            defaultValue={""}
                            value={formik.values.bank_name}
                            disabled={isLoadingBanks}
                            className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option disabled value="">{isLoadingBanks ? "Loading Banks..." : "Select Bank"}</option>
                            {banks.map((bank) => (
                                <option key={bank.id} value={bank.name}>
                                {bank.name}
                                </option>
                            ))}
                        </select>
                        {formik.errors.bank_name && formik.touched.bank_name && (
                            <p className="text-sm text-red-600">{formik.errors.bank_name}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="account_number" className="text-sm font-medium">
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
                            className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.account_number && formik.touched.account_number && (
                            <p className="text-sm text-red-600">
                                {formik.errors.account_number}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="account_name" className="text-sm font-medium">
                            Account Name
                        </label>
                        <input
                            type='text'
                            id='account_name'
                            name='account_name'
                            value={isResolving ? 'Resolving...' : formik.values.account_name}
                            readOnly
                            className={`py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr ${isResolving ? 'opacity-50' : ''}`}
                        />
                        {formik.errors.account_name && formik.touched.account_name && (
                        <p className="text-sm text-red-600">
                            {formik.errors.account_name}
                        </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="salary_amount" className="text-sm font-medium">
                            Estimate Pay
                        </label>
                        <input
                            type="number"
                            name="salary_amount"
                            id="salary_amount"
                            value={formik.values.salary_amount}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="py-2 indent-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:border-pryClr"
                        />
                        {formik.errors.salary_amount && formik.touched.salary_amount && (
                            <p className="text-sm text-red-600">
                                {formik.errors.salary_amount}
                            </p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={!formik.isValid || formik.isSubmitting}
                            className="mt-5 text-base h-[50px] bg-pryClr py-2 px-4 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
