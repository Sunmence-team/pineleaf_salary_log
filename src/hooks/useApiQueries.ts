import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Login,
  refreshUser,
  createEmployee,
  fetchCountries,
  fetchStates,
} from "../utilities/apiFunctions";
import {
  fetchPaystackBanks,
  resolveAccountNumber,
} from "../utilities/paystackHelper";
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

export const useCreateEmployeeMutation = () => {
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (data) => {
      toast.success(data?.message || "Employee added successfully!");
    },
    onError: (error) => {
      const errMsg = getErrorMessage(error, "Error creating employee");
      toast.error(errMsg);
    },
  });
};

export const usePaystackBanksQuery = () => {
  return useQuery({
    queryKey: ["paystack-banks"],
    queryFn: fetchPaystackBanks,
    staleTime: 1000 * 60 * 60,
  });
};

export const useResolveAccountQuery = (
  accountNumber: string,
  bankCode: string,
) => {
  return useQuery({
    queryKey: ["resolve-account", accountNumber, bankCode],
    queryFn: () => resolveAccountNumber(accountNumber, bankCode),
    enabled: accountNumber.length === 10 && Boolean(bankCode),
    retry: false,
  });
};

export const useCountriesQuery = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useStatesQuery = (countryId: number | null | undefined) => {
  return useQuery({
    queryKey: ["states", countryId],
    queryFn: () => fetchStates(countryId!),
    enabled: typeof countryId === "number" && countryId > 0,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

