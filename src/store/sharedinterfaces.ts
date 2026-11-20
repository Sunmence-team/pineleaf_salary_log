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
  onDeduct?: () => void;
  showEditButton?: boolean;
}

export interface CreateDeductionPayload {
  employee_id: number;
  amount: number;
  reason: string;
  no_of_month: number;
}

export interface DeductionItem {
  id: number;
  employee_id: string | number;
  amount: string | number;
  reason: string;
  no_of_month: string | number;
  start_date?: string;
  end_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  employer?: {
    id: number;
    full_name: string;
    email: string;
    salary_amount: string;
  };
}

export interface CreateDeductionResponse {
  status: string;
  message: string;
  deduction: DeductionItem;
}

export interface FetchDeductionsParams {
  status?: string;
  month?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface DeductionRecord {
  id: number;
  amount: string;
  employee_id: string;
  reason: string;
  no_of_month: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "stopped" | string;
  created_at: string;
  updated_at: string;
  employer: employeeProps;
}

export interface DeductionsPagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  data: DeductionRecord[];
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  from?: number;
  to?: number;
}

export interface DeductionsApiResponse {
  status: string;
  count?: number;
  data: DeductionsPagination;
}

export interface DeductionModalProps {
  isOpen: boolean;
  title?: string;
  employee?: employeeProps | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface ViewDeductionModalProps {
  isOpen: boolean;
  deduction: DeductionRecord | null;
  onClose: () => void;
  onEdit?: () => void;
}

export interface UpdateDeductionPayload {
  amount: number;
  reason: string;
  no_of_month: number;
}

export interface EditDeductionModalProps {
  isOpen: boolean;
  title?: string;
  deduction: DeductionRecord | null;
  onClose: () => void;
  onSuccess?: () => void;
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
export interface PaymentTypeSelectorModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (otherValues: { payroll_type: string; branch?: string }) => void;
}

export interface UpdatePayingStatusPayload {
  ids: (number | string)[];
  paying: 0 | 1;
}

export interface FetchTransactionsParams {
  page?: number;
  per_page?: number;
  month?: string;
}

export interface FetchFailedPaymentsParams {
  page?: number;
  per_page?: number;
  month?: string;
}

export interface Payment {
  id: number;
  amount: string;
  status: "paid" | "pending" | "failed";
  created_at: string;
  employer_details: employeeProps;
}

export interface PayrollResponse {
  month: string;
  count: number;
  total_amount: number;
  payments: Payment[];
}

export interface FailedPaymentsResponse {
  success: boolean;
  data: PayrollResponse[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
}
