export interface bankProps {
  id: string;
  name: string;
  code: string;
}

export interface employeeProps {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employmentDate: string;
  employmentType: string;
  jobTitle: string;
  department: string;
  country: string;
  state: string;
  address: string;
  company_branch: string;
  salary_amount: string;
  created_at: string;
  gender: string;
  dob: string;
  bank_name: string;
  account_number: string;
  recipient_code: string | null;
  account_name: string;
  paying: number;
  sub_charge?: number;
  sub_charge_reason?: string;
  sub_charge_months?: number;
}

export interface transactionsProps {
  id: string;
  created_at: string;
  amount: string;
  status: string | null;
  employer_details: employeeProps;
}

export interface groupTransactionProps {
  month: string;
  total_amount: number;
  count: number;
  payments: transactionsProps[];
}

export interface userProviderProps {
  children: React.ReactNode;
}

export interface userProps {
  role: string;
}

export interface dashboardMetricsProps {
  total_employees: number;
  total_salary_paid: number;
  no_CompletedPayments: number;
  total_estimated_salary: number;
}

export interface UserContextType {
  user: userProps | null;
  token: string | null;
  role: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<userProps | null>>;
  login: (
    token: string,
    user: userProps,
    metrics: dashboardMetricsProps,
  ) => void;
  logout: () => void;
  isLoggedIn: boolean;
  refreshUser: (token: string) => Promise<void>;
  isLoading: boolean;
  dashboardMetrics: dashboardMetricsProps;
}

export interface branchOveriewProps {
  company_branch: string;
  total_employees: number;
  employers: employeeProps[];
}

export interface userMetrics {
  total_employees: number;
  total_salary_paid: number;
  no_CompletedPayments: number;
  total_estimated_salary: number;
}

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

export interface FetchEmployeesParams {
  search?: string;
  page?: number;
  per_page?: number;
  paying?: string;
  company_branch?: string;
}

export interface UpdateEmployeePayload {
  id: string;
  payload: Partial<employeeProps> & Record<string, unknown>;
}

export interface EditEmployeeFormValues {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  country: string;
  gender: string;
  dob: string;
  jobTitle: string;
  company_branch: string;
  department: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  employmentType: string;
  employmentDate: string;
  salary_amount: string;
  sub_charge: string | number;
  sub_charge_reason: string;
  sub_charge_months: string | number;
}

export interface CountryApiResponse {
  name: string;
  id: number;
  iso2: string;
}

export interface StateItem {
  name: string;
  isoCode: string;
}

export interface EditEmployeeProps {
  isOpen: boolean;
  title?: string;
  employee: employeeProps | null;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ViewEmployeeProps {
  isOpen: boolean;
  title?: string;
  employee: employeeProps | null;
  onClose: () => void;
  onUpdate: () => void;
  showEditButton?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export interface UpdatePayingStatusPayload {
  ids: (number | string)[];
  paying: 0 | 1;
}

