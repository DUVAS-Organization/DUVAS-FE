import React, { useState } from "react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); // To store any error message

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // API URL
        const loginApiUrl = "http://localhost:5221/api/auth/login-google"; // Replace with your actual API URL

        // Create the payload to send to the API
        const payload = {
            email: email,
            password: password,
        };

        try {
            // Make the POST request to login
            const response = await fetch(loginApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Invalid email or password.");
            }

            // Extract the token from the response
            const data = await response.json();
            const token = data.token;

            if (token) {
                // Store the token in localStorage or any other secure storage
                localStorage.setItem("authToken", token);
                console.log("Logged in successfully!");
                // Redirect user to a new page or home
                window.location.href = "/dashboard"; // Replace with your desired route
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center my-5 bg-gray-100">
            <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-4xl">
                <div className="relative w-full md:w-1/2">
                    <img
                        src="https://batdongsan.com.vn/sellernet/static/media/cover.800e56db.png"
                        alt="Illustration"
                        className="w-full h-auto "
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

                <div className="p-6 w-full md:w-1/2">
                    <h3 className="text-base font-semibold text-gray-800">Xin chào bạn</h3>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Đăng nhập để tiếp tục
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-gray-700 text-sm font-bold mb-2"
                            >
                                SĐT chính hoặc email
                            </label>
                            <input
                                type="text"
                                id="email"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={email}
                                placeholder="SĐT chính hoặc email"
                                onChange={handleEmailChange}
                            />
                        </div>
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
                                placeholder="Mật khẩu"
                                onChange={handlePasswordChange}
                            />
                        </div>

                        {errorMessage && (
                            <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="mr-2 leading-tight"
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-sm text-gray-600"
                                >
                                    Nhớ tài khoản
                                </label>
                            </div>
                            <a
                                href="#"
                                className="text-sm text-red-500 hover:text-red-400 font-medium"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md w-full"
                        >
                            Đăng nhập
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <h3 className="text-gray-600">Hoặc</h3>

                        <button className="flex w-full items-center justify-center bg-white-500 border-2 text-black font-medium py-2 px-4 rounded-md mt-2">
                            <img
                                src="https://static-00.iconduck.com/assets.00/google-icon-256x256-67qgou6b.png"
                                alt="Google Logo"
                                className="mr-2 w-4 h-4 flex justify-end"
                            />
                            Đăng nhập với Google
                        </button>
                    </div>

                    <div className="text-center mt-4 text-sm">
                        <p>Bằng việc tiếp tục, bạn đồng ý với
                            <a href="#" className="text-red-500 hover:text-red-400"> Điều khoản sử dụng </a>
                            ,
                            <a href="#" className="text-red-500 hover:text-red-400">Chính sách bảo mật </a>
                            ,
                            <a href="#" className="text-red-500 hover:text-red-400">Quy chế </a>
                            ,
                            <a href="#" className="text-red-500 hover:text-red-400">Chính sách </a>
                            của chúng tôi.</p>
                    </div>

                    <div className="flex justify-center mt-20">
                        Chưa là thành viên?
                        <a href="/Registers" className="text-red-500 hover:text-red-400 font-semibold mx-1"> Đăng ký </a>
                        tại đây
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;