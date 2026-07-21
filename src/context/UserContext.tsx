import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage, setupInterceptors } from "../utilities/api";
import type {
  dashboardMetricsProps,
  userProps,
  userProviderProps,
} from "../store/sharedinterfaces";
import { UserContext } from "../hooks/UseUserContext";
import { useRefreshUserQuery } from "../hooks/useApiQueries";

export const UserProvider = ({ children }: userProviderProps) => {
  const [user, setUser] = useState<userProps | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const [dashboardMetrics, setDashboardMetrics] =
    useState<dashboardMetricsProps>({
      total_employees: 0,
      total_salary_paid: 0,
      no_CompletedPayments: 0,
      total_estimated_salary: 0,
    });

    
  const { data: refreshedUser, error } = useRefreshUserQuery(token);

  const refreshUser = useCallback(async () => {
    if (error) {
      const errMsg = getErrorMessage(error, "Failed to refresh user");
      toast.error(errMsg);
      return;
    }

    setDashboardMetrics({
      total_employees: refreshedUser?.total_employees,
      total_salary_paid: refreshedUser?.total_salary_paid,
      no_CompletedPayments: refreshedUser?.no_completed_payments,
      total_estimated_salary: refreshedUser?.total_estimated_salary,
    });
    localStorage.setItem(
      "dashboardMetrics",
      JSON.stringify({
        total_employees: refreshedUser?.total_employees,
        total_salary_paid: refreshedUser?.total_salary_paid,
        no_CompletedPayments: refreshedUser?.no_completed_payments,
        total_estimated_salary: refreshedUser?.total_estimated_salary,
      }),
    );
  }, [error, refreshedUser]);


  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        const storedMetrics = localStorage.getItem("dashboardMetrics");

        if (!storedToken || !storedUser || !storedMetrics) {
          setIsLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setRole(parsedUser?.role || null);
        setDashboardMetrics(JSON.parse(storedMetrics));
        refreshUser();
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Session error details:", error);
        logout();
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshUser]);

  const login = (
    token: string,
    user: userProps,
    metrics: dashboardMetricsProps,
  ) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    setRole(user?.role || null);

    if (metrics) {
      localStorage.setItem("dashboardMetrics", JSON.stringify(metrics));
      setDashboardMetrics(metrics);
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    localStorage.removeItem("user");
    setUser(null);
    localStorage.removeItem("dashboardMetrics"); // Clear metrics on logout
    setDashboardMetrics({
      total_employees: 0,
      total_salary_paid: 0,
      no_CompletedPayments: 0,
      total_estimated_salary: 0,
    });
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "https://salary.pineleafestates.com";
    }, 1000);
  };

  useEffect(() => {
    setupInterceptors(logout);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        role,
        setToken,
        setUser,
        login,
        logout,
        isLoggedIn,
        refreshUser,
        isLoading,
        dashboardMetrics,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
