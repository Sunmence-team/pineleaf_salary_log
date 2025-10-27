import React from "react";
import OverviewCards from "../components/cards/OverviewCards";
import { MdWallet } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-8 px-4 md:px-6">
      <div className="flex gap-4 justify-between overflow-x-scroll no-scrollbar">
        <div className="lg:min-w-[calc((100%/3)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Employees"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-8 h-8 flex items-center justify-center rounded-full">
                <FaUsers />
              </div>
            }
            value="43"
          />
        </div>
        <div className="lg:min-w-[calc((100%/3)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Employees"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-8 h-8 flex items-center justify-center rounded-full">
                <FaUsers />
              </div>
            }
            value="43"
          />
        </div>
        <div className="lg:min-w-[calc((100%/3)-16px)]! md:min-w-[33.3%]! min-w-[310px]">
          <OverviewCards
            title="Total Employees"
            icon={
              <div className="bg-pryClr/20 text-pryClr w-8 h-8 flex items-center justify-center rounded-full">
                <FaUsers />
              </div>
            }
            value="43"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
