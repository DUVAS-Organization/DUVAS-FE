import React from 'react';
import { FaCamera, FaWallet } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const EditProfile = ({
    profileData,
    setProfileData,
    newProfileFile,
    setNewProfileFile,
    newProfilePreview,
    setNewProfilePreview,
    handleProfileUpdate,
    handlePhoneChange,
    isUploading,
}) => {
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProfileFile(file);
            setNewProfilePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
            <form onSubmit={handleProfileUpdate}>
                <div className="flex justify-center mb-4">
                    <div className="relative group">
                        <img
                            alt="User avatar"
                            className="w-40 h-40 rounded-full my-2"
                            src={newProfilePreview || profileData.ProfilePicture}
                            onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
                        />
                        <div className="absolute top-2 left-0 w-40 h-40 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer text-white">
                                <FaCamera size={30} />
                                <input
                                    type="file"
                                    onChange={handleProfilePictureChange}
                                    accept=".jpeg, .png, .gif"
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white px-4 py-2 rounded-lg shadow-md w-64 ml-10 dark:bg-gray-800 dark:text-white">
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
                        <NavLink
                            to="/Moneys"
                            className="w-full bg-white dark:bg-gray-800 dark:border-gray-800 text-red-500 py-1 rounded-lg flex items-center justify-center border border-red-400 hover:bg-red-500 hover:text-white"
                        >
                            <FaWallet className="mr-2" />
                            Nạp tiền
                        </NavLink>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 ">
                    <div>
                        <label className="text-gray-800 font-normal dark:text-white">Tên đăng nhập</label>
                        <input
                            className="w-full border border-gray-300 rounded p-2 mt-1 dark:bg-gray-800 dark:text-white"
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
                        <label className="text-gray-800 font-normal mt-2 dark:text-white">Họ và tên</label>
                        <input
                            className="w-full border border-gray-300 rounded p-2 mt-1 dark:bg-gray-800 dark:text-white"
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
                        <label className="text-gray-800 font-normal mt-2 dark:text-white">Email</label>
                        <input
                            className="w-full border border-gray-300 rounded p-2 mt-1 dark:bg-gray-800 dark:text-white"
                            placeholder="example@gmail.com"
                            type="text"
                            value={profileData.Gmail || ""}
                            disabled
                        />
                    </div>

                    <div>
                        <label className="text-gray-800 font-normal dark:text-white">Số điện thoại</label>
                        <input
                            className="w-full border border-gray-300 rounded p-2 mt-1 dark:bg-gray-800 dark:text-white"
                            placeholder="0987654321"
                            type="text"
                            value={profileData.Phone || ""}
                            onChange={handlePhoneChange}
                        />
                        <label className="text-gray-800 font-normal mt-2 dark:text-white">Địa chỉ</label>
                        <input
                            className="w-full border border-gray-300 rounded p-2 mt-1 dark:bg-gray-800 dark:text-white"
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
                        <label className="text-gray-800 font-normal mt-2 dark:text-white">Giới tính</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2 mt-1 dark:bg-gray-800 dark:text-white"
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
                        disabled={isUploading}
                    >
                        {isUploading ? "Đang tải..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;