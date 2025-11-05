import React, { useCallback, useEffect, useState } from "react";
import type { transactionsProps } from "../store/sharedinterfaces";
import { toast } from "sonner";
import api from "../utilities/api";
import { useUser } from "../context/UserContext";
import PaginationControls from "../utilities/PaginationControls";
import { MdDelete, MdModeEditOutline, MdRemoveRedEye } from "react-icons/md";
import { Link } from "react-router-dom";
import {
  formatISODateToCustom,
  formatterUtility,
} from "../utilities/FormatterUtility";
import ConfirmDialog from "../components/modal/ConfirmDialog";
interface AllCotransactionsProps {
  isRecent: boolean;
}

const AllTransactions: React.FC = ({
  isRecent = false,
}: AllCotransactionsProps) => {
  const { token } = useUser();
  const [transactions, setTransactions] = useState<transactionsProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPageFromApi, setCurrentPageFromApi] = useState(1);
  const [totalApiPages, setTotalApiPages] = useState(1);

  const apiItemsPerPage = 10;

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/payments?page=${currentPageFromApi}&per_page=${apiItemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);

      if (response.status === 200 && response.data.success) {
        setTransactions(response.data.data);
        setCurrentPageFromApi(response.data.pagination.current_page);
        setTotalApiPages(response.data.pagination.last_page);
      } else {
        toast.error(
          `Failed to fetch transactions: ${
            response.data.message || "Unknown error"
          }`
        );
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      if (err.code === "ECONNABORTED") {
        toast.error("Request timed out. Please try again.");
      } else if (err.response) {
        toast.error(
          err.response.data?.message || "Something went wrong on the server."
        );
      } else if (err.request) {
        toast.error("Server not responding. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred. Please try again.");
      }
      setError(err);
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

  return (
    <div className={`flex flex-col gap-8 ${isRecent ? "p-0" : "px-4 lg:px-6"}`}>
      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-white/61 h-[77px]">
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">S/N</th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">
                Employee Name
              </th>

              <th className="p-4 md:text-sm text-xs whitespace-nowrap">
                Amount
              </th>
              <th className="p-4 md:text-sm text-xs whitespace-nowrap">
                Payment Date
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
                  Loading transactions...
                </td>
              </tr>
            ) : error ? (
              <tr className="bg-white/61">
                <td
                  colSpan={8}
                  className="p-4 text-center border-t border-black/10 text-gray-500"
                >
                  {error.message}
                </td>
              </tr>
            ) : transactionToShow.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center bg-white/61 py-4 border-y border-black/10"
                >
                  No transaction found
                </td>
              </tr>
            ) : (
              transactionToShow.map((transaction, index) => {
                return (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-black/5" : "bg-[#F8F8F8]"
                    } h-[50px] border-y border-black/10`}
                  >
                    <td>
                      {(currentPageFromApi - 1) * apiItemsPerPage + (index + 1)}
                    </td>
                    <td className="p-4 md:text-sm text-xs whitespace-nowrap font-medium">
                      {transaction.employee_name || "-"}
                    </td>

                   

                    <td className="p-4 md:text-sm text-xs whitespace-nowrap">
                      N{formatterUtility(Number(transaction.amount)) || "-"}
                    </td>

                    <td className="p-4 md:text-sm text-xs whitespace-nowrap text-pryClr font-bold">
                      {formatISODateToCustom(transaction.payment_date) || "-"}
                    </td>
                  </tr>
                );
              })
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
    </div>
  );
};

export default AllTransactions;
