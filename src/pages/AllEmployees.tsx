import { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "../components/modal/ConfirmDialog";
import PaginationControls from "../utilities/PaginationControls";
import {
  MdDelete,
  MdModeEditOutline,
  MdOutlineFilterAlt,
  MdRemoveRedEye,
} from "react-icons/md";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../utilities/FormatterUtility";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import api from "../utilities/api";
import type { employeeProps } from "../store/sharedinterfaces";
import EditEmployee from "../components/modal/EditEmployee";
import ViewEmployee from "../components/modal/ViewEmployee";

const AllEmployees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { token, logout } = useUser();
  const [employees, setEmployees] = useState<employeeProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<any>(null);

  const [currentPageFromApi, setCurrentPageFromApi] = useState(1);
  const [totalApiPages, setTotalApiPages] = useState(1);

  const apiItemsPerPage = 5;

  const statusOptions = ["Remote", "On-site", "Hybrid", "all"];

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedemployee, setSelectedEmployee] =
    useState<employeeProps | null>(null);
  const [employeeToDelete, setEmployeeToDelete] =
    useState<employeeProps | null>(null);

  // const toggleDropdown = (dropdownName: boolean) => {
  //   setOpenDropdown(openDropdown === dropdownName ? false : dropdownName);
  // };

  const editAction = () => {
    setShowEditModal(false);
    fetchEmployees();
  };

  const fetchEmployees = useCallback(async () => {
    // if (!token) {
    //   const load = toast.loading("Session timed out. logging out");
    //   console.error("Token not available, skipping employees fetch.");
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
        `/all_employers?search=${searchQuery}&page=${currentPageFromApi}&per_page=${apiItemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("employees response", response);

      if (response.status === 200 && response.data.status === "success") {
        setEmployees(response.data.data.data);
        setCurrentPageFromApi(response.data.data.current_page);
        setTotalApiPages(response.data.data.last_page);
      } else {
        toast.error(
          `Failed to fetch employees: ${
            response.data.message || "Unknown error"
          }`
        );
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
        toast.error("Unexpected error occurred. Please try again.");
      }
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, searchQuery, currentPageFromApi, apiItemsPerPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [fetchEmployees]);

  useEffect(() => {
    setCurrentPageFromApi(1);
  }, [searchQuery, selectedStatus]);

  const filteredList = employees.filter((data) => {
    const statusMatches =
      selectedStatus === "all" ||
      data.employmentType?.toLowerCase() === selectedStatus.toLowerCase();

    return statusMatches;
  });

  // Function to show the confirmation modal
  const confirmDeletion = (employee: employeeProps) => {
    setEmployeeToDelete(employee);
    setShowConfirmModal(true);
  };

  // Function to handle the actual deletion API call
  const handleDeleteemployee = async () => {
    setIsDeleting(true); // Start deleting process, disable button
    try {
      const response = await api.delete(
        `/delete_employers/${employeeToDelete?.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // // console.log("employees delete response", response);

      if (response.status === 200) {
        toast.success(response.data.message);
        // Remove the deleted employee from the state
        setEmployees((prevemployees) =>
          prevemployees.filter((p) => p.id !== employeeToDelete?.id)
        );
      }
    } catch (error) {
      toast.error("Error deleting employee");
      console.error("Error deleting employee", error);
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
      setEmployeeToDelete(null);
    }
  };

  const handleModalCancel = () => {
    setShowConfirmModal(false);
    setEmployeeToDelete(null);
  };

  const closeAndEdit = () => {
    setShowViewModal(false);
    setShowEditModal(true);
  };

  return (
    <div className="flex flex-col gap-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex md:flex-row flex-col gap-4 md:items-center md:w-1/2">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="relative grow">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none placeholder:text-black/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch
                className="absolute right-3 top-3 text-gray-400"
                size={18}
              />
            </div>

            <button
              className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 text-pryClr rounded-lg bg-transparent"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <MdOutlineFilterAlt size={18} />
            </button>
          </div>
          <div
            hidden={!showMobileFilters}
            className="relative w-full md:w-auto"
          >
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => !prev)}
              className="flex items-center justify-between w-full gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <span className="capitalize">{selectedStatus}</span>
              <FiChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  openDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown && (
              <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(option);
                      setOpenDropdown(false);
                    }}
                    className={`w-full text-sm text-left px-4 py-2 capitalize hover:bg-gray-100 transition ${
                      selectedStatus === option
                        ? "bg-blue-50 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* employees Table */}
      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-white/61 h-[77px]">
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
              <th className="p-4 text-xs whitespace-nowrap">Date</th>
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
                  {typeof error === "string" ? error : (error?.message ?? String(error))}
                </td>
              </tr>
            ) : filteredList.length === 0 && !isLoading && !error ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center bg-white/61 py-4 border-y border-black/10"
                >
                  {employees.length > 0
                    ? "No employee found matching your search or filters."
                    : "No employee found."}
                </td>
              </tr>
            ) : (
              filteredList.map((employee, index) => {
                return (
                  <tr
                    key={employee.id}
                    className={`${index % 2 === 0 ? "bg-black/5" : "bg-[#F8F8F8]"} h-[50px] border-y border-black/10`}
                    onMouseOver={() => setSelectedEmployee(employee)}
                  >
                    <td>
                      {(currentPageFromApi - 1) * apiItemsPerPage + (index + 1)}
                    </td>
                    <td className="p-4 text-xs whitespace-nowrap font-medium">
                      {employee.full_name}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      {employee.jobTitle || "-"}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      {employee.department || "-"}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      N{formatterUtility(Number(employee.salary_amount)) || "-"}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap text-pryClr font-bold">
                      {formatISODateToCustom(employee.created_at) || "-"}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-10 h-10 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                          title="View employee details"
                          onClick={() => setShowViewModal(true)}
                        >
                          <MdRemoveRedEye size={18} />
                        </button>
                        <button
                          className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-10 h-10 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                          type="button"
                          title="Edit employee"
                          onClick={() => setShowEditModal(true)}
                        >
                          <MdModeEditOutline size={18} />
                        </button>
                        <button
                          className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-10 h-10 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                          type="button"
                          title="Delete employee"
                          disabled={isLoading || isDeleting}
                          onClick={() => confirmDeletion(employee)}
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {
            !isLoading && totalApiPages > 1 && (
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
            )
          }
        </table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        title={`Delete ${employeeToDelete?.full_name}?`}
        message={`Are you sure you want to delete "${employeeToDelete?.full_name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onCancel={handleModalCancel}
        onConfirm={handleDeleteemployee}
        isLoading={isDeleting}
      />
      <EditEmployee
        isOpen={showEditModal}
        title={`Edit ${selectedemployee?.full_name} Details`}
        employee={selectedemployee}
        confirmText="Update Details"
        onCancel={() => setShowEditModal(false)}
        onConfirm={() => editAction()}
      />
      <ViewEmployee
        isOpen={showViewModal}
        title={`${selectedemployee?.full_name} Details`}
        employee={selectedemployee}
        onClose={() => setShowViewModal(false)}
        onUpdate={() => closeAndEdit()}
      />
    </div>
  );
};

export default AllEmployees;
