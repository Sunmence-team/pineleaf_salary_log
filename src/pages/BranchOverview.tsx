import React, { useCallback, useEffect, useState } from 'react'
import { useUser } from '../context/UserContext';
import api from '../utilities/api';
import { toast } from "sonner";
import type { branchOveriewProps, employeeProps } from '../store/sharedinterfaces';
import { formatterUtility } from '../utilities/FormatterUtility';
import { MdDelete, MdRemoveRedEye } from 'react-icons/md';
import ViewEmployee from '../components/modal/ViewEmployee';
import ConfirmDialog from '../components/modal/ConfirmDialog';
import EditEmployee from '../components/modal/EditEmployee';

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

const BranchOverview: React.FC = () => {
    const { token } = useUser();
    const [branchesOverview, setBranchesOverview] = useState<branchOveriewProps[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<branchOveriewProps | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<employeeProps | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<employeeProps | null>(null);
    

    const fetchBranchesOverview = useCallback(async () => {
        setIsLoading(true);
        if (!token) return;
    
        try {
            const response = await api.get(`/filter_employers`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
    
            console.log("branch response", response);
        
            if (response.status === 200 && response.data.status === "success") {
                const apiBranches: branchOveriewProps[] = response.data.data || [];
                const mergedBranches = branches.map(branchName => {
                    const apiBranch = apiBranches.find(b => b.company_branch === branchName);
                    return apiBranch || { company_branch: branchName, total_employees: 0, employers: [] };
                });
                setBranchesOverview(mergedBranches);
            } else {
                toast.error(
                `Failed to fetch branches: ${
                    response.data.message || "Unknown error"
                }`);
            }
        } catch (err: any) {
            toast.error("Unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    
    useEffect(() => {
        fetchBranchesOverview();
    }, [fetchBranchesOverview]);

    // Function to show the confirmation modal
    const confirmDeletion = (employee: employeeProps) => {
        setEmployeeToDelete(employee);
    };

    const editAction = () => {
        setSelectedEmployee(null);
        setSelectedBranch(null);
        fetchBranchesOverview();
    };

    // Function to handle the actual deletion API call
    const handleDeleteEmployee = async () => {
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

            // console.log("employees delete response", response);

            if (response.status === 200) {
                toast.success(response.data.message);

                if (selectedBranch && employeeToDelete) {
                    const updatedEmployers = selectedBranch.employers.filter(
                        (emp) => Number(emp.id) !== Number(employeeToDelete.id)
                    );
                    setSelectedBranch({
                        ...selectedBranch,
                        employers: updatedEmployers,
                        total_employees: selectedBranch.total_employees - 1,
                    });

                    setBranchesOverview((prevBranches) =>
                        prevBranches.map((branch) => {
                            if (branch.company_branch === selectedBranch.company_branch) {
                                return {
                                    ...branch,
                                    employers: updatedEmployers,
                                    total_employees: branch.total_employees - 1,
                                };
                            }
                            return branch;
                        })
                    );
                }
            } else {
                toast.error(response.data.message || "Failed to delete employee");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error deleting employee");
            console.error("Error deleting employee", error);
        } finally {
            setIsDeleting(false);
            setEmployeeToDelete(null);
        }
    };


    if (isLoading) {
        return (
            <div className='size-10 border-4 border-pryClr border-t-transparent rounded-full animate-spin mx-auto'></div>
        )
    }

    return (
        <div className='px-6 space-y-6'>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                {
                    branchesOverview.map((branchOverview, index) => (
                        <div 
                            key={branchOverview?.company_branch + "" + index}
                            className={`bg-white cursor-pointer hover:scale-[103%] transition-all rounded-lg border ${branchOverview?.company_branch === selectedBranch?.company_branch ? "border-pryClr border-2" : "border-pryClr/5"} flex items-center justify-between p-6`}
                            onClick={() => setSelectedBranch(branchOverview)}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <h4 className='text-black/80 text-xs'>Branch Name</h4>
                                <h2 className='text-sm font-bold'>{branchOverview?.company_branch}</h2>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <h4 className='text-black/80 text-xs'>Total Employees</h4>
                                <h2 className='text-sm font-bold'>{branchOverview?.total_employees}</h2>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="overflow-x-auto rounded-lg no-scrollbar w-full lg:p-0 pe-4">
                <table className="w-full text-center">
                    <thead>
                        <tr className="bg-white/61 h-[66px]">
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
                            <th className="p-4 text-xs whitespace-nowrap">
                                Action
                            </th>
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
                                    <td>
                                        {index + 1}
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

                                    <td className="p-4 text-xs whitespace-nowrap">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                className="cursor-pointer text-pryClr disabled:cursor-not-allowed disabled:opacity-25 w-10 h-10 flex justify-center items-center hover:bg-pryClr/10 rounded-md duration-200 transition-all"
                                                title="View employee details"
                                                onClick={() => {
                                                    setIsViewing(true);
                                                    setSelectedEmployee(employee)
                                                }}
                                            >
                                                <MdRemoveRedEye size={18} />
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
                isLoading={isDeleting}
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
    )
}

export default BranchOverview