import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../Context/AuthProvider';

const Layout = ({ children }) => {
    const { user } = useAuth();

    // Kiểm tra xem user có phải là admin không
    const isAdmin = user?.role === 'Admin';

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Navbar chỉ hiển thị khi không phải admin */}
            {!isAdmin && <Navbar />}

            <div className="flex flex-grow">
                {/* Hiển thị Sidebar khi là admin */}
                {isAdmin && <Sidebar />}

                {/* Nội dung chính */}
                <div className={`flex-1 ${isAdmin ? 'ml-56' : ''}`}>
                    <main>{children}</main>
                </div>
            </div>

            <div className={`${isAdmin ? 'ml-56' : ''} mt-auto`}>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
