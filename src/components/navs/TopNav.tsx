import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { MdKeyboardArrowDown, MdOutlineLogout } from 'react-icons/md';
import { FaRegBell } from 'react-icons/fa6';

const TopNav = ({ pageName } : { pageName:string }) => {
    const { logout } = useUser();
    // const displayName = user?.fullName.split(" ")[0];
    const location = useLocation();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLButtonElement | null>(null); // Ref to the dropdown container

  
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [location.pathname]);


    const handleToggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div className="w-full flex gap-3 items-center justify-between">
            <h3 className='lg:text-[26px] line-clamp-1 md:text-[20px] text-lg font-semibold'>{pageName}</h3>
            <div className="flex items-center md:gap-6 gap-4">
                <button
                    type='button'
                >
                    <FaRegBell size={24} className="text-pryClr" />
                </button>
                <button
                    type='button'
                    className="relative flex items-center md:gap-2 gap-1 cursor-pointer"
                    onClick={handleToggleDropdown}
                    ref={dropdownRef}
                >
                    <div className='w-9 h-9 rounded-full border border-pryClr bg-white flex items-center justify-center overflow-hidden'>
                        <h3 className='font-bold'>{"HR"?.split("")[0]}</h3>
                    </div>
                    <div className='flex items-center'>
                        <h3 className=''>{"HR"}</h3>
                        <MdKeyboardArrowDown size={18} className={`rotate-0 transition-all duration-200 ${isDropdownOpen && "rotate-180"}`} />
                    </div>

                    {
                        isDropdownOpen && (
                            <div className="absolute right-0 top-[45px] bg-white min-w-full rounded-md drop-shadow-2xl z-12">
                                <ul className="text-center text-xs">
                                    {/* <Link
                                        to={"/admin/activities"}
                                        className="p-2 border-b border-gray-100 hover:bg-gray-100/50 flex items-center justify-center gap-2"
                                    >
                                        <BsActivity size={18} />
                                        <span>Activities</span>
                                    </Link> */}
                                    <li
                                        className="p-2 border-b border-gray-100 hover:bg-gray-100/50 flex items-center justify-center gap-2 w-full"
                                        onClick={() => {
                                            logout();
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <MdOutlineLogout size={18} />
                                        <span>Logout</span>
                                    </li>
                                </ul>
                            </div>
                        )
                    }
                </button>
            </div>
        </div>
    );
}

export default TopNav;