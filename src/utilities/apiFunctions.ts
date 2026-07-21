import axios from "axios";
import api from "./api";
import type {
  AddEmployeePayload,
  FetchEmployeesParams,
  UpdateEmployeePayload,
  UpdatePayingStatusPayload,
  FetchTransactionsParams,
  FetchFailedPaymentsParams,
  FailedPaymentsResponse,
} from "../store/sharedinterfaces";

const COUNTRY_URL = import.meta.env.VITE_COUNTRY_BASE_URL;

export const Login = async (values: { username: string; password: string }) => {
  const res = await api.post("/login", values);
  return res.data;
};


export const refreshUser = async () => {
  const res = await api.get("/me");
  return res.data;
};

export const createEmployee = async (payload: AddEmployeePayload) => {
  const res = await api.post("/employers", payload);
  return res.data;
};

export const fetchEmployees = async ({
  search = "",
  page = 1,
  per_page = 5,
  paying = "",
  company_branch = "",
}: FetchEmployeesParams = {}) => {
  const res = await api.get(
    `/all_employers?search=${search}&page=${page}&per_page=${per_page}&paying=${paying}&company_branch=${company_branch}`,
  );
  return res.data;
};

export const deleteEmployee = async (id: string) => {
  const res = await api.delete(`/delete_employers/${id}`);
  return res.data;
};

export const updateEmployee = async ({
  id,
  payload,
}: UpdateEmployeePayload) => {
  const res = await api.put(`/edit_employers/${id}`, payload);
  return res.data;
};

export const fetchCountries = async () => {
  const response = await axios.get(`${COUNTRY_URL}/api/countries`);
  return response.data;
};

export const fetchStates = async (countryId: number) => {
  const response = await axios.get(
    `${COUNTRY_URL}/api/countries/${countryId}/states`,
  );
  return response.data;
};

export const fetchBranchesOverview = async () => {
  const res = await api.get("/filter_employers");
  return res.data;
};

export const updatePayingStatus = async (
  payload: UpdatePayingStatusPayload,
) => {
  const res = await api.post("/employees/paying_all", payload);
  return res.data;
};

export const triggerPayroll = async (code: string) => {
  const res = await api.post("/trigger-payroll", { code });
  return res.data;
};

export const fetchTransactions = async ({
  page = 1,
  per_page = 5,
  month = "",
}: FetchTransactionsParams = {}) => {
  const url = month
    ? `/payments?month=${month}&page=${page}&per_page=${per_page}`
    : `/payments?page=${page}&per_page=${per_page}`;
  const res = await api.get(url);
  return res.data;
};

export const fetchFailedPayments = async ({
  page = 1,
  per_page = 5,
  month = "",
}: FetchFailedPaymentsParams = {}) : Promise<FailedPaymentsResponse> => {
  const res = await api.get(
    `/employeenotpaid?page=${page}&per_page=${per_page}&month=${month}`,
  );
  return res.data;
};


