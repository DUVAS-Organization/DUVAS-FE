import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaTimes,
    FaRegEyeSlash,
    FaAngleDown,
    FaAngleUp,
    FaRegEye,
    FaWallet,
} from "react-icons/fa";
import Layout from "../../../Components/Layout/Layout";
import { NavLink } from "react-router-dom";
import Footer from "../../../Components/Layout/Footer";
import {
    getUserProfile,
    editProfile,
    changePassword,
} from "../../../Services/User/UserProfileService";
import { showCustomNotification } from '../../../Components/Notification'

// Hàm giải mã token
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding token:", e);
        return null;
    }
};

const Profile = () => {
    const [selectedNeed, setSelectedNeed] = useState("Chủ nhà");
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [businessLicense, setBusinessLicense] = useState(null);
    const [professionalLicense, setProfessionalLicense] = useState(null);
    const [activeTab, setActiveTab] = useState("edit");
    const [showLockForm, setShowLockForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rePasswordVisible, setRePasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [lockPasswordVisible, setLockPasswordVisible] = useState(false);
    const [cccdNumber, setCccdNumber] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State cho các input của form đổi mật khẩu
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // State cho thông tin người dùng
    const [profileData, setProfileData] = useState({
        UserId: 0,
        UserName: "",
        Name: "",
        Gmail: "",
        Phone: "",
        Address: "",
        Sex: "",
        ProfilePicture: "https://www.gravatar.com/avatar/?d=mp",
        Money: 0,
    });

    const location = useLocation();
    const navigate = useNavigate();

    // Lấy và kiểm tra token
    const storedToken = localStorage.getItem("token") || localStorage.getItem("authToken"); // Kiểm tra cả "authToken" nếu cần
    const decodedToken = storedToken ? parseJwt(storedToken) : null;
    const currentUserId = decodedToken ? (decodedToken.UserId || decodedToken.sub) : null; // Thử lấy từ UserId hoặc sub

    // Debug
    useEffect(() => {
        // console.log("Stored Token:", storedToken);
        // console.log("Decoded Token:", decodedToken);
        // console.log("Current UserId:", currentUserId);
    }, [storedToken, decodedToken, currentUserId]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get("tab");
        setActiveTab(tab || "edit");

        const fetchProfile = async () => {
            if (!currentUserId || !storedToken) {
                showCustomNotification("error", "Vui lòng đăng nhập để xem thông tin.");
                return;
            }

            try {
                const userData = await getUserProfile(currentUserId);
                setProfileData({
                    UserId: userData.userId || 0,
                    UserName: userData.userName || "",
                    Name: userData.name || "",
                    Gmail: userData.gmail || "",
                    Phone: userData.phone || "",
                    Address: userData.address || "",
                    Sex: userData.sex || "",
                    ProfilePicture: userData.profilePicture || "https://www.gravatar.com/avatar/?d=mp",
                    Money: userData.money || 0,
                });
                // showCustomNotification("error", null);
            } catch (error) {
                showCustomNotification("error", "Lỗi khi lấy thông tin người dùng.");
            }
        };

        fetchProfile();
    }, [location, currentUserId, storedToken]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (!currentUserId) {
            showCustomNotification("error", "Vui lòng đăng nhập để chỉnh sửa thông tin.");
            return;
        }

        if (!profileData.Name.trim()) {
            showCustomNotification("error", "Họ và tên không được để trống.");
            return;
        }

        if (!profileData.ProfilePicture) {
            showCustomNotification("error", "Ảnh đại diện không được để trống.");
            return;
        }

        const updatedUser = {
            UserId: parseInt(currentUserId),
            UserName: profileData.UserName || null,
            Name: profileData.Name.trim(),
            Gmail: profileData.Gmail || null,
            Phone: profileData.Phone || null,
            Address: profileData.Address || null,
            Sex: profileData.Sex || null,
            ProfilePicture: profileData.ProfilePicture,
            Money: profileData.Money,
        };

        try {
            // showCustomNotification("error", null);
            // showCustomNotification("success", null);
            await editProfile(currentUserId, updatedUser);
            showCustomNotification("success", "Cập nhật thông tin thành công!");
        } catch (error) {
            showCustomNotification("error", "Lỗi khi cập nhật thông tin.");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!storedToken) {
            showCustomNotification("error", "Vui lòng đăng nhập để đổi mật khẩu.");
            navigate("/Logins");
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            showCustomNotification("error", "Vui lòng điền đầy đủ thông tin mật khẩu.");
            return;
        }

        if (currentPassword === newPassword) {
            showCustomNotification("error", "Mật khẩu đã được sử dụng!");
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            // showCustomNotification("error", "Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ hoa và một số.");
            setError("Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ hoa và một số.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showCustomNotification("error", "Mật khẩu mới không khớp với phần nhập lại!");
            // setError("Không khớp với mật khẩu mới!");
            return;
        }

        const passwordData = {
            OldPassword: currentPassword,
            NewPassword: newPassword,
            ConfirmNewPassword: confirmPassword,
        };

        try {
            // showCustomNotification("error", null);
            // showCustomNotification("success", null);
            const result = await changePassword(passwordData);
            showCustomNotification("success", "Đổi mật khẩu thành công!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            showCustomNotification("error", "Sai mật khẩu cũ");
        }
    };

    const handleConfirm = () => {
        console.log("Xác nhận thông tin:", { cccdNumber });
        setShowConfirm(false);
    };

    const toggleLockForm = () => setShowLockForm((prev) => !prev);
    const toggleDeleteForm = () => setShowDeleteForm((prev) => !prev);

    const handleTabClick = (tab) => navigate(`/Profile?tab=${tab}`);

    if (!currentUserId || !storedToken) {
        return (
            <Layout showNavbar={false} showSidebar={true}>
                <div className="max-w-6xl mx-auto p-4">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
                        <NavLink to="/Logins" className="text-red-500 font-semibold">
                            Đăng nhập ngay
                        </NavLink>
                    </div>
                </div>
                <Footer />
            </Layout>
        );
    }

    return (
        <Layout showNavbar={false} showSidebar={true}>
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">
                        Quản lý tài khoản
                    </h1>

                    {/* {error && <div className="text-red-500 text-center mb-4">{error}</div>} */}
                    {/* {successMessage && <div className="text-green-500 text-center mb-4">{successMessage}</div>} */}

                    <div className="border-b border-gray-200 mb-4">
                        <ul className="flex space-x-4">
                            <li
                                className={`pb-2 cursor-pointer ${activeTab === "edit" ? "border-b-2 border-red-500 text-red-500" : "text-black"}`}
                                onClick={() => handleTabClick("edit")}
                            >
                                Chỉnh sửa thông tin
                            </li>
                            <li
                                className={`pb-2 cursor-pointer ${activeTab === "settings" ? "border-b-2 border-red-500 text-red-500" : "text-black"}`}
                                onClick={() => handleTabClick("settings")}
                            >
                                Cài đặt tài khoản
                            </li>
                            <li
                                className={`pb-2 cursor-pointer ${activeTab === "registerLandlord" ? "border-b-2 border-red-500 text-red-500" : "text-black"}`}
                                onClick={() => handleTabClick("registerLandlord")}
                            >
                                Đăng ký thành chủ
                            </li>
                        </ul>
                    </div>

                    {activeTab === "edit" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <img
                                        alt="User avatar"
                                        className="w-40 h-40 rounded-full my-2"
                                        src={profileData.ProfilePicture}
                                        onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
                                    />
                                    <button className="absolute top-1 right-6 bg-white text-red-500 rounded-full p-1 shadow">
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="bg-white px-4 py-2 rounded-lg shadow-md w-64 ml-10">
                                    <h1 className="font-bold text-xl mb-1">{profileData.Name || "Chưa có tên"}</h1>
                                    <h2 className="text-lg font-semibold">Số dư tài khoản</h2>
                                    <div className="flex justify-between mb-2">
                                        <span>TK Chính</span>
                                        <span>{profileData.Money.toLocaleString() || "0"}</span>
                                    </div>
                                    <div className="flex justify-between mb-4">
                                        <span>TK Khuyến mãi</span>
                                        <span>0</span>
                                    </div>
                                    <Link
                                        to="/Moneys"
                                        className="w-full bg-white text-red-500 py-1 rounded-lg flex items-center justify-center border border-red-400 hover:bg-red-500 hover:text-white"
                                    >
                                        <FaWallet className="mr-2" />
                                        Nạp tiền
                                    </Link>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate}>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-gray-800 font-normal">Tên đăng nhập</label>
                                        <input
                                            className="w-full border border-gray-300 rounded p-2 mt-1"
                                            placeholder="Username"
                                            type="text"
                                            value={profileData.UserName || ""}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    UserName: e.target.value || null,
                                                })
                                            }
                                        />
                                        <label className="text-gray-800 font-normal mt-2">Họ và tên</label>
                                        <input
                                            className="w-full border border-gray-300 rounded p-2 mt-1"
                                            placeholder="Họ và tên"
                                            type="text"
                                            value={profileData.Name || ""}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    Name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <label className="text-gray-800 font-normal mt-2">Email</label>
                                        <input
                                            className="w-full border border-gray-300 rounded p-2 mt-1"
                                            placeholder="example@gmail.com"
                                            type="text"
                                            value={profileData.Gmail || ""}
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label className="text-gray-800 font-normal">Số điện thoại</label>
                                        <input
                                            className="w-full border border-gray-300 rounded p-2 mt-1"
                                            placeholder="0987654321"
                                            type="text"
                                            value={profileData.Phone || ""}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    Phone: e.target.value,
                                                })
                                            }
                                        />
                                        <label className="text-gray-800 font-normal mt-2">Địa chỉ</label>
                                        <input
                                            className="w-full border border-gray-300 rounded p-2 mt-1"
                                            placeholder="Hòa Hải, Đà Nẵng"
                                            type="text"
                                            value={profileData.Address || ""}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    Address: e.target.value,
                                                })
                                            }
                                        />
                                        <label className="text-gray-800 font-normal mt-2">Giới tính</label>
                                        <select
                                            className="w-full border border-gray-300 rounded p-2 mt-1"
                                            value={profileData.Sex || ""}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    Sex: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="" disabled>Chọn giới tính</option>
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <button
                                        type="submit"
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
                                    >
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="w-full">
                            <div className="w-full p-6 bg-white shadow-md mt-10">
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
                                    <form onSubmit={handleChangePassword}>
                                        <div className="mb-4">
                                            <label htmlFor="current-password" className="block text-gray-700 mb-2">
                                                Mật khẩu hiện tại
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl"
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
                                            <label htmlFor="new-password" className="block text-gray-700 mb-2">
                                                Mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={newPasswordVisible ? "text" : "password"}
                                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                                {error && <div className="text-red-500">{error}</div>}
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl"
                                                    onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                                                >
                                                    {newPasswordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="confirm-password" className="block text-gray-700 mb-2">
                                                Nhập lại mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={rePasswordVisible ? "text" : "password"}
                                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                                {/* {error && <div className="text-red-500">{error}</div>} */}
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 text-xl"
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
                                    <ul className="text-gray-500 text-sm mt-4">
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
                                            onClick={toggleLockForm}
                                        >
                                            Yêu cầu khóa tài khoản
                                        </h2>
                                        {showLockForm ? (
                                            <FaAngleUp className="text-2xl cursor-pointer" onClick={toggleLockForm} />
                                        ) : (
                                            <FaAngleDown className="text-2xl cursor-pointer" onClick={toggleLockForm} />
                                        )}
                                    </div>
                                    {showLockForm && (
                                        <form className="mb-4">
                                            <label htmlFor="lock-reason" className="block font-medium text-gray-700 mb-2">
                                                Nhập mật khẩu hiện tại
                                            </label>
                                            <div className="mb-4 flex">
                                                <div className="relative border-red-500 mr-5">
                                                    <input
                                                        type={lockPasswordVisible ? "text" : "password"}
                                                        className="w-80 px-4 py-2 border border-red-400 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl mr-2"
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
                                                <ul className="list-disc ml-5 text-left text-sm text-gray-600">
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

                                    <div className="flex justify-between">
                                        <h2
                                            className="text-xl font-bold mb-4 cursor-pointer select-none"
                                            onClick={toggleDeleteForm}
                                        >
                                            Yêu cầu xóa tài khoản
                                        </h2>
                                        {showDeleteForm ? (
                                            <FaAngleUp className="text-2xl cursor-pointer" onClick={toggleDeleteForm} />
                                        ) : (
                                            <FaAngleDown className="text-2xl cursor-pointer" onClick={toggleDeleteForm} />
                                        )}
                                    </div>
                                    {showDeleteForm && (
                                        <form className="mb-4">
                                            <div className="mb-4">
                                                <label htmlFor="delete-reason" className="block text-gray-700 mb-2">
                                                    Gửi yêu cầu xoá toàn bộ thông tin của tài khoản. Sau khi được xử lý, toàn bộ thông tin sẽ được xoá và không thể hoàn tác.
                                                </label>
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-white text-red-500 font-medium border border-red-500 px-4 py-2 rounded"
                                            >
                                                Yêu cầu xóa tài khoản
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "registerLandlord" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Đăng ký thành chủ</h2>
                            <div className="w-full p-6 bg-white shadow-md mt-10">
                                <div className="mb-4">
                                    <label className="block text-lg font-semibold mb-2">Bạn là</label>
                                    <div className="flex space-x-2">
                                        {["Chủ nhà", "Chủ dịch vụ"].map((label) => (
                                            <button
                                                key={label}
                                                className={`flex-1 py-2 px-4 border rounded-lg ${selectedNeed === label ? "bg-gray-200 font-semibold" : "bg-white"}`}
                                                onClick={() => setSelectedNeed(label)}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-lg font-semibold mb-4">Xác minh danh tính</label>
                                    <div className="flex justify-between">
                                        {[
                                            { label: "Ảnh CCCD mặt trước", state: frontImage, setState: setFrontImage },
                                            { label: "Ảnh CCCD mặt sau", state: backImage, setState: setBackImage },
                                        ].map(({ label, state, setState }) => (
                                            <div key={label} className="w-[48%] flex flex-col items-center">
                                                <label className="block text-sm font-semibold mb-2">{label}</label>
                                                <div className="w-full aspect-[4/3] border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {state ? (
                                                        <img src={state} alt={label} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <span className="text-gray-400">Chưa có ảnh</span>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    id={label}
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => setState(event.target.result);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={label}
                                                    className="mt-2 px-6 py-2 border rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300"
                                                >
                                                    Chọn ảnh
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-semibold mb-1">Số CCCD</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg p-2"
                                            placeholder="Nhập số CCCD"
                                            value={cccdNumber}
                                            onChange={(e) => setCccdNumber(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-lg font-semibold mb-4">Giấy tờ pháp lý</label>
                                    <div className="flex justify-between">
                                        {[
                                            { label: "Giấy phép kinh doanh", state: businessLicense, setState: setBusinessLicense },
                                            ...(selectedNeed === "Chủ dịch vụ"
                                                ? [
                                                    {
                                                        label: "Giấy phép Chuyên môn",
                                                        state: professionalLicense,
                                                        setState: setProfessionalLicense,
                                                    },
                                                ]
                                                : []),
                                        ].map(({ label, state, setState }) => (
                                            <div key={label} className="w-[48%] flex flex-col items-center">
                                                <label className="block text-sm font-semibold mb-2">{label}</label>
                                                <div className="w-full aspect-[4/3] border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {state ? (
                                                        <img src={state} alt={label} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <span className="text-gray-400">Chưa có ảnh</span>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    id={label}
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => setState(event.target.result);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={label}
                                                    className="mt-2 px-6 py-2 border rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300"
                                                >
                                                    Chọn ảnh
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <button
                                        className="py-2 px-6 bg-gray-200 rounded-lg hover:bg-gray-300"
                                        onClick={() => setShowConfirm(true)}
                                    >
                                        Tiếp tục
                                    </button>
                                </div>

                                {showConfirm && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                                            <h3 className="text-lg font-semibold mb-4">Xác nhận thông tin</h3>
                                            <p className="text-sm mb-2"><strong>Bạn là:</strong> {selectedNeed}</p>
                                            <p className="text-sm mb-2"><strong>Số CCCD:</strong> {cccdNumber}</p>
                                            <div className="flex justify-between mb-4">
                                                {[
                                                    { label: "Ảnh CCCD mặt trước", state: frontImage },
                                                    { label: "Ảnh CCCD mặt sau", state: backImage },
                                                ].map(({ label, state }) => (
                                                    <div key={label} className="w-[48%] flex flex-col items-center">
                                                        <label className="block text-sm font-semibold mb-2">{label}</label>
                                                        <div className="w-full aspect-[4/3] border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            {state ? (
                                                                <img src={state} alt={label} className="object-cover w-full h-full" />
                                                            ) : (
                                                                <span className="text-gray-400">Chưa có ảnh</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between">
                                                <button
                                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                                    onClick={() => setShowConfirm(false)}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                                                    onClick={handleConfirm}
                                                >
                                                    Xác nhận
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default Profile;