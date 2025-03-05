import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (dropdown) => {
        setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
    };

    return (
        <UIContext.Provider value={{ openDropdown, toggleDropdown }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
