import React from 'react';
import { FaRegEye, FaRegEyeSlash, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const AccountSettings = ({
    profileData,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    newPasswordVisible,
    setNewPasswordVisible,
    rePasswordVisible,
    setRePasswordVisible,
    error,
    handleChangePassword,
    showLockForm,
    setShowLockForm,
    lockPasswordVisible,
    setLockPasswordVisible,
}) => {
    return (
        <div className="w-full p-6 bg-white shadow-md mt-10 dark:bg-gray-800 dark:text-white">
            <div>
                <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                        <label htmlFor="current-password" className="block text-gray-700 mb-2 dark:text-white">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl dark:text-white"
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
                        <label htmlFor="new-password" className="block text-gray-700 mb-2 dark:text-white">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={newPasswordVisible ? "text" : "password"}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            {error && <div className="text-red-500">{error}</div>}
                            <button
                                type="button"
                                className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl dark:text-white"
                                onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                            >
                                {newPasswordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirm-password" className="block text-gray-700 mb-2 dark:text-white">
                            Nhập lại mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={rePasswordVisible ? "text" : "password"}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl dark:text-white"
                                onClick={() => setRePasswordVisible(!rePasswordVisible)}
                            >
                                {rePasswordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
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
                <ul className="text-gray-500 text-sm mt-4 dark:text-white">
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

            <div className="mt-8">
                <div className="flex justify-between">
                    <h2
                        className="text-xl font-bold mb-4 cursor-pointer select-none"
                        onClick={() => setShowLockForm(!showLockForm)}
                    >
                        Yêu cầu khóa tài khoản
                    </h2>
                    {showLockForm ? (
                        <FaAngleUp className="text-2xl cursor-pointer" onClick={() => setShowLockForm(!showLockForm)} />
                    ) : (
                        <FaAngleDown className="text-2xl cursor-pointer" onClick={() => setShowLockForm(!showLockForm)} />
                    )}
                </div>
                {showLockForm && (
                    <form className="mb-4">
                        <label htmlFor="lock-reason" className="block font-medium text-gray-700 mb-2 dark:text-white">
                            Nhập mật khẩu hiện tại
                        </label>
                        <div className="mb-4 flex">
                            <div className="relative border-red-500 mr-5">
                                <input
                                    type={lockPasswordVisible ? "text" : "password"}
                                    className="w-80 px-4 py-2 border border-red-400 rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                                />
                                <button
                                    type="button"
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl mr-2 dark:text-white"
                                    onClick={() => setLockPasswordVisible(!lockPasswordVisible)}
                                >
                                    {lockPasswordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
                                </button>
                            </div>
                            <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">
                                Khóa tài khoản
                            </button>
                        </div>
                        <div>
                            <h1 className="font-medium">Lưu ý:</h1>
                            <ul className="list-disc ml-5 text-left text-sm text-gray-600 dark:text-white">
                                <li>Quý khách sẽ không thể đăng nhập lại vào tài khoản này sau khi khóa</li>
                                <li>Các tin đăng đang hiển thị của quý khách sẽ tiếp tục được hiển thị tới hết thời gian đăng tin đã chọn.</li>
                                <li>
                                    Số điện thoại chính đăng ký tài khoản này và các số điện thoại đăng tin của quý khách sẽ không thể được sử dụng lại để đăng ký
                                    tài khoản mới.
                                </li>
                                <li>Số dư tiền (nếu có) trong các tài khoản của quý khách sẽ không được hoàn lại.</li>
                            </ul>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AccountSettings;