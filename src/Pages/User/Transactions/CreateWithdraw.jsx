import { useState, useEffect } from "react";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";
import { showCustomNotification } from "../../../Components/Notification";

const CreateWithdraw = () => {
    const [amount, setAmount] = useState("");
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBank, setSelectedBank] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBankAccounts = async () => {
            try {
                const response = await UserService.getBankAccounts();
                if (response.status === 200) {
                    
                    const activeBanks = response.data.filter(bank => bank.status === "Active");
                setBankAccounts(activeBanks);
                }
            } catch (error) {
                setError("Failed to fetch bank accounts.");
                showCustomNotification("error", "Có lỗi xảy ra!");
            }
        };
        fetchBankAccounts();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!amount || !selectedBank) {
            setError("Please enter an amount and select a bank.");
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await UserService.withdraw(amount, selectedBank);
            if (response.status === 200) {
                showCustomNotification("success", "Tạo đơn rút tiền thành công!");
                setAmount("");
                setSelectedBank("");
            } else {
                showCustomNotification("error", "Vui lòng kiểm tra lại đơn rút tiềntiền!");
            }
        } catch (err) {
            setError("An error occurred while processing your request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">Tạo đơn rút tiền</h1>

                    {/* Success & Error Messages */}
                    {message && <p className="text-green-600 bg-green-100 p-3 rounded">{message}</p>}
                    {error && <p className="text-red-600 bg-red-100 p-3 rounded">{error}</p>}

                    <form onSubmit={handleWithdraw} className="space-y-4">
                        {/* Amount Input */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">Số tiền cần rút:</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số tiền"
                                min="1000"
                                required
                            />
                        </div>

                        {/* Bank Account Dropdown */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">Chọn tài khoản ngân hàng:</label>
                            <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Chọn tài khoản</option>
                                {bankAccounts.length > 0 ? (
                                    bankAccounts.map((bank) => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.bankCode} - {bank.accountName} - {bank.accountNumber} 
                                        </option>
                                    ))
                                ) :
                                    (
                                        <option>
                                            No bank account
                                        </option>
                                    )}
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-200"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Rút tiền"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default CreateWithdraw;
