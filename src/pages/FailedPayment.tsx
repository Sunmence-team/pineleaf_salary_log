import React, { useState, useMemo, useEffect } from "react";
import type {
  employeeProps,
  transactionsProps,
} from "../store/sharedinterfaces";
import { toast } from "sonner";
import PaginationControls from "../utilities/PaginationControls";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../utilities/FormatterUtility";
import { CgSpinner } from "react-icons/cg";
import { TbUsersMinus, TbUsersPlus } from "react-icons/tb";
import ConfirmDialog from "../components/modal/ConfirmDialog";
import VerificationCodeDialog from "../components/modal/VerificationCodeDialog";
import { RiUserAddLine, RiUserMinusLine } from "react-icons/ri";
import {
  useFailedPaymentsQuery,
  useUpdatePayingStatusMutation,
  useTriggerPayrollMutation,
} from "../hooks/useApiQueries";
import { getErrorMessage } from "../utilities/api";

const FailedPayment: React.FC = () => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const month = params.get("month") || "";
  console.log("month param:", month);

  const [currentPageFromApi, setCurrentPageFromApi] = useState(1);
  const [userIdsToBeActedOn, setuserIdsToBeActedOn] = useState<number[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] =
    useState<boolean>(false);
  const [showVerificationCodeDialog, setShowVerificationCodeDialog] =
    useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<employeeProps | null>(null);

  const apiItemsPerPage = 10;

  // React Query hooks
  const { data, isLoading, error } = useFailedPaymentsQuery({
    page: currentPageFromApi,
    per_page: apiItemsPerPage,
    month: month,
  });

  const updatePayingStatusMutation = useUpdatePayingStatusMutation();
  const triggerPayrollMutation = useTriggerPayrollMutation();

  const transaction = useMemo(() => data?.[0] || null, [data]);
  const totalApiPages = useMemo(() => data?.pagination?.last_page ?? 1, [data]);

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to load transaction data."));
    }
  }, [error]);

  const convertToCSV = (data: Record<string, unknown>[]) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((value) => `"${value}"`)
        .join(","),
    );
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (data: Record<string, unknown>[], fileName = "transaction.csv") => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCanPay = (id: number) => {
    const payload = {
      ids: [id],
      paying: (selectedEmployee?.paying === 0 ? 1 : 0) as 0 | 1,
    };
    updatePayingStatusMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Employee paying status updated successfully");
      },
      onSettled: () => {
        setShowUpdateConfirmModal(false);
      },
    });
  };

  const handleInitializeBulkPayment = (code: string) => {
    if (!transaction?.payments || transaction?.payments.length === 0) {
      toast.error("No employees to process payment for.");
      setShowConfirmModal(false);
      return;
    }

    triggerPayrollMutation.mutate(code, {
      onSuccess: () => {
        toast.success("Payment initialized successfully.");
      },
      onSettled: () => {
        setShowVerificationCodeDialog(false);
      },
    });
  };

  const openConfirm = () => setShowConfirmModal(true);

  const handleBulkUpdate = (paying: 0 | 1) => {
    if (!userIdsToBeActedOn || userIdsToBeActedOn.length === 0) {
      toast.info("No employees selected to update.");
      return;
    }

    const loadingId = toast.loading("Processing request...");
    updatePayingStatusMutation.mutate(
      { ids: userIdsToBeActedOn, paying },
      {
        onSuccess: () => {
          toast.success(
            `Successfully updated ${userIdsToBeActedOn.length} employee(s).`,
            { id: loadingId },
          );
          setuserIdsToBeActedOn([]);
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "An unexpected error occurred."), { id: loadingId });
        },
      },
    );
  };

  const handlePinDialog = () => {
    setShowConfirmModal(false);
    setShowVerificationCodeDialog(true);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setuserIdsToBeActedOn((prevSelectedIds) => {
      const currentEmployeeIds = transaction?.payments.map((emp) =>
        Number(emp.employer_details.id),
      );
      if (checked) {
        // Add all current page employee IDs that are not already selected
        const newSelectedIds = [
          ...new Set([...prevSelectedIds, ...(currentEmployeeIds || [])]),
        ];
        return newSelectedIds;
      } else {
        // Remove all current page employee IDs from selected
        const remainingSelectedIds = prevSelectedIds.filter(
          (id) => !currentEmployeeIds?.includes(id),
        );
        return remainingSelectedIds;
      }
    });
  };

  const employeeIdsOnCurrentPage =
    transaction?.payments?.map((emp) => Number(emp.employer_details.id)) || [];
  const allSelectedOnPage =
    employeeIdsOnCurrentPage.length > 0 &&
    employeeIdsOnCurrentPage.every((id) => userIdsToBeActedOn.includes(id));
  const someSelectedOnPage =
    employeeIdsOnCurrentPage.some((id) => userIdsToBeActedOn.includes(id)) &&

    !allSelectedOnPage;

  return (
    <div className={`flex flex-col gap-8 px-4 lg:px-6`}>
      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center flex-col justify-center h-[40vh]">
              <CgSpinner className="text-4xl sm:text-5xl lg:text-6xl animate-spin" />
              <h2 className="text-base sm:text-xl lg:text-2xl font-medium">
                Loading transaction...
              </h2>
            </div>
          ) : !transaction ? (
            <div className="flex items-center flex-col justify-center h-[40vh]">
              <h2 className="text-base sm:text-xl lg:text-2xl font-medium">
                No failed transaction for {month}.
              </h2>
            </div>
          ) : (
            <div
              className="flex flex-col gap-3 bg-white border border-black/10 rounded-lg p-4"
              key={transaction.month}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">{transaction.month}</h2>
                  <h4 className="font-medium text-sm text-gray-600">
                    Total amount paid: N
                    {formatterUtility(+transaction.total_amount)}
                  </h4>
                </div>
                <div className="flex items-stretch flex-col lg:flex-row gap-4">
                  <button className="bg-pryClr text-white rounded-lg h-[45px] px-4 text-sm cursor-pointer font-semibold">
                    View transaction
                  </button>
                  <button
                    className="bg-tetClr text-white rounded-lg h-[45px] px-4 text-sm cursor-pointer font-semibold"
                    onClick={() => {
                      if (!transaction.payments?.length) {
                        toast.error("No transaction available for this month");
                        return;
                      }
                      const loading = toast.loading("Exporting as CSV");

                      const formatted = transaction.payments.map(
                        (item: transactionsProps) => ({
                          EmployeeName: item.employer_details?.full_name || "-",
                          Amount: item.amount,
                          Reference:
                            item.employer_details?.recipient_code || "-",
                          Status: item.status,
                          PaymentDate:
                            formatISODateToCustom(item.created_at) || "-",
                        }),
                      );

                      downloadCSV(
                        formatted,
                        `${transaction.month}-transaction.csv`,
                      );
                      toast.dismiss(loading);
                    }}
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={openConfirm}
                    disabled={
                      isLoading ||
                      transaction.payments.length === 0 ||
                      triggerPayrollMutation.isPending
                    }
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg bg-pryClr text-white hover:opacity-95 disabled:opacity-50 transition"
                    title="Initialize payment for all employees"
                  >
                    <span>Pay Staff</span>
                  </button>
                </div>
              </div>
              <table className="w-full text-center">
                <thead>
                  <tr className="bg-white/61 h-[77px]">
                    <th className="p-4 text-xs whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="accent-pryClr size-6"
                        checked={allSelectedOnPage}
                        onChange={handleSelectAll}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = someSelectedOnPage;
                          }
                        }}
                      />
                    </th>
                    <th className="text-xs whitespace-nowrap">S/N</th>
                    <th className="text-xs whitespace-nowrap">Employee Name</th>

                    <th className="text-xs whitespace-nowrap">Amount</th>
                    <th className="text-xs whitespace-nowrap">REF</th>
                    <th className="text-xs whitespace-nowrap">Status</th>
                    <th className="p-4 text-xs whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.payments.map((t, idx) => (
                    <tr
                      key={idx}
                      className={`${idx % 2 === 0 ? "bg-secClr/90" : "bg-[#FFF]"} h-[50px] border-y border-black/10`}
                      onMouseOver={() =>
                        setSelectedEmployee(t.employer_details)
                      }
                    >
                      <td className="p-2 text-xs whitespace-nowrap font-medium">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="accent-pryClr size-4"
                            checked={userIdsToBeActedOn.includes(
                              Number(t.employer_details.id),
                            )}
                            onChange={(e) => {
                              const { checked } = e.target;
                              const employeeIdAsNumber = Number(
                                t.employer_details.id,
                              );
                              setuserIdsToBeActedOn((prev) => {
                                if (checked) {
                                  return [...prev, employeeIdAsNumber];
                                } else {
                                  return prev.filter(
                                    (id) => id !== employeeIdAsNumber,
                                  );
                                }
                              });
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {(currentPageFromApi - 1) * apiItemsPerPage + (idx + 1)}
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap font-medium">
                        {t?.employer_details?.full_name || "-"}
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap font-medium">
                        N
                        {formatterUtility(Number(t.amount.toLocaleString())) ||
                          "-"}
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap font-medium">
                        {t?.employer_details?.recipient_code || "-"}
                      </td>

                      <td className="p-4 text-xs whitespace-nowrap capitalize">
                        {t.status || "-"}
                      </td>

                      <td className="p-4 text-xs whitespace-nowrap text-pryClr font-bold">
                        <button
                          className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 text- mx-auto w-10 h-10 flex justify-center items-center rounded-md duration-200 transition-all ${
                            t?.employer_details.paying === 0
                              ? "text-pryClr hover:bg-pryClr/10"
                              : "text-red-700 hover:bg-red-700/10"
                          }`}
                          title={
                            t?.employer_details.paying === 0
                              ? "Include employee from paying list"
                              : "Exclude employee from paying list"
                          }
                          onClick={() => setShowUpdateConfirmModal(true)}
                        >
                          {t?.employer_details.paying === 0 ? (
                            // "Include Employee"
                            <RiUserAddLine size={18} />
                          ) : (
                            // "Exclude Employee"
                            <RiUserMinusLine size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    className={"bg-white/61 h-[65px] border-t border-black/10"}
                  >
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
          )}
        </div>
      </div>

      {userIdsToBeActedOn.length > 0 && (
        <div className="fixed z-999 right-6 bottom-8 bg-white max-w-[320px] rounded-lg shadow-2xl border border-pryClr/10 p-4 flex gap-2 items-center justify-center">
          <p className="font-medium">
            {userIdsToBeActedOn.length} employee(s) selected.
          </p>
          <div className="flex gap-2">
            <button
              className="w-full px-3 h-10 rounded-md cursor-pointer text-sm text-pryClr hover:bg-pryClr/10 hover:opacity-90 disabled:opacity-50"
              title="Include Selected"
              disabled={updatePayingStatusMutation.isPending}
              onClick={() => {
                handleBulkUpdate(1);
              }}
            >
              <TbUsersPlus size={18} />
            </button>
            <button
              className="w-full px-3 h-10 rounded-md cursor-pointer text-sm text-red-600 hover:bg-red-600/10 hover:opacity-90 disabled:opacity-50"
              title="Exclude Selected"
              disabled={updatePayingStatusMutation.isPending}
              onClick={() => {
                handleBulkUpdate(0);
              }}
            >
              <TbUsersMinus size={18} />
            </button>
          </div>
        </div>
      )}

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
        isLoading={updatePayingStatusMutation.isPending}
      />

      <VerificationCodeDialog
        isOpen={showVerificationCodeDialog}
        onCancel={() => setShowVerificationCodeDialog(false)}
        onConfirm={handleInitializeBulkPayment}
        isLoading={triggerPayrollMutation.isPending}
      />
    </div>
  );
};

export default FailedPayment;

