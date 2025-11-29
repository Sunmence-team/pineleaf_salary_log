import OverviewCards from "../components/cards/OverviewCards";
import {
  MdPeople,
  MdAttachMoney,
  MdCheckCircle,
  MdTrendingUp,
} from "react-icons/md";

import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import AllTransactions from "./AllTransactions";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import api from "../utilities/api";
import { toast } from "sonner";
import { formatterUtility } from "../utilities/FormatterUtility";

export interface employeeProps {
  salary_amount: string;
}


const Dashboard = () => {
  const { dashboardMetrics, refreshUser, token } = useUser();
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ totalApiPages, setTotalApiPages ] = useState<number>(0);
  const [employees, setEmployees] = useState<employeeProps[]>([]);

  const fetchEmployees = async () => {
    if (!token) return;
  
    setIsLoading(true);
  
    try {
      const response = await api.get(`/all_employers?per_page=1000`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("employees response", response);

      if (response.status === 200 && response.data.status === "success") {
        setEmployees(response.data.data.data);
        setTotalApiPages(response.data.data.total);
      } else {
        toast.error(`Failed to fetch stats`)
      }
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      toast.error(`Failed to fetch stats`)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser(token ? token : "")
    fetchEmployees()
  }, [token])

  const estimatedSalries = employees.reduce((total, eachEmp) => {
    return total + Number(eachEmp.salary_amount)
  }, 0)


  return (
    <div className="flex flex-col gap-8 px-4 md:px-6">
      <div className="flex gap-4 justify-between overflow-x-scroll no-scrollbar">
        <div className="lg:min-w-[calc((100%/4)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Employees"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-6 h-6 flex items-center justify-center rounded-full">
                <MdPeople />
              </div>
            }
            // value={isLoading ? "..." : dashboardMetrics.total_employees || 0}
            value={isLoading ? "..." : totalApiPages || 0}
          />
        </div>
        <div className="lg:min-w-[calc((100%/4)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Salary Paid"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-6 h-6 flex items-center justify-center rounded-full">
                <MdAttachMoney />
              </div>
            }
            value={isLoading ? "..." : dashboardMetrics.total_salary_paid || 0}
          />
        </div>
        <div className="lg:min-w-[calc((100%/4)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="No of completed payments"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-6 h-6 flex items-center justify-center rounded-full">
                <MdCheckCircle />
              </div>
            }
            value={isLoading ? "..." : dashboardMetrics.no_CompletedPayments || 0}
          />
        </div>
        <div className="lg:min-w-[calc((100%/4)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Estimated Salary"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-6 h-6 flex items-center justify-center rounded-full">
                <MdTrendingUp />
              </div>
            }
            value={isLoading ? "..." : formatterUtility(Number(estimatedSalries)) || 0}
          />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2>Recent Transactions</h2>
          <Link to="/alltransactions" className="flex items-center underline">
            View All <GoArrowUpRight />
          </Link>
        </div>
        <div className="">
          <AllTransactions isRecent={true} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
