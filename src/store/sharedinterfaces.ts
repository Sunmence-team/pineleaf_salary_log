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
  employmentType: string;
  jobTitle: string;
  company_branch: string;
  salary_amount: string;
  created_at: string;
  gender: string;
  dob: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  paying: number;
}

export interface transactionsProps {
  employer_id: string;
  payment_date: string;
  employee_name: string;
  amount: string;
  employer: employeeProps;
}
