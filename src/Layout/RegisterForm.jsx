import React, { useState } from "react";

const RegisterForm = () => {
    const [userName, setUserName] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [address, setAddress] = useState("");
    const [sex, setSex] = useState("male");
    const [otp, setOtp] = useState("");
    const [sentOtp, setSentOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [email, setEmail] = useState(""); // Trường nhập Gmail
    const [isEmailValid, setIsEmailValid] = useState(false); // Kiểm tra tính hợp lệ của email

    // Kiểm tra tính hợp lệ của email
    const handleEmailChange = (e) => {
        const emailInput = e.target.value;
        setEmail(emailInput);
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsEmailValid(emailPattern.test(emailInput));
    };
    const handleGoogleLogin = () => {
        const googleLoginApiUrl = "https://localhost:8000/api/Auth/google";
        window.location.href = googleLoginApiUrl; // Chuyển hướng đến API login bằng Google
    };
    const handleSendOtp = async () => {
        if (!isEmailValid) {
            setErrorMessage("Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const sendOtpApiUrl = "https://localhost:8000/api/Auth/verify";

        try {
            const response = await fetch(sendOtpApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emailOrPhone: email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Gửi OTP thất bại.");
                console.error("Error from server:", errorData);
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

        // Validate các trường
        if (userName.length < 3) {
            setErrorMessage("Tên người dùng phải có ít nhất 3 ký tự.");
            setLoading(false);
            return;
        }

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

        const registerApiUrl = "https://localhost:8000/api/Auth/register";

        const payload = {
            otp,
            userName,
            name,
            password,
            rePassword,
            address,
            sex,
            email, // Gửi email trong payload
        };

        try {
            const response = await fetch(registerApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Đăng ký thất bại.");
            }

            const data = await response.json();
            setSuccessMessage(data.message || "Đăng ký thành công!");
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
                <div className="relative w-full md:w-1/2">
                    <img
                        src="https://batdongsan.com.vn/sellernet/static/media/cover.800e56db.png"
                        alt="Illustration"
                        className="w-full h-auto"
                    />
                    <div className="absolute top-0 left-0 w-32 h-auto z-10">
                        <img
                            src="https://batdongsan.com.vn/sellernet/static/media/header-logo-sisu.4b76e0ce.svg"
                            alt="Logo"
                            className="w-full h-auto ml-8 mt-5"
                        />
                    </div>
                    <div className="hidden md:flex flex-col items-center justify-center">
                        <h2 className="text-center text-lg font-semibold my-2">
                            Tìm nhà đất dễ dàng
                        </h2>
                    </div>
                </div>

                {/* Cột bên phải */}
                <div className="p-6 w-full md:w-1/2">
                    {successMessage && (
                        <div className="text-green-500 mt-2">{successMessage}</div>
                    )}
                    <h3 className="text-base font-semibold text-gray-800">Xin chào bạn</h3>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Đăng ký tài khoản mới
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Các trường thông tin khác */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Địa chỉ Email: </label>
                            <input
                                type="email"
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEmailValid ? "border-red-500" : ""}`}
                                value={email}
                                onChange={handleEmailChange}
                                required
                            />

                            {!isEmailValid && email && (
                                <div className="text-red-500 text-xs mt-1">Email không hợp lệ</div>
                            )}

                        </div>

                        {!sentOtp ? (
                            <div>
                                <button
                                    type="button"
                                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md w-full"
                                    onClick={handleSendOtp}
                                    disabled={loading || !isEmailValid}
                                >
                                    {loading ? "Đang gửi OTP..." : "Gửi OTP"}
                                </button>
                                {/* Đăng nhập Google */}
                                <div className="text-center ">
                                    <h3 className="text-gray-600 my-5">Hoặc</h3>
                                    <button
                                        onClick={handleGoogleLogin}
                                        className="flex w-full items-center justify-center bg-white border-2 text-black font-medium py-2 px-4 rounded-md mt-2"
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
                                <div className="flex justify-center mt-20">
                                    Đã có tài khoản?
                                    <a href="/Logins" className="text-red-500 hover:text-red-400 font-semibold mx-1">
                                        Đăng nhập
                                    </a>
                                    tại đây
                                </div>
                            </div>

                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Nhập OTP: </label>
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="OTP"
                                        required

                                    />

                                </div>
                                {/* Thêm các trường nhập liệu còn lại */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">UserName: </label>
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="UserName"
                                        required
                                    />
                                    {userName.length < 3 && (
                                        <div className="text-red-500 text-sm mt-1">Tên người dùng phải có ít nhất 3 ký tự.</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Họ & Tên:</label>
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu: </label>
                                    <input
                                        type="password"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        required
                                    />
                                    {password && password.length < 8 && (
                                        <div className="text-red-500 text-sm mt-1">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và số.</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Xác nhận mật khẩu: </label>
                                    <input
                                        type="password"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={rePassword}
                                        onChange={(e) => setRePassword(e.target.value)}
                                        placeholder="Confirm Password"
                                        required
                                    />
                                    {rePassword && rePassword !== password && (
                                        <div className="text-red-500 text-sm mt-1">Xác nhận mật khẩu không khớp.</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Địa chỉ: </label>
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Address"
                                        required
                                    />
                                    {address.length < 1 && (
                                        <div className="text-red-500 text-sm mt-1">Địa chỉ không được để trống.</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Giới tính: </label>
                                    <select
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={sex}
                                        onChange={(e) => setSex(e.target.value)}
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md w-full"
                                    disabled={loading || !otp || !userName || !name || !password || !rePassword || !address}
                                >
                                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                                </button>
                            </>
                        )}
                    </form>

                    {errorMessage && (
                        <div className="text-red-500 mt-2">{errorMessage}</div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
