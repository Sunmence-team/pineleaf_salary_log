import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import api, { setupInterceptors } from "../utilities/api";

interface userProviderProps {
  children: React.ReactNode;
}

interface userProps {
  role: string;
}

interface dashboardMetricsProps {
  total_employees: number;
  total_salary_paid: number;
  no_CompletedPayments:number;
  total_estimated_salary:number
}

interface UserContextType {
  user: userProps | null;
  token: string | null;
  role: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<userProps | null>>;
  login: (token: string, user: userProps, metrics: dashboardMetricsProps) => void;
  logout: () => void;
  isLoggedIn: boolean;
  refreshUser: (token: string) => Promise<void>;
  isLoading: boolean;
  dashboardMetrics: dashboardMetricsProps;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: userProviderProps) => {
  const [user, setUser] = useState<userProps | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [dashboardMetrics, setDashboardMetrics] =
    useState<dashboardMetricsProps>({
      total_employees: 0,
      total_salary_paid: 0,
      no_CompletedPayments:0,
      total_estimated_salary:0
    });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedMetrics = localStorage.getItem("dashboardMetrics");
    // console.log("storedToken", storedToken)
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      setRole(parsedUser?.role || null);
    }

    if (storedMetrics) {
      setDashboardMetrics(JSON.parse(storedMetrics));
    }
  }, []);

  const login = (
    token: string,
    user: userProps,
    metrics: dashboardMetricsProps
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

  const isLoggedIn = !!token;

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

  const refreshUser = async (token: string) => {
    try {
      const response = await api.get(`/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("refresh response", response)

      const updatedMe = response.data;
      setDashboardMetrics({
        total_employees: updatedMe?.total_employees,
        total_salary_paid: updatedMe?.total_salary_paid,
        no_CompletedPayments: updatedMe?.no_completed_payments,
        total_estimated_salary: updatedMe?.total_estimated_salary,
      });
    } catch (err) {
      console.error("Failed to refresh user:", err);
    } finally {
      setIsLoading(false)
    }
  };

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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within an UserProvider");
  }
  return context;
};
