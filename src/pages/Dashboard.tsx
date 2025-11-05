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

const Dashboard = () => {
  const { dashboardMetrics } = useUser();
  return (
    <div className="flex flex-col gap-8 px-4 md:px-6">
      <div className="flex gap-4 justify-between overflow-x-scroll no-scrollbar">
        <div className="lg:min-w-[calc((100%/3)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Employees"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-8 h-8 flex items-center justify-center rounded-full">
                <MdPeople />
              </div>
            }
            value={dashboardMetrics.total_employees}
          />
        </div>
        <div className="lg:min-w-[calc((100%/3)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Salary Paid"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-8 h-8 flex items-center justify-center rounded-full">
                <MdAttachMoney />
              </div>
            }
            value={dashboardMetrics.total_salary_paid}
          />
        </div>
        <div className="lg:min-w-[calc((100%/3)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="No of completed payments"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-8 h-8 flex items-center justify-center rounded-full">
                <MdCheckCircle />
              </div>
            }
            value={dashboardMetrics.no_CompletedPayments}
          />
        </div>
        <div className="lg:min-w-[calc((100%/3)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Estimated Salary"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-8 h-8 flex items-center justify-center rounded-full">
                <MdTrendingUp />
              </div>
            }
            value={dashboardMetrics.total_estimated_salary}
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
