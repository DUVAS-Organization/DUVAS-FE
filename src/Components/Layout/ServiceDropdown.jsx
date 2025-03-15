import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import CategoryServices from '../../Services/User/CategoryServices';

const ServiceDropdown = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [categoriesService, setCategoriesService] = useState([]);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoryData = await CategoryServices.getCategoryServices();
                setCategoriesService(categoryData);
            } catch (error) {
                console.error('Error fetching service categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleServiceSelect = (categoryName) => {
        setDropdownOpen(false);
        navigate(`/ServicePosts?tab=${encodeURIComponent(categoryName)}`);
    };

    // Kiểm tra xem đường dẫn hiện tại có phải là `/ServicePosts`
    const isActive = location.pathname.startsWith("/ServicePosts");

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`relative px-3 py-1 text-base font-medium text-gray-800 transition-all
                before:content-[''] before:absolute before:bottom-0 before:left-3 before:w-0 before:h-[2px]
                before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out
                hover:before:w-[calc(100%-1.5rem)] cursor-pointer 
                ${isActive ? 'before:w-[calc(100%-1.5rem)] text-red-500 font-semibold' : ''}`}
            >
                Tin Dịch vụ
            </button>
            {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                    {categoriesService.map((category) => (
                        <NavLink
                            key={category.categoryServiceId}
                            to={`/ServicePosts?tab=${encodeURIComponent(category.categoryServiceName)}`}
                            onClick={() => handleServiceSelect(category.categoryServiceName)}
                            className="flex items-center px-4 py-2 font-medium text-gray-800 hover:bg-red-500 hover:text-white"
                        >
                            <span>{category.categoryServiceName}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceDropdown;
