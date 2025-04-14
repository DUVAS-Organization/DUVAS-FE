import React from "react";
import { FaTimes } from "react-icons/fa";

const DropdownFilter = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 w-full absolute top-full left-0 z-10 mt-1 dark:bg-gray-700 dark:text-white">
            <div className="flex justify-between items-center mb-4 ">
                <h2 className="text-lg text-gray-800 font-semibold dark:text-white">{title}</h2>
                <button className="text-gray-500 p-2 hover:text-red-500 text-lg dark:text-white" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>
            {children}
        </div>
    );
};

export default DropdownFilter;
