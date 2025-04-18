import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaTimes,
    FaRegEyeSlash,
    FaAngleDown,
    FaAngleUp,
    FaRegEye,
    FaWallet,
    FaCamera,
} from "react-icons/fa";
import Layout from "../../../Components/Layout/Layout";
import { NavLink } from "react-router-dom";
import Footer from "../../../Components/Layout/Footer";
import {
    getUserProfile,
    editProfile,
    changePassword,
    addPassword,
} from "../../../Services/User/UserProfileService";
import { showCustomNotification } from '../../../Components/Notification';
import Loading from '../../../Components/Loading';
import OtherService from "../../../Services/User/OtherService";
import EditProfile from '../../../Components/ComponentPage/EditProfile';
import AccountSettings from '../../../Components/ComponentPage/AccountSettings';
import RegisterLandlord from '../../../Components/ComponentPage/RegisterLandlord';

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

// Hàm upload file
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const data = await OtherService.uploadImage(formData);
        return data.imageUrl;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
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

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
        Password: null,
    });

    const [newProfileFile, setNewProfileFile] = useState(null);
    const [newProfilePreview, setNewProfilePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const storedToken = localStorage.getItem("token") || localStorage.getItem("authToken");
    const decodedToken = storedToken ? parseJwt(storedToken) : null;
    const currentUserId = decodedToken ? (decodedToken.UserId || decodedToken.sub) : null;

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
                    Password: userData.password || null,
                });
            } catch (error) {
                showCustomNotification("error", "Lỗi khi lấy thông tin người dùng.");
            }
        };

        fetchProfile();
    }, [location, currentUserId, storedToken]);

    const isNumeric = (value) => /^\d*$/.test(value);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (isNumeric(value)) {
            setProfileData({ ...profileData, Phone: value });
        } else {
            showCustomNotification("error", "Số điện thoại chỉ được chứa số!");
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            showCustomNotification("error", "Vui lòng đăng nhập để chỉnh sửa thông tin.");
            return;
        }
        if (!profileData.UserName || profileData.UserName.trim() === "") {
            showCustomNotification("error", "Tên đăng nhập không được để trống!");
            return;
        }
        if (!profileData.Name || profileData.Name.trim() === "") {
            showCustomNotification("error", "Họ và tên không được để trống!");
            return;
        }
        if (!profileData.Phone || profileData.Phone.trim() === "") {
            showCustomNotification("error", "Số điện thoại không được để trống!");
            return;
        }
        if (!isNumeric(profileData.Phone)) {
            showCustomNotification("error", "Số điện thoại chỉ được chứa số!");
            return;
        }
        if (!profileData.Address || profileData.Address.trim() === "") {
            showCustomNotification("error", "Địa chỉ không được để trống!");
            return;
        }
        if (!profileData.ProfilePicture && !newProfileFile) {
            showCustomNotification("error", "Ảnh đại diện không được để trống!");
            return;
        }
        setIsUploading(true);
        try {
            let finalProfilePicture = profileData.ProfilePicture;
            if (newProfileFile) {
                finalProfilePicture = await uploadFile(newProfileFile);
            }
            const updatedUser = {
                userName: profileData.UserName || null,
                name: profileData.Name.trim(),
                address: profileData.Address || null,
                phone: profileData.Phone || null,
                sex: profileData.Sex || null,
                profilePicture: finalProfilePicture,
            };
            await editProfile(currentUserId, updatedUser);
            showCustomNotification("success", "Cập nhật thông tin thành công!");
            setProfileData((prev) => ({
                ...prev,
                UserName: updatedUser.userName,
                Name: updatedUser.name,
                Address: updatedUser.address,
                Phone: updatedUser.phone,
                Sex: updatedUser.sex,
                ProfilePicture: updatedUser.profilePicture,
            }));
            setNewProfileFile(null);
            setNewProfilePreview(null);
        } catch (error) {
            showCustomNotification("error", "Lỗi khi cập nhật thông tin.");
            console.error("Error updating profile:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!storedToken) {
            showCustomNotification("error", "Vui lòng đăng nhập để đổi mật khẩu.");
            navigate("/Logins");
            return;
        }
        if (!newPassword || !confirmPassword) {
            showCustomNotification("error", "Vui lòng điền đầy đủ thông tin mật khẩu.");
            return;
        }
        if (profileData.Password !== null && /\s/.test(currentPassword)) {
            showCustomNotification("error", "Mật khẩu hiện tại không được chứa dấu cách hoặc khoảng trống.");
            return;
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (profileData.Password === null) {
            if (currentPassword !== "") {
                showCustomNotification("error", "Bạn chưa có mật khẩu cũ, vui lòng để trống ô mật khẩu hiện tại.");
                return;
            }
            if (!passwordRegex.test(newPassword)) {
                setError("Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ hoa và một số.");
                return;
            }
            if (newPassword !== confirmPassword) {
                showCustomNotification("error", "Mật khẩu mới không khớp với phần nhập lại!");
                return;
            }
            const passwordData = {
                OldPassword: "",
                NewPassword: newPassword,
                ConfirmNewPassword: confirmPassword,
            };
            try {
                await addPassword(passwordData);
                showCustomNotification("success", "Thêm mật khẩu thành công!");
                setProfileData((prev) => ({ ...prev, Password: "hashed" }));
                setNewPassword("");
                setConfirmPassword("");
            } catch (error) {
                showCustomNotification("error", "Lỗi khi thêm mật khẩu.");
                console.error("Error adding password:", error);
            }
        } else {
            if (currentPassword === newPassword) {
                showCustomNotification("error", "Mật khẩu đã được sử dụng!");
                return;
            }
            if (!passwordRegex.test(newPassword)) {
                setError("Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ hoa và một số.");
                return;
            }
            if (newPassword !== confirmPassword) {
                showCustomNotification("error", "Mật khẩu mới không khớp với phần nhập lại!");
                return;
            }
            const passwordData = {
                OldPassword: currentPassword,
                NewPassword: newPassword,
                ConfirmNewPassword: confirmPassword,
            };
            try {
                const result = await changePassword(passwordData);
                showCustomNotification("success", "Đổi mật khẩu thành công!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } catch (error) {
                showCustomNotification("error", "Sai mật khẩu cũ");
            }
        }
    };

    const handleConfirm = () => {
        console.log("Xác nhận thông tin:", { cccdNumber });
        setShowConfirm(false);
    };

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
            <div className="relative">
                {isUploading && <Loading />}
                <div className="max-w-6xl mx-auto p-4">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-5 border-b-2 pb-2 border-gray-700">
                            Quản lý tài khoản
                        </h1>

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
                            <EditProfile
                                profileData={profileData}
                                setProfileData={setProfileData}
                                newProfileFile={newProfileFile}
                                setNewProfileFile={setNewProfileFile}
                                newProfilePreview={newProfilePreview}
                                setNewProfilePreview={setNewProfilePreview}
                                handleProfileUpdate={handleProfileUpdate}
                                handlePhoneChange={handlePhoneChange}
                                isUploading={isUploading}
                            />
                        )}

                        {activeTab === "settings" && (
                            <AccountSettings
                                profileData={profileData}
                                currentPassword={currentPassword}
                                setCurrentPassword={setCurrentPassword}
                                newPassword={newPassword}
                                setNewPassword={setNewPassword}
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                newPasswordVisible={newPasswordVisible}
                                setNewPasswordVisible={setNewPasswordVisible}
                                rePasswordVisible={rePasswordVisible}
                                setRePasswordVisible={setRePasswordVisible}
                                error={error}
                                handleChangePassword={handleChangePassword}
                                showLockForm={showLockForm}
                                setShowLockForm={setShowLockForm}
                                lockPasswordVisible={lockPasswordVisible}
                                setLockPasswordVisible={setLockPasswordVisible}
                            />
                        )}

                        {activeTab === "registerLandlord" && (
                            <RegisterLandlord
                                selectedNeed={selectedNeed}
                                setSelectedNeed={setSelectedNeed}
                                frontImage={frontImage}
                                setFrontImage={setFrontImage}
                                backImage={backImage}
                                setBackImage={setBackImage}
                                businessLicense={businessLicense}
                                setBusinessLicense={setBusinessLicense}
                                professionalLicense={professionalLicense}
                                setProfessionalLicense={setProfessionalLicense}
                                cccdNumber={cccdNumber}
                                setCccdNumber={setCccdNumber}
                                showConfirm={showConfirm}
                                setShowConfirm={setShowConfirm}
                                handleConfirm={handleConfirm}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default Profile;