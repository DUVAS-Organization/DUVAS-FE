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
    const [qrCode, setQrCode] = useState(null);
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
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        // thanh cong
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
                                type="number"
                                id="amount"
                                name="amount"
                                min="1000"
                                step="1000"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />

                            <button type="submit"
                                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
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
}

export default Money;