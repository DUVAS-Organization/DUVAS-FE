import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import SidebarUser from './SidebarUser';
import { useAuth } from '../../Context/AuthProvider';

const Layout = ({
    children,
    showFooter = true,
    showNavbar = true,
    showSidebar = true,
}) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    // Với non-admin + showNavbar => hiển thị Navbar, ẩn sidebarUser
    // Với non-admin + !showNavbar => hiển thị sidebarUser (nếu showSidebar = true)
    // Với admin + showSidebar => hiển thị sidebar admin
    // => Không bao giờ hiển thị cùng lúc hai sidebar
    const renderNavbar = !isAdmin && showNavbar;
    const renderSidebar = isAdmin
        ? (showSidebar && <Sidebar />)
        : (!renderNavbar && showSidebar && <SidebarUser />);

    return (
        <div className="bg-gray-100 flex flex-col" id="root">
            {renderNavbar && <Navbar />}

            <div className="flex flex-grow container">
                {renderSidebar && renderSidebar}
                <div className={`flex-1 ${renderSidebar ? 'ml-56' : ''}`}>
                    <main>{children}</main>
                </div>
            </div>

            {/* Footer: chỉ hiển thị nếu không phải admin (hoặc bạn có thể thay đổi logic) */}
            {/* {showFooter && !isAdmin && (
                <div className={`${renderSidebar ? 'ml-56' : 'ml-56'} mt-auto`}>
                    <Footer />
                </div>
            )} */}
        </div>
    );
};

export default Layout;
