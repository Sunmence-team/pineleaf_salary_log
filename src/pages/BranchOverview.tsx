import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import type {
  branchOveriewProps,
  employeeProps,
} from "../store/sharedinterfaces";
import { formatterUtility } from "../utilities/FormatterUtility";
import { MdDelete, MdRemoveRedEye } from "react-icons/md";
import ViewEmployee from "../components/modal/ViewEmployee";
import ConfirmDialog from "../components/modal/ConfirmDialog";
import EditEmployee from "../components/modal/EditEmployee";
import {
  useBranchesOverviewQuery,
  useDeleteEmployeeMutation,
} from "../hooks/useApiQueries";
import { getErrorMessage } from "../utilities/api";

const branches = [
  "HQ - Onitsha",
  "Mgbuka",
  "Awka",
  "Asaba",
  "Owerri",
  "Port Harcourt",
  "Lagos Ajah",
  "Lagos Apapa",
  "Enugwu-Ukwu",
  "Abuja",
  "Abia",
  "Nnewi",
  "Enugu",
  "Amuwo odofin Lagos",
  "Ebonyi",
  "Nkpor",
];

const BranchOverview: React.FC = () => {
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] =
    useState<employeeProps | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] =
    useState<employeeProps | null>(null);

  // React Query hooks
  const { data: rawBranchesOverview, isLoading, error } = useBranchesOverviewQuery();
  const deleteEmployeeMutation = useDeleteEmployeeMutation();

  const branchesOverview: branchOveriewProps[] = useMemo(() => {
    if (!rawBranchesOverview || !rawBranchesOverview.data) {
      return branches.map((branchName) => ({
        company_branch: branchName,
        total_employees: 0,
        employers: [],
      }));
    }

    const apiBranches: branchOveriewProps[] = rawBranchesOverview.data || [];
    return branches.map((branchName) => {
      const apiBranch = apiBranches.find(
        (b) => b.company_branch === branchName,
      );
      return (
        apiBranch || {
          company_branch: branchName,
          total_employees: 0,
          employers: [],
        }
      );
    });
  }, [rawBranchesOverview]);

  const selectedBranch = useMemo(() => {
    if (!selectedBranchName) return null;
    return (
      branchesOverview.find((b) => b.company_branch === selectedBranchName) ||
      null
    );
  }, [selectedBranchName, branchesOverview]);

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Failed to load branch overview data."));
    }
  }, [error]);

  // Function to show the confirmation modal
  const confirmDeletion = (employee: employeeProps) => {
    setEmployeeToDelete(employee);
  };

  const editAction = () => {
    setSelectedEmployee(null);
    setSelectedBranchName(null);
  };

  // Function to handle the actual deletion API call
  const handleDeleteEmployee = () => {
    if (!employeeToDelete?.id) return;
    deleteEmployeeMutation.mutate(employeeToDelete.id, {
      onSettled: () => {
        setEmployeeToDelete(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="size-10 border-4 border-pryClr border-t-transparent rounded-full animate-spin mx-auto"></div>
    );
  }

  return (
    <div className="px-6 space-y-6">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {branchesOverview.map((branchOverview, index) => (
          <div
            key={branchOverview?.company_branch + "" + index}
            className={`bg-white cursor-pointer hover:scale-[103%] transition-all rounded-lg border ${branchOverview?.company_branch === selectedBranch?.company_branch ? "border-pryClr border-2" : "border-pryClr/5"} flex items-center justify-between p-6`}
            onClick={() => setSelectedBranchName(branchOverview.company_branch)}
          >
            <div className="flex flex-col items-center gap-1">
              <h4 className="text-black/80 text-xs">Branch Name</h4>
              <h2 className="text-sm font-bold">
                {branchOverview?.company_branch}
              </h2>
            </div>
            <div className="flex flex-col items-center gap-1">
              <h4 className="text-black/80 text-xs">Total Employees</h4>
              <h2 className="text-sm font-bold">
                {branchOverview?.total_employees}
              </h2>
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-white/61 h-[66px]">
              <th className="p-4 text-xs whitespace-nowrap">S/N</th>
              <th className="p-4 text-xs whitespace-nowrap">Full Name</th>
              <th className="p-4 text-xs whitespace-nowrap">Job Title</th>
              <th className="p-4 text-xs whitespace-nowrap">Department</th>
              <th className="p-4 text-xs whitespace-nowrap">Pay</th>
              <th className="p-4 text-xs whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {!selectedBranch ? (
              <tr className="bg-white/61">
                <td
                  colSpan={8}
                  className="p-4 text-center border-t border-black/10 text-gray-500"
                >
                  Click on a branch to view its employees
                </td>
              </tr>
            ) : selectedBranch?.employers.length === 0 && !isLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center bg-white/61 py-4 border-y border-black/10"
                >
                  No employee found under the selected branch.
                </td>
              </tr>
            ) : (
              selectedBranch?.employers.map((employee, index) => {
                return (
                  <tr
                    key={employee.id}
                    className={`${index % 2 === 0 ? "bg-black/5" : "bg-[#F8F8F8]"} h-[50px] border-y border-black/10`}
                  >
                    <td>{index + 1}</td>
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

                    <td className="p-4 text-xs whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-10 h-10 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                          title="View employee details"
                          onClick={() => {
                            setIsViewing(true);
                            setSelectedEmployee(employee);
                          }}
                        >
                          <MdRemoveRedEye size={18} />
                        </button>
                        <button
                          className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-10 h-10 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                          type="button"
                          title="Delete employee"
                          disabled={isLoading || deleteEmployeeMutation.isPending}
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
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(employeeToDelete)}
        title={`Delete ${employeeToDelete?.full_name}?`}
        message={`Are you sure you want to delete "${employeeToDelete?.full_name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onCancel={() => setEmployeeToDelete(null)}
        onConfirm={handleDeleteEmployee}
        isLoading={deleteEmployeeMutation.isPending}
      />

      <EditEmployee
        isOpen={Boolean(selectedEmployee) && isEditing}
        title={`Edit ${selectedEmployee?.full_name} Details`}
        employee={selectedEmployee}
        confirmText="Update Details"
        onCancel={() => setSelectedEmployee(null)}
        onConfirm={() => editAction()}
      />

      <ViewEmployee
        isOpen={Boolean(selectedEmployee) && isViewing}
        title={`${selectedEmployee?.full_name} Details`}
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onUpdate={() => {
          setIsViewing(false);
          setIsEditing(true);
        }}
      />
    </div>
  );
};

export default BranchOverview;

