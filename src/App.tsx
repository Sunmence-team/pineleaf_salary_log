import { Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { Toaster } from "sonner";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import AllEmployees from "./pages/AllEmployees";
import ManagePayments from "./pages/ManagePayments";
import AllTransactions from "./pages/AllTransactions";
import BranchOverview from "./pages/BranchOverview";
import FailedPayment from "./pages/FailedPayment";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path={"/"} element={<Login />} />
        <Route path={"/login"} element={<Login />} />
        <Route
          path={"/overview"}
          element={<MainLayout pageName="Overview" children={<Dashboard />} />}
        />
        <Route
          path={"/addemployee"}
          element={
            <MainLayout pageName="Add Employee" children={<AddEmployee />} />
          }
        />
        <Route
          path={"/managemployees"}
          element={
            <MainLayout
              pageName="Manage Employee"
              children={<AllEmployees />}
            />
          }
        />
        <Route
          path={"/managepayments"}
          element={
            <MainLayout
              pageName="Manage Payments"
              children={<ManagePayments />}
            />
          }
        />
        <Route
          path={"/managepayments/failed/:month"}
          element={
            <MainLayout
              pageName="Manage Failed Payments"
              children={<FailedPayment />}
            />
          }
        />
        <Route
          path={"/alltransactions"}
          element={
            <MainLayout
              pageName="All Transactions"
              children={<AllTransactions isRecent={false} />}
            />
          }
        />
        <Route
          path={"/branchoverview"}
          element={
            <MainLayout
              pageName="Branch Overview"
              children={<BranchOverview />}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
