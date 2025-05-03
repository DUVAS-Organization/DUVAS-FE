import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import CategoryServices from '../../Services/User/CategoryServices';

const ServiceDropdown = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [categoriesService, setCategoriesService] = useState([]);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "";

    // Kiểm tra nếu đường dẫn là /ServicePosts hoặc tab khớp với categoryServiceName
    const isActiveDropdown =
        location.pathname === "/ServicePosts" ||
        categoriesService.some((category) => category.categoryServiceName === tab);

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

    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
        >
            <NavLink
                to="/ServicePosts"
                className={`block mt-0.5 dark:text-white relative px-3 py-0.5 text-base font-medium text-gray-800 transition-all
                before:content-[''] before:absolute before:bottom-0 before:left-3 before:w-0 before:h-[2px]
                before:bg-red-500 before:transition-all before:duration-500 before:ease-in-out
                hover:before:w-[calc(100%-1.5rem)] cursor-pointer 
                ${isActiveDropdown ? "text-red-500 font-semibold before:w-[calc(100%-1.5rem)]" : ""}`}
            >
                Tin Dịch vụ
            </NavLink>

            {dropdownOpen && (
                <div className="absolute top-6 left-0 mt-2 w-48 bg-white shadow-md rounded-md z-50">
                    {categoriesService.map((category) => (
                        <NavLink
                            key={category.categoryServiceId}
                            to={`/ServicePosts?tab=${encodeURIComponent(category.categoryServiceName)}`}
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-gray-800 font-medium hover:bg-red-500 hover:text-white transition-colors"
                        >
                            {category.categoryServiceName}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceDropdown;