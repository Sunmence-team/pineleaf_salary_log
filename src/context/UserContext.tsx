import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import api, { setupInterceptors } from "../utilities/api";
const API_URL = import.meta.env.VITE_API_BASE_URL;

interface userProviderProps {
  children: React.ReactNode;
}

interface userProps {
  fullname: string;
  role: string;
}

interface dashboardMetricsProps {
  no_properties: number;
  no_purchases: number;
  no_users: number;
  total_balance: number | string;
  total_bonus: number | string;
}

const UserContext = createContext();

export const UserProvider = ({ children }: userProviderProps) => {
  const [user, setUser] = useState<userProps | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [dashboardMetrics, setDashboardMetrics] =
    useState<dashboardMetricsProps>({
      no_properties: 0,
      no_purchases: 0,
      no_users: 0,
      total_balance: "0.00",
      total_bonus: "0.00",
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
      // Reset metrics state
      no_properties: 0,
      no_purchases: 0,
      no_users: 0,
      total_balance: "0.00",
      total_bonus: "0.00",
    });
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "https://pineleafestates.com/#/login";
    }, 1000);
  };

  useEffect(() => {
    setupInterceptors(logout);
  }, []);

  const refreshUser = async (token: string) => {
    try {
      const response = await api.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("refresh response", response)

      const updatedUser = response.data;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setRole(updatedUser?.role || null);
    } catch (err) {
      console.error("Failed to refresh user:", err);
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
