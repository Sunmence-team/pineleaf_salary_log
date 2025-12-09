import { useCallback, useEffect, useState } from "react";
import PaginationControls from "../utilities/PaginationControls";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import api from "../utilities/api";
import type { employeeProps } from "../store/sharedinterfaces";
import ConfirmDialog from "../components/modal/ConfirmDialog";
import {
  formatterUtility,
} from "../utilities/FormatterUtility";
import VerificationCodeDialog from "../components/modal/VerificationCodeDialog";
import { RiUserAddLine, RiUserMinusLine } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { MdOutlineFilterAlt } from "react-icons/md";
import { TbUsersPlus, TbUsersMinus } from "react-icons/tb";
import { generatePerPageOptions } from "../utilities/generatePerPageOptions";

const branches = [
  'HQ - Onitsha',
  'Mgbuka',
  'Awka',
  'Asaba',
  'Owerri',
  'Port Harcourt',
  'Lagos Ajah',
  'Lagos Apapa',
  'Enugwu-Ukwu',
  'Abuja',
  'Abia',
  'Nnewi',
  'Enugu',
  'Amuwo odofin Lagos',
]

const ManagePayments: React.FC = () => {
  const { token, logout } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>("");
  const [userIdsToBeActedOn, setuserIdsToBeActedOn] = useState<number[]>([]);
  
  const [employees, setEmployees] = useState<employeeProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const [currentPageFromApi, setCurrentPageFromApi] = useState<number>(1);
  const [totalApiPages, setTotalApiPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(1);
  const [apiItemsPerPage, setApiItemsPerPage] = useState<number>(10);
  const [options, setOptions] = useState<number[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] =
    useState<boolean>(false);
  const [showVerificationCodeDialog, setShowVerificationCodeDialog] =
    useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<employeeProps | null>(null);

  useEffect(() => {
    const newOptions: number[] = generatePerPageOptions(totalItems, 5);
    setOptions(newOptions);
    
    if (!newOptions.includes(apiItemsPerPage)) {
      setApiItemsPerPage(newOptions[0]); 
    }

  }, [totalItems]);

  const fetchEmployees = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/all_employers?search=${searchQuery}&page=${currentPageFromApi}&per_page=${apiItemsPerPage}&paying=${paymentStatus !== 0 && paymentStatus !== 1 ? '' : paymentStatus}&company_branch=${branchFilter}`,
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
        setTotalItems(response.data.data.total ?? 1);
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
  }, [token, searchQuery, currentPageFromApi, apiItemsPerPage, branchFilter, paymentStatus, logout]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openConfirm = () => setShowConfirmModal(true);

  const handleCanPay = async (id: number) => {
    setUpdatingStatus(true);
    try {
      const payload = {
        ids: [id],
        paying: selectedEmployee?.paying === 0 ? 1 : 0,
      };

      const response = await api.post("/employees/paying_all", payload);
      
      if (response && response.status === 200) {
        toast.success("Employee paying status updated successfully");
        fetchEmployees();
      }
    } catch (err: any) {
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

  const handleBulkUpdate = useCallback(
    async (paying: 0 | 1) => {
      if (!userIdsToBeActedOn || userIdsToBeActedOn.length === 0) {
        toast.info("No employees selected to update.");
        return;
      }

      setUpdatingStatus(true);
      const loadingId = toast.loading("Processing request...")
      try {
        const payload = {
          ids: userIdsToBeActedOn,
          paying,
        };

        const response = await api.post("/employees/paying_all", payload);

        if (response && response.status === 200) {
          toast.success(
            `Successfully updated ${userIdsToBeActedOn.length} employee(s).`,
          { id: loadingId });
          fetchEmployees();
          setuserIdsToBeActedOn([]);
        } else {
          toast.error(response.data?.message || "An error occurred.", { id: loadingId });
        }
      } catch (err: any) {
        console.error("Error during bulk update:", err);
        toast.error(
          err.response?.data?.message || "An unexpected error occurred.", { id: loadingId }
        );
      } finally {
        setUpdatingStatus(false);
      }
    },
    [userIdsToBeActedOn, fetchEmployees]
  );

  const handlePinDialog = () => {
    setShowConfirmModal(false);
    setShowVerificationCodeDialog(true);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setuserIdsToBeActedOn((prevSelectedIds) => {
        const currentEmployeeIds = employees.map((emp) => Number(emp.id));
        if (checked) {
            // Add all current page employee IDs that are not already selected
            const newSelectedIds = [
                ...new Set([...prevSelectedIds, ...currentEmployeeIds]),
            ];
            return newSelectedIds;
        } else {
            // Remove all current page employee IDs from selected
            const remainingSelectedIds = prevSelectedIds.filter(
                (id) => !currentEmployeeIds.includes(id)
            );
            return remainingSelectedIds;
        }
    });
  };

  const allEmployeeIdsOnPage = employees.map(emp => Number(emp.id));
  const allSelectedOnPage = allEmployeeIdsOnPage.length > 0 && allEmployeeIdsOnPage.every(id => userIdsToBeActedOn.includes(id));
  const someSelectedOnPage = allEmployeeIdsOnPage.some(id => userIdsToBeActedOn.includes(id)) && !allSelectedOnPage;

  return (
    <div className="flex flex-col gap-8 px-4 md:px-6 relative">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Process Staff Payment</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={openConfirm}
            disabled={
              isLoading ||
              employees.length === 0 ||
              isProcessingPayment
            }
            className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg bg-pryClr text-white hover:opacity-95 disabled:opacity-50 transition"
            title="Initialize payment for all employees"
          >
            <span>Pay Staff</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Search bar */}
          <div className="flex items-center gap-1 h-12 border border-gray-300 rounded-lg px-3 md:w-1/2 w-full">
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full h-full border-0 focus:outline-none placeholder:text-black/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch
              className="text-gray-400"
              size={18}
            />
          </div>
          {/* filters toggle button */}
          <button
            className="flex items-center gap-2 px-3 py-2 outline-0 border border-gray-300 text-pryClr rounded-lg bg-transparent"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <MdOutlineFilterAlt size={18} />
          </button>
        </div>
        {/* Expanded filters */}
        <div
          hidden={!showMobileFilters}
          className="relative w-full bg-white p-4 rounded-lg grid md:grid-cols-3 grid-cols-1 items-center gap-4"
        >
          <div className="flex flex-col text-xs gap-2">
            <label htmlFor="itemsPerPage">Items Per Page</label>
            <select 
              name="itemsPerPage" 
              id="itemsPerPage"
              className="border border-pryClr/10 h-10 rounded-md indent-2 outline-0 min-w-36"
              onChange={(e) => {
                if (currentPageFromApi !== 1) {
                  setCurrentPageFromApi(1)
                }
                setApiItemsPerPage(Number(e.target.value))
              }}
            >
              {
                options?.map((num, index) => (
                  <option key={index} value={num}>{num}</option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-col text-xs gap-2">
            <label htmlFor="branches">Branch</label>
            <select 
              name="branches" 
              id="branches"
              className="border border-pryClr/10 h-10 rounded-md indent-2 outline-0 min-w-36"
              onChange={(e) => {
                if (currentPageFromApi !== 1) {
                  setCurrentPageFromApi(1)
                }
                setBranchFilter(e.target.value)
              }}
            >
              {
                branches.map((branch, index) => (
                  <option key={index} value={branch}>{branch}</option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-col text-xs gap-2">
            <label htmlFor="itemsPerPage">Payment status</label>
            <select 
              name="itemsPerPage" 
              id="itemsPerPage"
              className="border border-pryClr/10 h-10 rounded-md indent-2 outline-0 min-w-36"
              onChange={(e) => {
                if (currentPageFromApi !== 1) {
                  setCurrentPageFromApi(1)
                }
                setPaymentStatus(Number(e.target.value))
              }}
              defaultValue={""}
            >
              <option value={""} disabled>Select Payment status</option>
              <option value={"all"}>All</option>
              {
                [
                  {
                    value: 0,
                    name: "Excluded"
                  },
                  {
                    value: 1,
                    name: "Included"
                  },
                ].map((option, index) => (
                  <option key={index} value={option.value}>{option.name}</option>
                ))
              }
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-white/61 h-[77px]">
              <th className="p-4 text-xs whitespace-nowrap">
                <input
                  type="checkbox"
                  className="accent-pryClr size-6"
                  checked={allSelectedOnPage}
                  onChange={handleSelectAll}
                  ref={el => {
                    if (el) {
                      el.indeterminate = someSelectedOnPage;
                    }
                  }}
                />
              </th>
              <th className="p-4 text-xs whitespace-nowrap">S/N</th>
              <th className="p-4 text-xs whitespace-nowrap">
                Full Name
              </th>
              <th className="p-4 text-xs whitespace-nowrap">
                Job Title
              </th>
              <th className="p-4 text-xs whitespace-nowrap">
                Department
              </th>
              <th className="p-4 text-xs whitespace-nowrap">Pay</th>
              <th className="p-4 text-xs whitespace-nowrap">Branch</th>
              <th className="p-4 text-xs whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr className="bg-white/61">
                <td
                  colSpan={8}
                  className="p-4 text-center border-t border-black/10 text-gray-500"
                >
                  Loading employees...
                </td>
              </tr>
            ) : error ? (
              <tr className="bg-white/61">
                <td
                  colSpan={8}
                  className="p-4 text-center border-t border-black/10 text-gray-500"
                >
                  {error?.message ?? "Error loading employees"}
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
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
                  <td className="p-2 text-xs whitespace-nowrap font-medium">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="accent-pryClr size-4"
                        checked={userIdsToBeActedOn.includes(Number(employee.id))}
                        onChange={(e) => {
                          const { checked } = e.target;
                          const employeeIdAsNumber = Number(employee.id);
                          setuserIdsToBeActedOn((prev) => {
                            if (checked) {
                              return [...prev, employeeIdAsNumber];
                            } else {
                              return prev.filter((id) => id !== employeeIdAsNumber);
                            }
                          });
                        }}
                      />
                    </div>
                  </td>

                  <td>
                    {(currentPageFromApi - 1) * apiItemsPerPage + (index + 1)}
                  </td>

                  <td className="p-2 text-xs whitespace-nowrap font-medium">
                    {employee.full_name}
                  </td>

                  <td className="p-2 text-xs whitespace-nowrap">
                    {employee.jobTitle ?? "-"}
                  </td>

                  <td className="p-2 text-xs whitespace-nowrap">
                    {employee.department ?? "-"}
                  </td>

                  <td className="p-2 text-xs whitespace-nowrap">
                    N
                    {employee.paying === 0
                      ? 0
                      : formatterUtility(Number(employee.salary_amount)) ?? "-"}
                  </td>

                  <td className="p-2 text-xs whitespace-nowrap">
                    {employee.company_branch ?? "-"}
                  </td>

                  <td className="p-4 text-xs whitespace-nowrap text-pryClr font-bold">
                    <button
                      className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 text- mx-auto w-10 h-10 flex justify-center items-center rounded-md duration-200 transition-all ${
                        employee.paying === 0 ? "text-pryClr hover:bg-pryClr/10" : "text-red-700 hover:bg-red-700/10"
                      }`}
                      title={
                        employee.paying === 0
                          ? "Include employee from paying list"
                          : "Exclude employee from paying list"
                      }
                      onClick={() => setShowUpdateConfirmModal(true)}
                    >
                      {employee.paying === 0
                        ? 
                        // "Include Employee"
                        <RiUserAddLine size={18} />
                        : 
                        // "Exclude Employee"
                        <RiUserMinusLine size={18} />
                      }
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot>
            <tr className={"bg-white/61 h-[77px] border-t border-black/10"}>
              <td className="text-center p-4" colSpan={8}>
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

      {
        userIdsToBeActedOn.length > 0 && (
          <div className="fixed z-999 right-6 bottom-8 bg-white max-w-[320px] rounded-lg shadow-2xl border border-pryClr/10 p-4 flex gap-2 items-center justify-center">
            <p className="font-medium">
              {userIdsToBeActedOn.length} employee(s) selected.
            </p>
            <div className="flex gap-2">
              <button
                className="w-full px-3 h-10 rounded-md cursor-pointer text-sm text-pryClr hover:bg-pryClr/10 hover:opacity-90"
                title="Include Selected"
                disabled={updatingStatus}
                onClick={() => {
                  handleBulkUpdate(1);
                }}
              >
                <TbUsersPlus size={18} />
              </button>
              <button
                className="w-full px-3 h-10 rounded-md cursor-pointer text-sm text-red-600 hover:bg-red-600/10 hover:opacity-90"
                title="Exclude Selected"
                disabled={updatingStatus}
                onClick={() => {
                  handleBulkUpdate(0);
                }}
              >
                <TbUsersMinus size={18} />
              </button>
            </div>
          </div>
        )
      }

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
        } ${selectedEmployee?.paying === 0 ? "to" : "from"} payment list?`}
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
