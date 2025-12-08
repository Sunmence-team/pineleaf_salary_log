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
  state: string;
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

export interface branchOveriewProps {
  company_branch: string;
  total_employees: number;
  employers: employeeProps[];
}
