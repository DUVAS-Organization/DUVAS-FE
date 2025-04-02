import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaKey, FaLock, FaLockOpen } from "react-icons/fa";
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthProvider';
import logo from '../../../Assets/Images/logo1.png'
import image2 from '../../../Assets/Images/image2.png'
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();

    const handleUsernameChange = (event) => setUsername(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");

        const loginApiUrl = "https://apiduvas1.runasp.net/api/Auth/login";

        const payload = {
            username: username.trim(),
            password: password.trim(),
        };

        try {
            const response = await fetch(loginApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error("Sai Tên đăng nhập hoặc Mật khẩu.");
            }

            const data = await response.json();
            const token = data.message; // Lấy token từ message

            if (token) {
                localStorage.setItem("authToken", token);
                // Giải mã token để kiểm tra role
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                // Điều hướng dựa trên role của user
                if (userRole === 'Admin') {
                    window.location.href = "/Admin/Accounts"; // Điều hướng đến trang Admin
                } else {
                    window.location.href = "/"; // Điều hướng đến trang dành cho User
                }
            }
        } catch (error) {
            setErrorMessage(error.message); // Hiển thị thông báo lỗi
        } finally {
            setLoading(false);
        }
    };

    // Đăng nhập với Google
    const handleGoogleLogin = () => {
        const googleLoginApiUrl = "https://apiduvas1.runasp.net/api/Auth/google";
        // Điều hướng tới trang đăng nhập Google
        window.location.href = googleLoginApiUrl;
    };

    // Xử lý luồng sau khi login Google thành công
    const handleGoogleCallback = async (token) => {
        const tokenExchangeApiUrl = `https://apiduvas1.runasp.net/api/Auth/token-exchange?token=${token}`;

        try {
            const res = await fetch(tokenExchangeApiUrl, {
                method: "GET",
            });

            if (!res.ok) {
                throw new Error("Lỗi khi đổi token từ Google.");
            }

            const data = await res.json();
            const token = data.access_token; // Lấy token từ response

            if (token) {
                login(token)
                // localStorage.setItem("authToken", token);
                // window.location.href = "/"; // Chuyển hướn   g sang trang Rooms
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập Google:", error);
            setErrorMessage("Đăng nhập Google thất bại.");
        }
    };

    // Hook để kiểm tra URL sau khi Google callback
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get("token"); // Lấy mã token từ URL
        if (token) {
            handleGoogleCallback(token); // Thực hiện đổi token
        }
    }, []);

    return (
        <div className="flex items-center justify-center my-5 bg-gray-100">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-4xl">
                {/* Bên trái: Hình ảnh */}
                <div className="relative w-full md:w-1/2 flex flex-col items-center justify-center">
                    <img src={image2} alt="Illustration" className="w-full h-full object-cover rounded-l-lg" />
                    <div className="absolute top-0 left-0 w-32 h-auto">
                        <img src={logo} alt="Logo" className="w-full h-auto ml-8 mt-2" />
                    </div>
                </div>

                {/* Bên phải: Form đăng nhập */}
                <div className="p-6 w-full md:w-1/2">
                    <h3 className="text-base font-semibold text-gray-800">Xin chào bạn</h3>
                    <div className="mb-2">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Đăng nhập để tiếp tục
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
                        {/* Tên đăng nhập */}
                        <div className="mb-4 relative">
                            <FaEnvelope className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl" />
                            <input
                                type="text"
                                id="username"
                                className={`shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                                value={username}
                                placeholder="Nhập tên đăng nhập hoặc email"
                                onChange={handleUsernameChange}
                                required
                            />
                        </div>

                        {/* Mật khẩu */}
                        <div className="mb-2 relative">
                            <FaLock className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={password}
                                placeholder="Nhập mật khẩu"
                                onChange={handlePasswordChange}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-2xl"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="flex justify-end items-center mb-2">
                            <div>
                                <Link to="/forgot-password" className="text-red-500 hover:text-red-400">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </div>

                        {/* Thông báo lỗi */}
                        {errorMessage && (
                            <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
                        )}

                        {/* Nút đăng nhập */}
                        <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md w-full"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đăng Nhập"}
                        </button>
                    </form>

                    {/* Đăng nhập Google */}
                    <div className="text-center mt-4">
                        <h3 className="text-gray-600">Hoặc</h3>
                        <button
                            onClick={handleGoogleLogin}
                            className="flex w-full items-center justify-center bg-white border-2
                             text-black font-medium py-2 px-4 rounded-md mt-2 hover:bg-gray-100"
                        >
                            <img
                                src="https://static-00.iconduck.com/assets.00/google-icon-256x256-67qgou6b.png"
                                alt="Google Logo"
                                className="mr-2 w-4 h-4"
                            />
                            Đăng nhập với Google
                        </button>
                    </div>

                    {/* Link đăng ký */}
                    <div className="flex justify-center mt-32">
                        Chưa là thành viên?
                        <Link to="/Registers" className="text-red-500 hover:text-red-400 font-semibold mx-1">
                            Đăng ký
                        </Link>
                        tại đây
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
