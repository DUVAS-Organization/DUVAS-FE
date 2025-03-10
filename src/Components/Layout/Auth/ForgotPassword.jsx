import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaKey, FaLock, FaLockOpen, FaArrowLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import logo from '../../../Assets/Images/logo1.png'
import image2 from '../../../Assets/Images/image2.png'

const ForgotPasswords = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [email, setEmail] = useState(""); // Trường nhập Gmail
    const [isEmailValid, setIsEmailValid] = useState(false); // Kiểm tra tính hợp lệ của email
    const [sentOtp, setSentOtp] = useState(false);

    // States cho việc hiển thị mật khẩu riêng biệt cho từng ô input
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);


    // Kiểm tra tính hợp lệ của email
    const handleEmailChange = (e) => {
        const emailInput = e.target.value;
        setEmail(emailInput);
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsEmailValid(emailPattern.test(emailInput));
    };

    const handleSendOtp = async () => {
        if (!isEmailValid) {
            setErrorMessage("Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        // Tạo liên kết gửi OTP với email đã nhập
        const forgotPasswordUrl = `https://localhost:8000/api/Auth/forgot-password?emailOrPhone=${email}`;

        try {
            const response = await fetch(forgotPasswordUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Gửi OTP thất bại.");
                return;
            }

            setSentOtp(true);
            setSuccessMessage("OTP đã được gửi!");
        } catch (error) {
            setErrorMessage("Lỗi kết nối: " + error.message);
            console.error("Connection error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và số.");
            setLoading(false);
            return;
        }

        if (password !== rePassword) {
            setErrorMessage("Xác nhận mật khẩu không khớp.");
            setLoading(false);
            return;
        }

        if (!otp) {
            setErrorMessage("OTP không được để trống khi người dùng đã gửi OTP.");
            setLoading(false);
            return;
        }

        const resetpasswordApiUrl = "https://localhost:8000/api/Auth/reset-password";

        const payload = {
            otp,
            password,
            rePassword,
            email,
        };

        try {
            const response = await fetch(resetpasswordApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Gửi OTP thất bại.");
                return;
            }
            setSentOtp(true);
            const data = await response.json();
            setSuccessMessage("OTP đã được gửi!");
            window.location.href = "/Logins";
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center my-5 bg-gray-100">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-4xl">
                {/* Cột bên trái */}
                <div className="relative w-full md:w-1/2 flex flex-col items-center justify-center">
                    <img src={image2} alt="Illustration" className="w-full h-full object-cover rounded-l-lg" />
                    <div className="absolute top-0 left-0 w-32 h-auto">
                        <img src={logo} alt="Logo" className="w-full h-auto ml-10 mt-2" />
                    </div>
                </div>


                {/* Cột bên phải */}
                <div className="p-6 w-full md:w-1/2">
                    {successMessage && (
                        <div className="text-green-500 my-2">{successMessage}</div>
                    )}

                    {errorMessage && (
                        <div className="text-red-500 my-2">{errorMessage}</div>
                    )}
                    <button onClick={() => navigate(-1)}>
                        <FaArrowLeft className="left-3 top-12 transform -translate-y-1/2 text-gray-500 text-xl cursor-pointer" />
                    </button>

                    <h3 className="text-base font-semibold text-gray-800">Quên mật khẩu?</h3>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Khôi phục tài khoản
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Trường email */}
                        <div className="mb-4 relative">
                            <FaEnvelope className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl" />
                            <input
                                type="email"
                                className={`shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEmailValid ? "border-red-500" : ""}`}
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Nhập email"
                                required
                            />
                            {!isEmailValid && email && (
                                <div className="text-red-500 text-xs mt-1">Email không hợp lệ</div>
                            )}
                        </div>

                        {!sentOtp ? (
                            <div>
                                <button
                                    type="submit"
                                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md w-full"
                                    onClick={handleSendOtp}
                                    disabled={loading || !isEmailValid}
                                >
                                    {loading ? "Đang gửi OTP..." : "Gửi OTP"}
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Trường OTP */}
                                <div className="mb-4 relative">
                                    <FaKey className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl" />
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="OTP"
                                        required
                                    />
                                </div>

                                {/* Trường mật khẩu */}
                                <div className="mb-4 relative">
                                    <FaLock className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mật khẩu"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-5 transform -translate-y-1/2 text-2xl"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {/* Trường xác nhận mật khẩu */}
                                <div className="mb-4 relative">
                                    <FaLockOpen className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl" />
                                    <input
                                        type={showRePassword ? "text" : "password"}
                                        className="shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={rePassword}
                                        onChange={(e) => setRePassword(e.target.value)}
                                        placeholder="Xác nhận mật khẩu"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-5 transform -translate-y-1/2 text-2xl"
                                        onClick={() => setShowRePassword(!showRePassword)}
                                    >
                                        {showRePassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    {rePassword && rePassword !== password && (
                                        <div className="text-red-500 text-sm mt-1">Xác nhận mật khẩu không khớp.</div>
                                    )}
                                    <ul className="my-2 list-disc pl-5">
                                        <li className="text-xs font-normal text-gray-500">Mật khẩu tối thiểu 8 ký tự</li>
                                        <li className="text-xs font-normal text-gray-500">Chứa ít nhất 1 ký tự viết hoa</li>
                                        <li className="text-xs font-normal text-gray-500">Chứa ít nhất 1 ký tự số</li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md w-full"
                                    disabled={loading || !otp || !password || !rePassword}
                                >
                                    {loading ? "Đang xử lý..." : "Hoàn tất"}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswords;
