import React, { useCallback, useEffect, useState } from "react";
import type {
  groupTransactionProps,
  transactionsProps,
} from "../store/sharedinterfaces";
import { toast } from "sonner";
import api from "../utilities/api";
import { useUser } from "../context/UserContext";
import PaginationControls from "../utilities/PaginationControls";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../utilities/FormatterUtility";
import { CgSpinner } from "react-icons/cg";
interface AllCotransactionsProps {
  isRecent: boolean;
}

const AllTransactions: React.FC<AllCotransactionsProps> = ({ isRecent }) => {
  const { token } = useUser();
  const [transactions, setTransactions] = useState<groupTransactionProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPageFromApi, setCurrentPageFromApi] = useState(1);
  const [totalApiPages, setTotalApiPages] = useState(1);

  const apiItemsPerPage = 10;

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    // setError(null);

    try {
      const resopnse = await api.get(
        `/payments?page=${currentPageFromApi}&per_page=${apiItemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resopnse.status === 200 && resopnse.data.success) {
        setTransactions(resopnse.data.data);
        setCurrentPageFromApi(resopnse.data.pagination.current_page);
        setTotalApiPages(resopnse.data.pagination.last_page);
      } else {
        toast.error(
          `Failed to fetch transactions: ${
            resopnse.data.message || "Unknown error"
          }`
        );
      }
    } catch (err: any) {
      if (err.code === "ECONNABORTED") {
        toast.error("Request timed out. Please try again.");
      } else if (err.resopnse) {
        toast.error(
          err.resopnse.data?.message || "Something went wrong on the server."
        );
      } else if (err.request) {
        toast.error("Server not responding. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred. Please try again.");
      }
      // setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPageFromApi, apiItemsPerPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTransactions();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [fetchTransactions]);

  useEffect(() => {
    setCurrentPageFromApi(1);
  }, []);

  const transactionToShow = isRecent ? transactions.slice(0, 5) : transactions;
  const [availableTransaction, setAvailableTransaction] = useState<{
    status: boolean;
    transactions: transactionsProps[];
  }>({
    status: false,
    transactions: [],
  });

  const convertToCSV = (data: any[]) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((value) => `"${value}"`)
        .join(",")
    );
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (data: any[], fileName = "transactions.csv") => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  function getMonthsBackward(count = 24) {
    const result = [];
    const date = new Date();

    for (let i = 0; i < count; i++) {
      const year = date.getFullYear();
      const monthNumber = date.getMonth() + 1;
      const monthName = date.toLocaleString("default", { month: "long" });

      result.push({
        month: monthName,
        number: monthNumber,
        year,
      });

      date.setMonth(date.getMonth() - 1);
    }

    return result;
  }

  useEffect(() => {
    if (selectedMonth && selectedMonth !== "all") {
      const fetchTransactions = async () => {
        setIsLoading(true);
        // setError(null);

        try {
          const resopnse = await api.get(
            `/payments?month=${selectedMonth}&page=${currentPageFromApi}&per_page=${apiItemsPerPage}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (resopnse.status === 200 && resopnse.data.success) {
            setTransactions(resopnse.data.data);
            setCurrentPageFromApi(resopnse.data.pagination.current_page);
            setTotalApiPages(resopnse.data.pagination.last_page);
          } else {
            toast.error(
              `Failed to fetch transactions: ${
                resopnse.data.message || "Unknown error"
              }`
            );
          }
        } catch (err: any) {
          if (err.code === "ECONNABORTED") {
            toast.error("Request timed out. Please try again.");
          } else if (err.resopnse) {
            toast.error(
              err.resopnse.data?.message ||
                "Something went wrong on the server."
            );
          } else if (
            err.response.data.message === "No salary paid for that month"
          ) {
            toast.error("Couldn't find transaction for the selected month");
          } else if (err.request) {
            toast.error("Server not responding. Please check your connection.");
          } else {
            toast.error("Unexpected error occurred. Please try again.");
          }
          // setError(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactions();
    } else {
      fetchTransactions();
    }
  }, [selectedMonth]);

  return (
    <div
      className={`flex flex-col gap-8 ${isRecent ? "p-0" : "px-4 lg:px-6"}`}
    >
      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        {!isRecent ? (
          <div className="flex items-center justify-end mb-6">
            <div className="">
              <select
                name="yearBack"
                onChange={(e) => setSelectedMonth(e.target.value)}
                id="yearBack"
                className="py-2 border border-gray-300 rounded-md focus:outline-none focus:border-pryClr pl-2 pr-5 cursor-pointer"
              >
                <option selected disabled>
                  Filter by month
                </option>
                <option value={"all"}>All</option>
                {getMonthsBackward().map((month, idx) => (
                  <option
                    key={idx}
                    value={`${month.year}-${month.number}`}
                  >{`${month.month}, ${month.year}`}</option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center flex-col justify-center h-[40vh]">
              <CgSpinner className="text-4xl sm:text-5xl lg:text-6xl animate-spin" />
              <h2 className="text-base sm:text-xl lg:text-2xl font-medium">
                Loading transactions...
              </h2>
            </div>
          ) : transactionToShow.length === 0 ? (
            <div className="flex items-center flex-col justify-center h-[40vh]">
              <h2 className="text-base sm:text-xl lg:text-2xl font-medium">
                No recent transactions
              </h2>
            </div>
          ) : (
            transactionToShow.map((t, idx) => (
              <>
                <div
                  className="flex flex-col gap-3 bg-white border border-black/10 rounded-lg p-4"
                  key={idx}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <h2 className="text-xl font-semibold">{t.month}</h2>
                      <h4 className="font-medium text-sm text-gray-600">
                        Total amount paid: N{t.total_amount.toLocaleString()}
                      </h4>
                    </div>
                    <div className="flex items-stretch flex-col lg:flex-row gap-4">
                      <button
                        className="bg-pryClr text-white rounded-lg h-[45px] px-4 text-sm cursor-pointer font-semibold"
                        onClick={() =>
                          setAvailableTransaction({
                            status: !availableTransaction.status,
                            transactions: t.payments,
                          })
                        }
                      >
                        View transaction
                      </button>
                      <button
                        className="bg-tetClr text-white rounded-lg h-[45px] px-4 text-sm cursor-pointer font-semibold"
                        onClick={() => {
                          if (!t.payments?.length) {
                            toast.error(
                              "No transactions available for this month"
                            );
                            return;
                          }
                          const loading = toast.loading("Exporting as CSV");

                          const formatted = t.payments.map((item: any) => ({
                            EmployeeName:
                              item.employer_details?.full_name || "-",
                            Amount: item.amount,
                            Reference:
                              item.employer_details?.recipient_code || "-",
                            Status: item.status,
                            PaymentDate:
                              formatISODateToCustom(item.created_at) || "-",
                          }));

                          downloadCSV(formatted, `${t.month}-transactions.csv`);
                          toast.dismiss(loading);
                        }}
                      >
                        Export as CSV
                      </button>
                    </div>
                  </div>
                  {availableTransaction.status &&
                  availableTransaction.transactions === t.payments ? (
                    <>
                      <table className="w-full text-center">
                        <thead>
                          <tr className="bg-white/61 h-[77px]">
                            <th className="text-xs whitespace-nowrap">S/N</th>
                            <th className="text-xs whitespace-nowrap">
                              Employee Name
                            </th>

                            <th className="text-xs whitespace-nowrap">
                              Amount
                            </th>
                            <th className="text-xs whitespace-nowrap">REF</th>
                            <th className="text-xs whitespace-nowrap">
                              Status
                            </th>
                            <th className="text-xs whitespace-nowrap">
                              Payment Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableTransaction.transactions.map((t, idx) => (
                            <tr
                              key={idx}
                              className={`${idx % 2 === 0 ? "bg-secClr/90" : "bg-[#FFF]"} h-[50px] border-y border-black/10`}
                            >
                              <td>
                                {(currentPageFromApi - 1) * apiItemsPerPage +
                                  (idx + 1)}
                              </td>
                              <td className="p-4 text-xs whitespace-nowrap font-medium">
                                {t?.employer_details?.full_name || "-"}
                              </td>
                              <td className="p-4 text-xs whitespace-nowrap font-medium">
                                N
                                {formatterUtility(
                                  Number(t.amount.toLocaleString())
                                ) || "-"}
                              </td>
                              <td className="p-4 text-xs whitespace-nowrap font-medium">
                                {t?.employer_details?.recipient_code || "-"}
                              </td>

                              <td className="p-4 text-xs whitespace-nowrap capitalize">
                                {t.status || "-"}
                              </td>

                              <td className="p-4 text-xs whitespace-nowrap text-pryClr font-bold">
                                {formatISODateToCustom(t.created_at) || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr
                            className={
                              "bg-white/61 h-[65px] border-t border-black/10"
                            }
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
                    </>
                  ) : null}
                </div>
              </>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTransactions;
