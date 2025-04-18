import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import { showCustomNotification } from "../../../Components/Notification";

const Money = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [amount, setAmount] = useState(10000);
    const [displayAmount, setDisplayAmount] = useState("10.000");
    const [qrCode, setQrCode] = useState(null);

    // Hàm định dạng số thành tiền Việt Nam
    const formatVND = (value) => {
        if (!value) return "";
        return Number(value).toLocaleString("vi-VN", { style: "decimal" });
    };

    // Xử lý khi người dùng thay đổi giá trị input
    const handleAmountChange = (e) => {
        // Lấy giá trị nhập vào và loại bỏ dấu phẩy
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        const numericValue = rawValue ? parseInt(rawValue, 10) : 0;

        // Cập nhật state
        setAmount(numericValue);
        setDisplayAmount(formatVND(numericValue));
    };

    const handleDeposit = async (event) => {
        event.preventDefault();
        let qrCode = (await UserService.deposit(amount)).data.qrCode;
        setQrCode(qrCode);
        let params = new URLSearchParams(new URL(qrCode).search);
        const addInfo = params.get("addInfo");
        let status = false;
        while (!status) {
            status = (await UserService.checkTransactionStatus(addInfo)).data.isPaid;
            console.log(status);
            if (!status) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        // Thanh toán thành công
        showCustomNotification("success", "Thanh toán thành công!");
    };

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Nạp tiền</h1>
                    <div className="flex">
                        <form className="w-1/3 bg-white p-6 rounded-lg shadow-md" onSubmit={handleDeposit}>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                Số tiền nạp
                            </label>
                            <input
                                type="text" // Đổi type thành text để hiển thị định dạng
                                id="amount"
                                name="amount"
                                min="1000"
                                step="1000"
                                required
                                value={displayAmount} // Sử dụng giá trị hiển thị
                                onChange={handleAmountChange} // Xử lý thay đổi
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Nhập số tiền (VND)"
                            />

                            <button
                                type="submit"
                                className="mt-4 w-full bg-red-500 hover:bg-red-400 text-white font-medium py-2 px-4 rounded-md"
                            >
                                Lấy mã thanh toán
                            </button>
                        </form>

                        <div className="w-2/3 flex items-center justify-center">
                            {qrCode ? (
                                <img src={qrCode} alt="QR Code" />
                            ) : (
                                <p className="text-gray-500">Mã QR sẽ hiển thị ở đây</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default Money;