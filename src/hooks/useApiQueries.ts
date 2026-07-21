import { useMutation, useQuery } from "@tanstack/react-query";
import { Login, refreshUser } from "../utilities/apiFunctions";
import { toast } from "sonner";
import type { userMetrics } from "../store/sharedinterfaces";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utilities/api";
import { useUser } from "./UseUserContext";

export const useLoginMutation = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: Login,
    onSuccess: (data) => {
      toast.success("Logged in successfully");
      setTimeout(() => {
        const redirectToast = toast.loading("Redirecting to dashboard");
        setTimeout(() => {
          toast.dismiss(redirectToast);
          const token: string = data.token;
          const metrics: userMetrics = {
            total_employees: data.total_employees,
            total_salary_paid: data.total_salary_paid,
            no_CompletedPayments: data.no_CompletedPayments,
            total_estimated_salary: data.total_estimated_salary,
          };
          const user: { role: string } = {
            role: data.role,
          };
          login(token, user, metrics);
          navigate("/overview");
        }, 500);
      }, 100);
    },
    onError: (error) => {
      const errMsg = getErrorMessage(error, "Failed to Login");
      toast.error(errMsg);
    },
  });
};

export const useRefreshUserQuery = () => {
  return useQuery({
    queryKey: ["refresh-user"],
    queryFn: refreshUser,
    
  });
};
