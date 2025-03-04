import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTimes, FaRegEyeSlash, FaAngleDown, FaAngleUp, FaRegEye, FaWallet, FaCopy } from "react-icons/fa";
import Layout from "../../Components/Layout/Layout";
import { NavLink } from "react-router-dom";
import Footer from "../../Components/Layout/Footer";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("edit");
    const [showLockForm, setShowLockForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rePassword, setRePassword] = useState(false);
    const [newPassword, setNewPassword] = useState(false);
    const [lockPassword, setLockPassword] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleLockForm = () => {
        setShowLockForm((prev) => !prev);
    };

    const toggleDeleteForm = () => {
        setShowDeleteForm((prev) => !prev);
    };

    const handleTabClick = (tab) => {
        navigate(`/Profile?tab=${tab}`);
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        } else {
            // Nếu không có query nào, mặc định là "edit"
            setActiveTab("edit");
        }
    }, [location]);
    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Quản lý tài khoản</h1>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-4">
                        <ul className="flex space-x-4">
                            <li
                                className={`pb-2 cursor-pointer ${activeTab === "edit"
                                    ? "border-b-2 border-red-500 text-red-500"
                                    : "text-black"
                                    }`}
                                onClick={() => handleTabClick("edit")}
                            >
                                Chỉnh sửa thông tin
                            </li>
                            <li
                                className={`pb-2 cursor-pointer ${activeTab === "settings"
                                    ? "border-b-2 border-red-500 text-red-500"
                                    : "text-black"
                                    }`}
                                onClick={() => handleTabClick("settings")}
                            >
                                Cài đặt tài khoản
                            </li>
                            <li
                                className={`pb-2 cursor-pointer ${activeTab === "registerLandlord"
                                    ? "border-b-2 border-red-500 text-red-500"
                                    : "text-black"
                                    }`}
                                onClick={() => handleTabClick("registerLandlord")}
                            >
                                Đăng ký thành chủ
                            </li>
                        </ul>
                    </div>

                    {/* Nội dung thay đổi theo tab */}
                    {activeTab === "edit" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                            <div className="flex justify-center mb-4">
                                <div className="relative ">
                                    <div className="relative">
                                        <img
                                            alt="User avatar"
                                            className="w-40 h-40 rounded-full my-2"
                                            src="https://storage.googleapis.com/a1aa/image/ifEIHir6eNEDRFUL7MyRLPpTARVTEOOpgRJldSnDj4Y.jpg"
                                        />
                                        <button className="absolute top-1 right-3 bg-white text-red-500 rounded-full p-1 shadow">
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white px-4 py-2 rounded-lg shadow-md w-64 ml-10">
                                    <h1 className="font-bold text-3xl mb-1">Đặng Hữu Tú</h1>
                                    <h2 className="text-lg font-semibold ">Số dư tài khoản</h2>
                                    <div className="flex justify-between mb-2">
                                        <span>TK Chính</span>
                                        <span>0</span>
                                    </div>
                                    <div className="flex justify-between mb-4">
                                        <span>TK Khuyến mãi</span>
                                        <span>0</span>
                                    </div>
                                    <Link
                                        to="/Moneys"
                                        className="w-full bg-white text-red-500 py-1 rounded-lg
                                     flex items-center justify-center border border-red-400
                                      hover:bg-red-500 hover:text-white">
                                        <FaWallet className="mr-2" />
                                        Nạp tiền
                                    </Link>
                                </div>
                            </div>



                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-gray-800 font-normal">Email</label>
                                    <input
                                        className="w-full border border-gray-300 rounded p-2 mt-1"
                                        placeholder="example@gmail.com"
                                        type="text"
                                    />
                                    <label className="text-gray-800 font-normal mt-2">Số điện thoại</label>
                                    <input
                                        className="w-full border border-gray-300 rounded p-2 mt-1"
                                        placeholder="0987654321"
                                        type="text"
                                    />
                                </div>

                                <div>
                                    <label className="text-gray-800 font-normal">Địa chỉ</label>
                                    <input
                                        className="w-full border border-gray-300 rounded p-2 mt-1"
                                        placeholder="Hòa Hải, Đà Nẵng"
                                        type="text"
                                    />
                                    <label className="text-gray-800 font-normal mt-2">Giới tính</label>
                                    <select className="w-full border border-gray-300 rounded p-2 mt-1">
                                        <option value="" disabled>Chọn giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="text-right">
                                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="w-full">
                            <div className="w-full p-6 bg-white shadow-md mt-10">
                                {/* Đổi mật khẩu */}
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
                                    <form>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="current-password"
                                                className="block text-gray-700 mb-2"
                                            >
                                                Mật khẩu hiện tại
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                                </button>
                                            </div>
                                            <NavLink
                                                to="/forgot-password"
                                                className="text-red-500 text-sm mt-2 font-semibold inline-block"
                                            >
                                                Bạn quên mật khẩu?
                                            </NavLink>
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="new-password"

                                                className="block text-gray-700 mb-2"
                                            >
                                                Mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={newPassword ? "text" : "password"}
                                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl"
                                                    onClick={() => setNewPassword(!newPassword)}
                                                >
                                                    {newPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="confirm-password"
                                                className="block text-gray-700 mb-2"
                                            >
                                                Nhập lại mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={rePassword ? "text" : "password"}
                                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl"
                                                    onClick={() => setRePassword(!rePassword)}
                                                >
                                                    {rePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </form>
                                    <ul className="text-gray-500 text-sm mt-4">
                                        <li className="flex items-center">
                                            <span className="mr-2">•</span> Mật khẩu tối thiểu 8 ký tự
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2">•</span> Chứa ít nhất 1 ký tự viết hoa
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2">•</span> Chứa ít nhất 1 ký tự số
                                        </li>
                                    </ul>
                                </div>

                                {/* Yêu cầu khóa & xóa tài khoản */}
                                <div className="mt-8">
                                    <div className="flex justify-between">
                                        <h2
                                            className="text-xl font-bold mb-4 cursor-pointer select-none"
                                            onClick={toggleLockForm}
                                        >
                                            Yêu cầu khóa tài khoản
                                        </h2>

                                        {showLockForm ? (
                                            <FaAngleUp className="text-2xl cursor-pointer" onClick={toggleLockForm} />
                                        ) : (
                                            <FaAngleDown className="text-2xl cursor-pointer" onClick={toggleLockForm} />
                                        )}
                                    </div>
                                    {showLockForm && (
                                        <form className="mb-4">
                                            <label
                                                htmlFor="lock-reason"
                                                className="block font-medium text-gray-700 mb-2"
                                            >
                                                Nhập mật khẩu hiện tại
                                            </label>
                                            <div className="mb-4 flex">
                                                <div className="relative border-red-500 mr-5">
                                                    <input
                                                        type={lockPassword ? "text" : "password"}
                                                        className=" w-80 px-4 py-2 border border-red-400 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-0 top-1/2 transform -translate-y-1/2
                                                         text-gray-500 text-xl mr-2"
                                                        onClick={() => setLockPassword(!lockPassword)}
                                                    >
                                                        {lockPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                                    </button>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                                >
                                                    Khóa tài khoản
                                                </button>
                                            </div>
                                            <div>
                                                <h1 className="font-medium">Lưu ý:</h1>
                                                <ul className="list-disc ml-5 text-left text-sm text-gray-600">
                                                    <li>Quý khách sẽ không thể đăng nhập lại vào tài khoản này sau khi khóa</li>
                                                    <li>Các tin đăng đang hiển thị của quý khách sẽ tiếp tục được hiển thị tới hết thời gian đăng tin đã chọn.</li>
                                                    <li>Số điện thoại chính đăng ký tài khoản này và các số điện thoại đăng tin của quý khách sẽ không thể được sử dụng lại để đăng ký tài khoản mới.</li>
                                                    <li>Số dư tiền (nếu có) trong các tài khoản của quý khách sẽ không được hoàn lại.</li>
                                                </ul>
                                            </div>
                                        </form>
                                    )}

                                    <div className="flex justify-between">
                                        <h2
                                            className="text-xl font-bold mb-4 cursor-pointer select-none"
                                            onClick={toggleDeleteForm}
                                        >
                                            Yêu cầu xóa tài khoản
                                        </h2>
                                        {showDeleteForm ? (
                                            <FaAngleUp className="text-2xl cursor-pointer" onClick={toggleDeleteForm} />
                                        ) : (
                                            <FaAngleDown className="text-2xl cursor-pointer" onClick={toggleDeleteForm} />
                                        )}
                                    </div>
                                    {showDeleteForm && (
                                        <form className="mb-4">
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="delete-reason"
                                                    className="block text-gray-700 mb-2"
                                                >
                                                    Gửi yêu cầu xoá toàn bộ thông tin của tài khoản. Sau khi được xử lý, toàn bộ thông tin sẽ được xoá và không thể hoàn tác.
                                                </label>
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-white text-red-500 font-medium border border-red-500 px-4 py-2 rounded"
                                            >
                                                Yêu cầu xóa tài khoản
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "registerLandlord" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Đăng ký thành chủ</h2>
                            <p className="text-gray-600">
                                Nội dung phần đăng ký thành chủ...
                            </p>
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </Layout>
    );
};

export default Profile;
