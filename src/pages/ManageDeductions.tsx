import { useEffect, useState, useMemo } from "react";
import PaginationControls from "../utilities/PaginationControls";
import { MdRemoveRedEye, MdModeEditOutline, MdDelete } from "react-icons/md";
import { FiSearch, FiX } from "react-icons/fi";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../utilities/FormatterUtility";
import {
  useDeductionsQuery,
  useDeleteDeductionMutation,
} from "../hooks/useApiQueries";
import { getErrorMessage } from "../utilities/api";
import type { DeductionRecord } from "../store/sharedinterfaces";
import ViewDeductionModal from "../components/modal/ViewDeductionModal";
import EditDeductionModal from "../components/modal/EditDeductionModal";
import ConfirmDialog from "../components/modal/ConfirmDialog";

const ManageDeductions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const [currentPageFromApi, setCurrentPageFromApi] = useState(1);
  const apiItemsPerPage = 15;

  const [showEditModal, setShowEditModal] = useState(false);
  const [deductionToEdit, setDeductionToEdit] =
    useState<DeductionRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deductionToDelete, setDeductionToDelete] =
    useState<DeductionRecord | null>(null);
  const [selectedDeduction, setSelectedDeduction] =
    useState<DeductionRecord | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const deleteDeductionMutation = useDeleteDeductionMutation();

  const handleDeleteDeduction = () => {
    if (!deductionToDelete) return;
    const targetId = deductionToDelete.id || deductionToDelete?.id;
    if (!targetId) return;

    deleteDeductionMutation.mutate(targetId, {
      onSettled: () => {
        setShowDeleteConfirm(false);
        setDeductionToDelete(null);
      },
    });
  };

  const handleEditFromView = () => {
    setDeductionToEdit(selectedDeduction);
    setShowViewModal(false);
    setShowEditModal(true);
  };

  // Debounce search query
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPageFromApi(1);
  }, [debouncedSearch, selectedStatus, selectedMonth]);

  // Query deductions
  const {
    data: responseData,
    isLoading,
    error,
  } = useDeductionsQuery({
    search: debouncedSearch,
    status: selectedStatus,
    month: selectedMonth,
    page: currentPageFromApi,
    per_page: apiItemsPerPage,
  });

  const deductions: DeductionRecord[] = responseData?.data?.data || [];
  const totalApiPages: number = responseData?.data?.last_page || 1;
  const totalRecords: number = responseData?.data?.total || 0;

  // Month options generator: past 18 months to next 6 months
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();

    for (let i = -6; i <= 18; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const yearShort = String(d.getFullYear()).slice(-2);
      const value = `${month}-${yearShort}`;
      const label = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      options.push({ value, label: `${label} (${value})` });
    }
    return options;
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedStatus("all");
    setSelectedMonth("all");
    setCurrentPageFromApi(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) || selectedStatus !== "all" || selectedMonth !== "all";

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Completed
          </span>
        );
      case "stopped":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
            Stopped
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200 capitalize">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 md:px-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Total Deductions</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {totalRecords}
          </h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">
            Current Status Filter
          </p>
          <h3 className="text-lg font-bold text-pryClr mt-1 capitalize">
            {selectedStatus === "all" ? "All Statuses" : selectedStatus}
          </h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">
            Current Month Filter
          </p>
          <h3 className="text-lg font-bold text-gray-800 mt-1">
            {selectedMonth === "all" ? "All Months" : selectedMonth}
          </h3>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white p-3.5 rounded-xl border border-gray-200">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search employee, email, or reason..."
            className="w-full pl-9 pr-4 h-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-pryClr/50 placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-12 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-pryClr/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="stopped">Stopped</option>
          </select>

          {/* Month filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-12 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-pryClr/50 cursor-pointer"
          >
            <option value="all">All Months</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 h-12 px-3 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer font-medium"
              title="Clear all filters"
            >
              <FiX size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-white/61 h-[77px]">
              <th className="p-4 text-xs whitespace-nowrap">S/N</th>
              <th className="p-4 text-xs whitespace-nowrap text-left">
                Employee
              </th>
              <th className="p-4 text-xs whitespace-nowrap">Deduction (₦)</th>
              <th className="p-4 text-xs whitespace-nowrap">Period</th>
              <th className="p-4 text-xs whitespace-nowrap text-left">
                Reason
              </th>
              <th className="p-4 text-xs whitespace-nowrap">Status</th>
              <th className="p-4 text-xs whitespace-nowrap">Created Date</th>
              <th className="p-4 text-xs whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="bg-white/61">
                <td
                  colSpan={8}
                  className="p-8 text-center border-t border-black/10 text-gray-500 text-sm"
                >
                  Loading deductions...
                </td>
              </tr>
            ) : error ? (
              <tr className="bg-white/61">
                <td
                  colSpan={8}
                  className="p-8 text-center border-t border-black/10 text-red-500 text-sm"
                >
                  {getErrorMessage(error, "Failed to load deductions")}
                </td>
              </tr>
            ) : deductions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center bg-white/61 py-6 border-y border-black/10 text-gray-500 text-sm"
                >
                  {hasActiveFilters
                    ? "No deductions found matching your filter criteria."
                    : "No deductions found."}
                </td>
              </tr>
            ) : (
              deductions.map((deduction, index) => {
                const employer = deduction.employer;
                return (
                  <tr
                    key={deduction.id}
                    className={`${
                      index % 2 === 0 ? "bg-black/5" : "bg-[#F8F8F8]"
                    } h-[55px] border-y border-black/10`}
                  >
                    <td>
                      {(currentPageFromApi - 1) * apiItemsPerPage + (index + 1)}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap text-left font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {employer?.full_name || "Unknown"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap font-bold text-red-600">
                      ₦{formatterUtility(Number(deduction.amount || 0))}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      {deduction.no_of_month} month
                      {Number(deduction.no_of_month) > 1 ? "s" : ""}
                    </td>

                    <td
                      className="p-4 text-xs text-left max-w-[200px] truncate"
                      title={deduction.reason}
                    >
                      {deduction.reason || "-"}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      {getStatusBadge(deduction.status)}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap text-pryClr font-medium">
                      {formatISODateToCustom(deduction.created_at) || "-"}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-9 h-9 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                          title="View deduction details"
                          onClick={() => {
                            setSelectedDeduction(deduction);
                            setShowViewModal(true);
                          }}
                        >
                          <MdRemoveRedEye size={18} />
                        </button>
                        <button
                          className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-9 h-9 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                          type="button"
                          title="Edit deduction"
                          onClick={() => {
                            setDeductionToEdit(deduction);
                            setShowEditModal(true);
                          }}
                        >
                          <MdModeEditOutline size={18} />
                        </button>
                        <button
                          className="cursor-pointer text-red-500 disabled:cursor-not-allowed disabled:opacity-25 w-9 h-9 flex justify-center items-center hover:bg-red-50 rounded-md duration-200 transition-all"
                          type="button"
                          title="Delete deduction"
                          disabled={deleteDeductionMutation.isPending}
                          onClick={() => {
                            setDeductionToDelete(deduction);
                            setShowDeleteConfirm(true);
                          }}
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

          {!isLoading && totalApiPages > 1 && (
            <tfoot>
              <tr className="bg-white/61 h-[77px] border-t border-black/10">
                <td className="text-center p-4" colSpan={8}>
                  <PaginationControls
                    currentPage={currentPageFromApi}
                    totalPages={totalApiPages}
                    setCurrentPage={setCurrentPageFromApi}
                  />
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* View Deduction Modal */}
      <ViewDeductionModal
        isOpen={showViewModal}
        deduction={selectedDeduction}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDeduction(null);
        }}
        onEdit={handleEditFromView}
      />

      {/* Edit Deduction Modal */}
      <EditDeductionModal
        isOpen={showEditModal}
        deduction={deductionToEdit}
        onClose={() => {
          setShowEditModal(false);
          setDeductionToEdit(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Deduction?"
        message={`Are you sure you want to delete the deduction of ₦${formatterUtility(Number(deductionToDelete?.amount || 0))} for "${deductionToDelete?.employer?.full_name || "this employee"}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeductionToDelete(null);
        }}
        onConfirm={handleDeleteDeduction}
        isLoading={deleteDeductionMutation.isPending}
      />
    </div>
  );
};

export default ManageDeductions;
