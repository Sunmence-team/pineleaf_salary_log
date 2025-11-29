# Pineleaf Employee Payroll System

The Pineleaf Employee Payroll System is a robust web application designed to streamline employee management and payroll processing for Pineleaf Estates. Built with React and TypeScript, it provides a secure and intuitive interface for managing employee data, processing salaries, and tracking transactions efficiently. 💼✨

## Features

*   **Employee Lifecycle Management**: Seamlessly add new employees, view their comprehensive details, update existing information, and remove records as needed.
*   **Intuitive Dashboard Overview**: Gain quick insights into key payroll metrics, including total employees, total salary paid, number of completed payments, and total estimated monthly salary.
*   **Streamlined Payroll Processing**: Efficiently manage and initiate bulk salary payments for all included employees, with an option to include or exclude individual employees from the current payroll cycle.
*   **Secure Payment Verification**: Utilize a 6-digit verification code for secure bulk payment initialization, ensuring authorized transactions.
*   **Comprehensive Transaction History**: Access a detailed log of all payment transactions, with filtering capabilities by month and the option to export transaction data to CSV format.
*   **Bank Account Resolution**: Integrate with Paystack to automatically verify bank account names during employee onboarding and updates, reducing errors.
*   **Dynamic Pagination**: Navigate through large datasets of employees and transactions with efficient pagination controls.
*   **Responsive User Interface**: Enjoy a consistent and user-friendly experience across various devices, from desktops to mobile phones.
*   **Modern Form Handling**: Implement robust form validation and submission with Formik and Yup for a smooth user experience.
*   **Context-Based State Management**: Manage user authentication and global application state effectively using React Context API.

## Technologies Used

| Technology         | Category     | Description                                                          |
| :----------------- | :----------- | :------------------------------------------------------------------- |
| **React**          | Frontend     | A JavaScript library for building user interfaces.                   |
| **TypeScript**     | Language     | JavaScript with syntax for types.                                    |
| **Vite**           | Build Tool   | Fast development server and build tool for modern web projects.      |
| **Tailwind CSS**   | Styling      | A utility-first CSS framework for rapidly building custom designs.   |
| **Axios**          | API Client   | Promise-based HTTP client for making API requests.                   |
| **Formik**         | Form Library | Helps with building forms in React, handling state and validation.   |
| **Yup**            | Validation   | Schema builder for value parsing and validation.                     |
| **Framer Motion**  | Animation    | A production-ready motion library for React.                         |
| **Sonner**         | UI Feedback  | An accessible and customizable toast library for React.              |
| **React Router DOM** | Routing      | Declarative routing for React applications.                          |
| **Paystack**       | Payment API  | Payment gateway integration for bank account resolution.             |

## Usage

This application provides a comprehensive suite of features for managing employee payroll. Below are detailed instructions on how to use its core functionalities.

### Environment Variables

Before running the application, ensure you have the following environment variables configured. Create a `.env` file in the project root and add them:

```
VITE_API_BASE_URL="[YOUR_BACKEND_API_URL]"
VITE_PAYSTACK_SECRET_KEY="[YOUR_PAYSTACK_SECRET_KEY]"
```

*   `VITE_API_BASE_URL`: The base URL of your backend API.
*   `VITE_PAYSTACK_SECRET_KEY`: Your Paystack secret key for bank account verification.

### Logging In

1.  Navigate to the application's login page (typically the root URL `/`).
2.  Enter your `Username` and `Password` in the respective fields.
3.  Click the "Log in" button.
4.  Upon successful authentication, you will be redirected to the Dashboard.

### Dashboard Overview

*   After logging in, the Dashboard `/overview` provides a snapshot of your payroll system.
*   View key metrics such as `Total Employees`, `Total Salary Paid`, `No of completed payments`, and `Total Estimated Salary`.
*   The "Recent Transactions" section displays the latest payment activities. Click "View All" to navigate to the full transactions page.

### Adding a New Employee

1.  From the navigation menu, select "Add Employee" (path `/addemployee`).
2.  Fill in the required fields under "Personal Information", "Job Details", and "Payment Details".
    *   **Personal Information**: Includes first name, last name, email, phone number, gender, date of birth, country, state, and address.
    *   **Job Details**: Includes job title, department, company branch, employment type, and employment date.
    *   **Payment Details**: Select the `Bank Name` from the dropdown. Enter the `Account Number` (it should be 10 digits). The `Account Name` will automatically resolve and populate if the details are valid. Enter the `Estimate Pay` for the employee.
3.  Click "Add Employee" to save the new employee's details. A success toast will confirm the addition.

### Managing Employees

1.  Navigate to the "Manage Employees" page (path `/managemployees`).
2.  Here, you'll see a paginated list of all registered employees.
3.  **Search & Filter**: Use the "Search employees..." input to filter the list by employee name. Use the dropdown to filter employees by their `Employment Type` (Remote, On-site, Hybrid, or All).
4.  **Actions**: For each employee, you can:
    *   **View Details**: Click the `MdRemoveRedEye` icon to open a modal displaying the employee's full profile.
    *   **Edit Details**: Click the `MdModeEditOutline` icon to open a modal with editable fields for the employee. Make your changes and click "Update Details".
    *   **Delete Employee**: Click the `MdDelete` icon to prompt a confirmation dialog. Confirm to permanently remove the employee record.

### Managing Payments (Payroll)

1.  Go to the "Payments" page (path `/managepayments`).
2.  This page lists all employees and their payment status.
3.  **Include/Exclude from Payroll**: For each employee, click the `RiUserAddLine` (to include) or `RiUserMinusLine` (to exclude) icon. A confirmation dialog will appear. Confirm your action to toggle the employee's `paying` status.
    *   An employee with a `paying` status of 1 is included in the next bulk payroll run, while 0 means they are excluded.
4.  **Initiate Bulk Payment**: Click the "Pay Staff" button at the top right.
    *   A confirmation dialog will appear. Confirm to proceed.
    *   You will then be prompted to enter a 6-digit verification code from your authenticator app for security.
    *   Upon successful verification, the payment process will be initialized for all employees currently included in the payroll.

### Viewing All Transactions

1.  Access the "Transactions" page (path `/alltransactions`).
2.  This page displays a chronological list of all group transactions (monthly payroll runs).
3.  **Filter by Month**: Use the "Filter by month" dropdown to view transactions for a specific month and year.
4.  **View Individual Transactions**: For each monthly transaction group, click "View transaction" to expand and see a table of individual payments made to each employee for that month.
5.  **Export Data**: Click "Export as CSV" to download the individual transaction data for a specific month as a CSV file.

## Author Info

Connect with the author for more projects and collaborations!

*   LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourusername)
*   Twitter: [@yourtwitterhandle](https://twitter.com/yourtwitterhandle)
*   Portfolio: [Your Portfolio Website](https://oluwamayokun.vercel.app)

---

[![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/axios-671DD7?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Sonner](https://img.shields.io/badge/Sonner-000000?style=for-the-badge&logo=sonner&logoColor=white)](https://sonner.emilkowalski.it/)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/en/main)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)