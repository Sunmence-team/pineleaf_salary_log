import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import axios from 'axios';
import { toast } from 'sonner';
import { assests } from '../../assets/assets';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const username = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .required('Username is required'),
            password: Yup.string()
                .required('Password is required')
                .min(6, 'Password must be at least 6 characters')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try{
                const response = await axios.post(`${API_URL}/api/realtor/username`, values, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                console.log("response", response)

                if (response.status === 200) {
                    
                }
            } catch (err: any) {
                console.error('Error during logging in:', err);
                if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
                    toast.error(err.response.data.message || 'Validation error. Please check your inputs.');
                } else if (axios.isAxiosError(err) && err.response && err.response.status === 403) {
                    toast.error(err.response.data.message || 'Error: One time payment not made yet');
                    setTimeout(() => {
                        toast.error('Redirecting to payment page...');
                        setTimeout(() => {
                            window.location.href = err.response?.data.authorization_url
                        }, 1000)
                    }, 2500)
                } else {
                    toast.error('An unexpected error occurred while logging in. ' + err.message);
                    console.error('Error during logging in:', err);
                }
            } finally {
                setSubmitting(false);
            }
        }
    })

    return (
        <div className='bg-secClr min-h-screen flex items-center justify-center'>
            <div className="mx-auto bg-white rounded-lg shadow-md md:p-8 p-10 relative min-w-xl" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <img src={assests.logo2} alt="Pineleaf Estates Logo" className='object-cover mx-auto w-[100px]' />
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pryClr"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-700 mb-2">Password </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pryClr"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!formik.isValid || formik.isSubmitting}
                        className="w-full py-3 bg-[#2F5318] text-white font-medium rounded-md hover:bg-[#254015] transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {
                            formik.isSubmitting ? 'Logging in...' : 'username'
                        }
                    </button>
                </form>
            </div>
        </div>
    )
}

export default username