import axios from "axios";
import api from "./api";

const COUNTRY_URL = import.meta.env.VITE_COUNTRY_BASE_URL;

export interface AddEmployeePayload {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  jobTitle: string;
  employmentType: string;
  employmentDate: string;
  department: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  salary_amount: string;
  company_branch: string;
  address: string;
  state: string;
  country: string;
}

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

