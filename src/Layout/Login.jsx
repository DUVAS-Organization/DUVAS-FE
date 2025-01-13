import React, { useState } from "react";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUsernameChange = (event) => setUsername(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");

        const loginApiUrl = "https://localhost:8000/api/Auth/login";

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
                localStorage.setItem("authToken", token); // Lưu token vào localStorage
                console.log("Đăng nhập thành công!");
                window.location.href = "/Rooms"; // Chuyển hướng sang trang Rooms
            }
        } catch (error) {
            setErrorMessage(error.message); // Hiển thị thông báo lỗi
        } finally {
            setLoading(false);
        }
    };

    // Đăng nhập với Google
    const handleGoogleLogin = () => {
        const googleLoginApiUrl = "https://localhost:8000/api/Auth/google";

        // Điều hướng tới trang đăng nhập Google
        window.location.href = googleLoginApiUrl;
    };

    const handleGoogleLoginSuccess = async (response) => {
        const { credential } = response;
        const tokenExchangeApiUrl = `https://localhost:8000/api/Auth/token-exchange?code=${credential}`;

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
                localStorage.setItem("authToken", token); // Lưu token vào localStorage
                console.log("Đăng nhập Google thành công!");
                window.location.href = "/Rooms"; // Chuyển hướng sang trang Rooms
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập Google:", error);
            setErrorMessage("Đăng nhập Google thất bại.");
        }
    };

    const handleGoogleLoginFailure = (error) => {
        console.error("Lỗi khi đăng nhập Google:", error);
        setErrorMessage("Đăng nhập Google thất bại.");
    };

    return (
        <div className="flex items-center justify-center my-5 bg-gray-100">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-4xl">
                {/* Bên trái: Hình ảnh */}
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
                        <h2 className="text-center absolute text-lg font-semibold mt-4">
                            Tìm nhà đất dễ dàng
                        </h2>
                    </div>
                </div>

                {/* Bên phải: Form đăng nhập */}
                <div className="p-6 w-full md:w-1/2">
                    <h3 className="text-base font-semibold text-gray-800">Xin chào bạn</h3>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Đăng nhập để tiếp tục
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Tên đăng nhập */}
                        <div className="mb-4">
                            <label
                                htmlFor="username"
                                className="block text-gray-700 text-sm font-bold mb-2"
                            >
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={username}
                                placeholder="Nhập tên đăng nhập hoặc email"
                                onChange={handleUsernameChange}
                                required
                            />
                        </div>

                        {/* Mật khẩu */}
                        <div className="mb-6">
                            <label
                                htmlFor="password"
                                className="block text-gray-700 text-sm font-bold mb-2"
                            >
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={password}
                                placeholder="Nhập mật khẩu"
                                onChange={handlePasswordChange}
                                required
                            />
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
                        Chưa là thành viên?
                        <a href="/Registers" className="text-red-500 hover:text-red-400 font-semibold mx-1">
                            Đăng ký
                        </a>
                        tại đây
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
