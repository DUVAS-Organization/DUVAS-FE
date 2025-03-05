// FAQItem.jsx
import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { motion } from "framer-motion";

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className=" px-4 py-2 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left focus:outline-none"
            >
                <span className="text-base font-medium text-gray-800">{question}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isOpen ? <FaMinus className="text-red-500" /> : <FaPlus className="text-red-500" />}
                </motion.span>
            </button>

            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="mt-2 text-gray-600">{answer}</div>
            </motion.div>
        </div>
    );
};

export default FAQItem;
