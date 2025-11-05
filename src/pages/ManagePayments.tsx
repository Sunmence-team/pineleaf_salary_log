import { useCallback, useEffect, useState } from "react";
import PaginationControls from "../utilities/PaginationControls";
import { FiCreditCard } from "react-icons/fi";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import api from "../utilities/api";
import type { employeeProps } from "../store/sharedinterfaces";
import ConfirmDialog from "../components/modal/ConfirmDialog";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../utilities/FormatterUtility";
import { CgSpinner } from "react-icons/cg";
import type { AxiosResponse } from "axios";
import VerificationCodeDialog from "../components/modal/VerificationCodeDialog";

const ManagePayments: React.FC = () => {
  const { token, logout } = useUser();

  const [employees, setEmployees] = useState<employeeProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const [currentPageFromApi, setCurrentPageFromApi] = useState<number>(1);
  const [totalApiPages, setTotalApiPages] = useState<number>(1);
  const apiItemsPerPage = 10;
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] =
    useState<boolean>(false);
  const [showVerificationCodeDialog, setShowVerificationCodeDialog] =
    useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<employeeProps | null>(null);

  const fetchEmployees = useCallback(async () => {
    // if (!token) {
    //   const load = toast.loading("Session timed out. Logging out...");
    //   setIsLoading(false);
    //   setTimeout(() => {
    //     logout();
    //     toast.dismiss(load);
    //   }, 500);
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/all_employers?page=${currentPageFromApi}&per_page=${apiItemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data?.status === "success") {
        setEmployees(response.data.data.data ?? []);
        setCurrentPageFromApi(response.data.data.current_page ?? 1);
        setTotalApiPages(response.data.data.last_page ?? 1);
      } else {
        toast.error(response.data?.message ?? "Failed to fetch employees");
        setEmployees([]);
      }
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      if (err.code === "ECONNABORTED") {
        toast.error("Request timed out. Please try again.");
      } else if (err.response?.data?.message === "Unauthenticated.") {
        const load = toast.loading("Session timed out. Logging out...");
        setTimeout(() => {
          logout();
          toast.dismiss(load);
        }, 500);
      } else if (err.response) {
        toast.error(
          err.response.data?.message || "Server error while fetching employees."
        );
      } else {
        toast.error("Unexpected error occurred. Please try again.");
      }
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPageFromApi, apiItemsPerPage, logout]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openConfirm = () => setShowConfirmModal(true);
  const closeConfirm = () => setShowConfirmModal(false);

  const handleCanPay = async (id: number) => {
    setUpdatingStatus(true);
    try {
      let response: AxiosResponse;
      if (selectedEmployee?.paying === 0) {
        response = await api.put(`/employees/${id}/paying`);
      } else if (selectedEmployee?.paying === 1) {
        response = await api.put(`/employers/${id}/paying`);
      }
      const resData = await response.data;
      if (response.status === 200) {
        toast.success("Employee paying status updated successfully");
        fetchEmployees();
      }
    } catch (err: unknown) {
      console.log(err);
      if (err.response) {
        toast.error(
          err.response.data?.message ||
            "Server error during employee updating payment status."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setUpdatingStatus(false);
      setShowUpdateConfirmModal(false);
    }
  };

  const handleInitializeBulkPayment = async (code: string) => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    if (!employees || employees.length === 0) {
      toast.error("No employees to process payment for.");
      setShowConfirmModal(false);
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await api.post("/trigger-payroll", { code });

      if (response.status === 200 || response.status === 201) {
        toast.success("Payment initialized successfully.");
        fetchEmployees();
      } else {
        toast.error(response.data?.message ?? "Failed to initialize payment.");
      }
    } catch (err: any) {
      console.error("Error initializing  payment:", err);
      if (err.response) {
        toast.error(
          err.response.data?.message || "Server error during payment."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessingPayment(false);
      setShowVerificationCodeDialog(false);
    }
  };

  const employeeToPay = employees.find((e) => {
    return e.paying === 1;
  });

  const handlePinDialog = () => {
    setShowConfirmModal(false);
    setShowVerificationCodeDialog(true);
  };

  return (
    <div className="flex flex-col gap-8 px-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Process Staff Payment</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={openConfirm}
            disabled={
              isLoading ||
              employees.length === 0 ||
              isProcessingPayment ||
              !employeeToPay
            }
            className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg bg-pryClr text-white hover:opacity-95 disabled:opacity-50 transition"
            title="Initialize payment for all employees"
          >
            <span>Pay Staffs</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-white/61 h-[77px]">
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">S/N</th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">
                Full Name
              </th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">
                Job Title
              </th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">
                Department
              </th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">Pay</th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">Date</th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr className="bg-white/61">
                <td
                  colSpan={6}
                  className="p-4 text-center border-t border-black/10 text-gray-500"
                >
                  Loading employees...
                </td>
              </tr>
            ) : error ? (
              <tr className="bg-white/61">
                <td
                  colSpan={6}
                  className="p-4 text-center border-t border-black/10 text-gray-500"
                >
                  {error?.message ?? "Error loading employees"}
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center bg-white/61 py-4 border-y border-black/10"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <tr
                  key={employee.id}
                  className={`${
                    index % 2 === 0 ? "bg-black/5" : "bg-[#F8F8F8]"
                  } h-[50px] border-y border-black/10`}
                  onMouseOver={() => setSelectedEmployee(employee)}
                >
                  <td>
                    {(currentPageFromApi - 1) * apiItemsPerPage + (index + 1)}
                  </td>

                  <td className="p-4 md:text-sm text-xs whitespace-nowrap font-medium">
                    {employee.full_name}
                  </td>

                  <td className="p-4 md:text-sm text-xs whitespace-nowrap">
                    {employee.jobTitle ?? "-"}
                  </td>

                  <td className="p-4 md:text-sm text-xs whitespace-nowrap">
                    {employee.company_branch ?? "-"}
                  </td>

                  <td className="p-4 md:text-sm text-xs whitespace-nowrap">
                    N
                    {employee.paying === 0
                      ? 0
                      : formatterUtility(Number(employee.salary_amount)) ?? "-"}
                  </td>

                  <td className="p-4 md:text-sm text-xs whitespace-nowrap text-pryClr font-bold">
                    {formatISODateToCustom(employee.created_at) ?? "-"}
                  </td>

                  <td className="p-4 md:text-sm text-xs whitespace-nowrap text-pryClr font-bold">
                    <button
                      className={`cursor-pointer w-full disabled:cursor-not-allowed disabled:opacity-25 text-sm py-3 px-2 flex justify-center items-center rounded-md duration-200 transition-all text-white ${
                        employee.paying === 0 ? "bg-pryClr" : "bg-red-700"
                      }`}
                      title={
                        employee.paying === 0
                          ? "Include employee from paying list"
                          : "Exclude employee from paying list"
                      }
                      onClick={() => setShowUpdateConfirmModal(true)}
                    >
                      {employee.paying === 0
                        ? "Include Employee"
                        : "Exclude Employee"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot>
            <tr className={"bg-white/61 h-[77px] border-t border-black/10"}>
              <td className="text-center p-4" colSpan={6}>
                <PaginationControls
                  currentPage={currentPageFromApi}
                  totalPages={totalApiPages}
                  setCurrentPage={setCurrentPageFromApi}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ConfirmDialog
        isOpen={showConfirmModal}
        title="Initialize Payment for All Employees?"
        message="You are about to initialize payments for all included employees on this list. This action cannot be undone. Do you want to continue?"
        confirmText="Yes, Initialize"
        cancelText="Cancel"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handlePinDialog}
        isLoading={false}
      />
      <ConfirmDialog
        isOpen={showUpdateConfirmModal}
        title={`${selectedEmployee?.paying === 0 ? "Include" : "Exclude"} ${
          selectedEmployee?.full_name || "this employee"
        } from payment list`}
        message={`You are about to ${
          selectedEmployee?.paying === 0 ? "include" : "exclude"
        } ${selectedEmployee?.full_name || "this employee"} ${
          selectedEmployee?.paying === 0 ? "to" : "from"
        } the payment list. Once ${
          selectedEmployee?.paying === 0 ? "added" : "removed"
        }, he/she will be ${
          selectedEmployee?.paying === 0 ? "included among" : "excluded from"
        } the employees set to receive the next salary payment. Do you want to continue?`}
        confirmText="Yes, Continue"
        cancelText="Cancel"
        onCancel={() => setShowUpdateConfirmModal(false)}
        onConfirm={() =>
          handleCanPay(selectedEmployee !== null ? +selectedEmployee.id : NaN)
        }
        isLoading={updatingStatus}
      />
      <VerificationCodeDialog
        isOpen={showVerificationCodeDialog}
        onCancel={() => setShowVerificationCodeDialog(false)}
        onConfirm={handleInitializeBulkPayment}
        isLoading={isProcessingPayment}
      />
    </div>
  );
};

export default ManagePayments;
