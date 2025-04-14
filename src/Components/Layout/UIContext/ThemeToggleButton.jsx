import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggleButton = () => {
    const [isDark, setIsDark] = useState(() =>
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <button
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none "
            style={{
                background: isDark
                    ? 'linear-gradient(to right, #1e3a8a, #3b82f6)'
                    : 'linear-gradient(to right, #bfdbfe, #60a5fa)',
            }}
            aria-label="Toggle Theme"
        >
            <div
                className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out ${isDark ? 'translate-x-8' : 'translate-x-0'
                    }`}
                style={{
                    background: isDark
                        ? 'radial-gradient(circle at 70% 30%, #9ca3af 10%, #4b5563 70%)'
                        : 'radial-gradient(circle at 30% 30%, #facc15 10%, #f97316 70%)',
                }}
            >
                {isDark ? (
                    <FaMoon className="text-white text-sm" />
                ) : (
                    <FaSun className="text-white text-sm" />
                )}
            </div>
            {/* Hiệu ứng mây và sao */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <div
                    className={`w-4 h-4 ${isDark ? 'opacity-0' : 'opacity-100'
                        } transition-opacity duration-300`}
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\"%3E%3Cpath d=\"M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-2 9.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z\"/%3E%3C/svg%3E')",
                        backgroundSize: 'cover',
                    }}
                />
                <div
                    className={`w-4 h-4 ${isDark ? 'opacity-100' : 'opacity-0'
                        } transition-opacity duration-300`}
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\"%3E%3Cpath d=\"M12 2l1.5 4.5h4.5l-3 2.5 1.5 4.5-3-2.5-3 2.5 1.5-4.5-3-2.5h4.5zM8 8l-1 3-3-1 1-3 3 1zm8 0l1 3 3-1-1-3-3 1z\"/%3E%3C/svg%3E')",
                        backgroundSize: 'cover',
                    }}
                />
            </div>
        </button>
    );
};

export default ThemeToggleButton;