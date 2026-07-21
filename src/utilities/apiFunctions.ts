import axios from "axios";
import api from "./api";
import type {
  AddEmployeePayload,
  FetchEmployeesParams,
  UpdateEmployeePayload,
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
}: FetchEmployeesParams = {}) => {
  const res = await api.get(
    `/all_employers?search=${search}&page=${page}&per_page=${per_page}`,
  );
  return res.data;
};

export const deleteEmployee = async (id: string) => {
  const res = await api.delete(`/delete_employers/${id}`);
  return res.data;
};

export const updateEmployee = async ({ id, payload }: UpdateEmployeePayload) => {
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

