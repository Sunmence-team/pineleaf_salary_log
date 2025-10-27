import React from 'react';
import { assests } from '../../assets/assets';
import { NavLink } from 'react-router-dom';
import { MdAllInbox, MdArrowDownward, MdArrowOutward, MdArrowUpward, MdChat, MdFormatListBulletedAdd, MdOutlineAccountBalanceWallet, MdOutlineConnectWithoutContact, MdOutlineContactMail, MdOutlineDashboard, MdOutlineFileUpload, MdOutlineGroupWork, MdOutlineHome, MdOutlineLogout, MdOutlinePayments, MdOutlinePeopleAlt, MdVerified } from 'react-icons/md';
import { FaUsersCog } from 'react-icons/fa';
import { RiSecurePaymentLine } from 'react-icons/ri';

const LeftNav = ({ setIsOpen }: { setIsOpen:React.Dispatch<React.SetStateAction<boolean>> }) => {

    const navItems = [
        {
            name: 'Dashboard',
            icon: <MdOutlineDashboard size={20} />,
            path: '/overview',
        },
        {
            name: 'Add Employee',
            icon: <MdOutlinePeopleAlt size={20} />,
            path: '/addemployee',
        },
        {
            name: 'Manage Employees',
            icon: <FaUsersCog size={20} />,
            path: '/managemployees',
        },
        {
            name: 'Payments',
            icon: <RiSecurePaymentLine size={20} />,
            path: '/managepayments',
        },
        {
            name: 'Transactions',
            icon: <MdOutlineDashboard size={20} />,
            path: '/alltransactions',
        },
    ];

    return (
        <div className='bg-pryClr lg:w-full md:w-3/5 w-4/5 h-full px-6 py-4 md:pt-2 pt-8 flex flex-col'>
            <div className="flex items-center gap-2">
                <img src={assests.logo2} alt="Pineleafestates logo" className='lg:size-auto size-16' />
                <div className="flex flex-col text-white">
                    <h3 className='lg:text-4xl text-3xl font-semibold'>PINELEAF</h3>
                    <p className='text-2xl leading-2.5'>ESTATE</p>
                </div>
            </div>
            <ul className='lg:mt-5 mt-8 flex flex-col gap-3 h-4/5 overflow-y-scroll no-scrollbar border-b border-gray-100/50 pb-2'>
                {
                    navItems.map(({ name, icon, path }, index) => (
                        <NavLink
                            to={path}
                            key={index}
                            className={({ isActive }) => `
                                flex items-center gap-3 font-medium text-white transition-all duration-300 hover:bg-secClr hover:text-black! px-4 py-3 rounded-md cursor-pointer text-base
                                ${isActive ? 'bg-secClr text-black!' : ''}
                                ${name.toLowerCase() === "proofs" || name.toLowerCase() === "salary logs" ? "pointer-events-none line-through opacity-25" : null}
                            `}
                            onClick={() => setIsOpen(false)}
                        >
                            <span>{icon}</span>
                            <span>{name}</span>
                        </NavLink>
                    ))
                }
            </ul>
        </div>
    );
};

export default LeftNav;