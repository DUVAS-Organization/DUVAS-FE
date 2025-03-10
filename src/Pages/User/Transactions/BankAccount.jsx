import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../Components/Layout/Layout";
import Footer from "../../../Components/Layout/Footer";
import UserService from "../../../Services/User/UserService";

const BankAccount = () => {
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [bankCodes, setBankCodes] = useState([]);
    const [selectedBankCode, setSelectedBankCode] = useState('0');
    const [isEnteringOtp, setIsEnteringOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [userBankAccounts, setUserBankAccounts] = useState([]);
    const [changingBankAccount, setChangingBankAccount] = useState(null); // Track account being activated

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bankAccounts = await UserService.getBankAccounts();
                if (!bankAccounts.data.message) {
                    setUserBankAccounts(bankAccounts.data);
                }
                const response = await UserService.getBankCodes();
                setBankCodes(response.data.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleAddBank = async () => {
        let data = { accountNumber, accountName , bankCode: selectedBankCode };
        let resp = await UserService.addNewBank(data, otp);
        setUserBankAccounts(prev => [...prev, resp.data]);
        setIsEnteringOtp(false);
    };

    const genOtp = async () => {
        let exists = userBankAccounts.some(acc => acc.accountNumber === accountNumber);
        if (!exists) {
            UserService.genOtp();
            setIsEnteringOtp(true);
        } else {
            alert("Số tài khoản đã được thêm.");
        }
    };

    const handleChangeStatus = async (accountId, currentStatus) => {
        if (currentStatus === "Active") {
            // Directly deactivate
            await UserService.updateBankAccountStatus(accountId, false);
            setUserBankAccounts(prev =>
                prev.map(acc => acc.id === accountId ? { ...acc, status: "Inactive" } : acc)
            );
        } else {
            // Activate → Require OTP
            setChangingBankAccount(accountId);
            UserService.genOtp();
            setIsEnteringOtp(true);
        }
    };

    const handleActivateBankAccount = async () => {
        if (!changingBankAccount) return;

        try {
            await UserService.updateBankAccountStatus(changingBankAccount, true, otp);
            setUserBankAccounts(prev =>
                prev.map(acc => acc.id === changingBankAccount ? { ...acc, status: "Active" } : acc)
            );
            setChangingBankAccount(null);
            setIsEnteringOtp(false);
        } catch (error) {
            console.error("Error activating account:", error);
        }
    };

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">
                        Quản lý tài khoản rút tiền của bạn
                    </h1>

                    <div className="flex">
                        {!isEnteringOtp ? (
                            <div className="w-1/3 bg-white p-6 rounded-lg shadow-md
                            ">
                            <h1 className="font-bold mb-1 text-center">Tạo tài khoản ngân hàng</h1>
                            <form className="">
                                <label className="block text-sm font-medium text-gray-700">Nhập số tài khoản</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                />

                                <label className="block text-sm font-medium text-gray-700">Nhập tên chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                />

                                <label className="block text-sm font-medium text-gray-700">Chọn ngân hàng</label>
                                <select
                                    onChange={(e) => setSelectedBankCode(e.target.value)}
                                    value={selectedBankCode}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                >
                                    <option disabled value="0">Chọn ngân hàng</option>
                                    {bankCodes.map((bank) => (
                                        <option key={bank.id} value={bank.code}>
                                            {bank.shortName} ({bank.name})
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => genOtp()}
                                    type="button"
                                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
                                >
                                    Lấy mã OTP
                                </button>
                            </form>
                            </div>
                        ) : (
                            <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
                                <label className="block text-sm font-medium text-gray-700">Nhập mã OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                />

                                <button
                                    onClick={() => changingBankAccount ? handleActivateBankAccount() : handleAddBank()}
                                    type="button"
                                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        )}

                        <div className="w-2/3 mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-300 shadow-md rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border">ID</th>
                                            <th className="px-4 py-2 border">Account Number</th>
                                            <th className="px-4 py-2 border">Account Name</th>
                                            <th className="px-4 py-2 border">Bank Code</th>
                                            <th className="px-4 py-2 border">Status</th>
                                            <th className="px-4 py-2 border">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userBankAccounts.map((account) => (
                                            <tr key={account.id} className="text-center hover:bg-gray-50">
                                                <td className="px-4 py-2 border">{account.id}</td>
                                                <td className="px-4 py-2 border">{account.accountNumber}</td>
                                                <td className="px-4 py-2 border">{account.accountName}</td>
                                                <td className="px-4 py-2 border uppercase">{account.bankCode}</td>
                                                <td className={`px-4 py-2 border font-semibold ${account.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                                                    {account.status}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                    <button
                                                        onClick={() => handleChangeStatus(account.id, account.status)}
                                                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                                                    >
                                                        {account.status === "Active" ? "Deactivate" : "Activate"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default BankAccount;
