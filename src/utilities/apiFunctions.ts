import api from "./api";

export const Login = async (values: { username: string; password: string }) => {
  const res = await api.post("/login", values);
  return res.data;
};

export const refreshUser = async () => {
  const res = await api.get("/me");
  return res.data;
};
