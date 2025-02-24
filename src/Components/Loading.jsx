import React from 'react';
import logo from '../Assets/Images/logo2.png';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
            <div className="relative flex items-center justify-center">
                {/* Spinner SVG */}
                <svg
                    className="animate-spin h-24 w-24 text-red-500" // Tăng kích thước spinner
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                </svg>

                <img
                    src={logo}
                    alt="Logo"
                    className="absolute h-16 w-auto"
                />
            </div>
            <div className="mt-2 text-red-500 text-xl font-bold">
                Đang tải...
            </div>
        </div>
    );
};

export default Loading;
