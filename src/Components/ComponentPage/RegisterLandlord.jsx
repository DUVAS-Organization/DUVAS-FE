import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Context/AuthProvider';
import UpRoleService from '../../Services/User/UpRoleService';
import OtherService from '../../Services/User/OtherService';
import UserService from '../../Services/User/UserService';
import { showCustomNotification } from '../../Components/Notification';
import { IoClose } from "react-icons/io5";
import { MdClose } from 'react-icons/md';

const RegisterLandlord = ({
    selectedNeed,
    setSelectedNeed,
    frontImage,
    setFrontImage,
    backImage,
    setBackImage,
    businessLicense,
    setBusinessLicense,
    professionalLicense,
    setProfessionalLicense,
    cccdNumber,
    setCccdNumber,
    showConfirm,
    setShowConfirm,
}) => {
    const { user } = useAuth();
    const userId = user?.userId;
    const token = user?.token;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [sex, setSex] = useState("");
    const [address, setAddress] = useState("");
    const [cccdError, setCccdError] = useState("");
    const [previewImage, setPreviewImage] = useState(null);

    // Refs for file inputs
    const frontImageInputRef = useRef(null);
    const backImageInputRef = useRef(null);
    const businessLicenseInputRef = useRef(null);
    const professionalLicenseInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);

    useEffect(() => {
        const fetchCurrentUserById = async () => {
            try {
                if (!userId || !token) return;
                const currentUser = await UserService.getUserById(userId);
                setName(currentUser.name || "");
                setSex(currentUser.sex || "");
                setAddress(currentUser.address || "");
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng theo ID:", error);
            }
        };
        fetchCurrentUserById();
    }, [userId, token]);

    // Validate CCCD number
    const validateCccd = (value) => {
        const cccdRegex = /^\d{12}$/;
        if (!value) {
            setCccdError("Số CCCD không được để trống.");
        } else if (!cccdRegex.test(value)) {
            setCccdError("Số CCCD phải là 12 chữ số.");
        } else {
            setCccdError("");
        }
    };

    const handleCccdChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
        setCccdNumber(value);
        validateCccd(value);
    };

    const uploadFile = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const data = await OtherService.uploadImage(formData);
            return data.imageUrl;
        } catch (error) {
            console.error("Lỗi khi upload file:", error);
            throw error;
        }
    };

    const handleConfirm = async () => {
        if (!userId || !token || !cccdNumber || !frontImage || !backImage || !name || !sex || !address || cccdError) {
            showCustomNotification("error", "Vui lòng điền đầy đủ và đúng thông tin cần thiết.");
            return;
        }
        setIsSubmitting(true);
        try {
            const frontImageUrl = await uploadFile(frontImage);
            const backImageUrl = await uploadFile(backImage);
            const businessLicenseUrl = businessLicense ? await uploadFile(businessLicense) : null;
            const professionalLicenseUrl = selectedNeed === 'Chủ dịch vụ' && professionalLicense
                ? await uploadFile(professionalLicense)
                : null;

            const payload = {
                userId: parseInt(userId),
                cccd: cccdNumber,
                anhCCCDMatTruoc: frontImageUrl,
                anhCCCDMatSau: backImageUrl,
                giayPhepKinhDoanh: businessLicenseUrl,
                giayPhepChuyenMon: professionalLicenseUrl,
                name,
                sex,
                address,
            };

            let response;
            if (selectedNeed === 'Chủ dịch vụ') {
                response = await UpRoleService.createServiceLicense(payload, token);
            } else {
                response = await UpRoleService.createLandlordLicense(payload, token);
            }
            showCustomNotification("success", "Đăng ký thành công!");
            setShowConfirm(false);
        } catch (error) {
            console.error("Lỗi trong quá trình đăng ký:", error.response?.data || error.message);
            showCustomNotification("error", "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='select-none'>
            <h1 className='text-xl font-medium mb-1'>Đăng ký thành chủ</h1>
            {/* Role Selection */}
            <div className="mb-6">
                <label className="block text-base font-medium text-gray-700 mb-2">Bạn là:</label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => setSelectedNeed('Chủ nhà')}
                        className={`w-full py-2 rounded-lg font-medium transition-colors duration-200 ${selectedNeed === 'Chủ nhà'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        disabled={isSubmitting}
                    >
                        Chủ nhà
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedNeed('Chủ dịch vụ')}
                        className={`w-full py-2 rounded-lg font-medium transition-colors duration-200 ${selectedNeed === 'Chủ dịch vụ'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        disabled={isSubmitting}
                    >
                        Chủ dịch vụ
                    </button>
                </div>
            </div>


            {/* Identity Verification */}
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Xác minh danh tính</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Front ID */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh CCCD mặt trước:</label>
                    <div
                        className="w-[30rem] h-[15rem] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                        onClick={() => frontImage && setPreviewImage(URL.createObjectURL(frontImage))}
                    >
                        {frontImage ? (
                            <img
                                src={URL.createObjectURL(frontImage)}
                                alt="Front CCCD"
                                className="object-cover h-full w-full rounded-lg"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm">Chưa có ảnh</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => frontImageInputRef.current.click()}
                        className="mt-2 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                        disabled={isSubmitting}
                    >
                        Chọn ảnh
                    </button>
                    <input
                        type="file"
                        ref={frontImageInputRef}
                        onChange={(e) => setFrontImage(e.target.files[0])}
                        className="hidden"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Back ID */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh CCCD mặt sau:</label>
                    <div
                        className="w-[30rem] h-[15rem] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                        onClick={() => backImage && setPreviewImage(URL.createObjectURL(backImage))}
                    >
                        {backImage ? (
                            <img
                                src={URL.createObjectURL(backImage)}
                                alt="Back CCCD"
                                className="object-cover h-full w-full rounded-lg"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm">Chưa có ảnh</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => backImageInputRef.current.click()}
                        className="mt-2 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                        disabled={isSubmitting}
                    >
                        Chọn ảnh
                    </button>
                    <input
                        type="file"
                        ref={backImageInputRef}
                        onChange={(e) => setBackImage(e.target.files[0])}
                        className="hidden"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* ID Number */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Số CCCD:</label>
                <input
                    type="text"
                    placeholder="Nhập số CCCD"
                    value={cccdNumber || ""}
                    onChange={handleCccdChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${cccdError ? 'border-red-500' : 'border-gray-300'
                        }`}
                    maxLength={12}
                    disabled={isSubmitting}
                />
                {cccdError && <p className="mt-1 text-sm text-red-500 ">{cccdError}</p>}
            </div>

            {/* Legal Documents */}
            <h2 className="text-lg font-semibold text-gray-800 mb-2 ">Giấy tờ pháp lý</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Business License */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giấy phép kinh doanh:</label>
                    <div
                        className="w-[30rem] h-[15rem] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                        onClick={() => businessLicense && setPreviewImage(URL.createObjectURL(businessLicense))}
                    >
                        {businessLicense ? (
                            <img
                                src={URL.createObjectURL(businessLicense)}
                                alt="Giấy phép kinh doanh"
                                className="object-cover h-full w-full rounded-lg"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm">Chưa có ảnh</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => businessLicenseInputRef.current.click()}
                        className="mt-2 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                        disabled={isSubmitting}
                    >
                        Chọn ảnh
                    </button>
                    <input
                        type="file"
                        ref={businessLicenseInputRef}
                        onChange={(e) => setBusinessLicense(e.target.files[0])}
                        className="hidden"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Professional License (Conditional) */}
                {selectedNeed === 'Chủ dịch vụ' && (
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Giấy phép chuyên môn:</label>
                        <div
                            className="w-[30rem] h-[15rem] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                            onClick={() => professionalLicense && setPreviewImage(URL.createObjectURL(professionalLicense))}
                        >
                            {professionalLicense ? (
                                <img
                                    src={URL.createObjectURL(professionalLicense)}
                                    alt="Giấy phép chuyên môn"
                                    className="object-cover h-full w-full rounded-lg"
                                />
                            ) : (
                                <span className="text-gray-500 text-sm">Chưa có ảnh</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => professionalLicenseInputRef.current.click()}
                            className="mt-2 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            Chọn ảnh
                        </button>
                        <input
                            type="file"
                            ref={professionalLicenseInputRef}
                            onChange={(e) => setProfessionalLicense(e.target.files[0])}
                            className="hidden"
                            disabled={isSubmitting}
                        />
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    className={`py-2 px-6 rounded-lg font-medium transition-colors duration-200 ${isSubmitting ||
                        !cccdNumber ||
                        !frontImage ||
                        !backImage ||
                        !businessLicense ||
                        (selectedNeed === 'Chủ dịch vụ' && !professionalLicense) ||
                        cccdError
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    onClick={() => setShowConfirm(true)}
                    disabled={
                        isSubmitting ||
                        !cccdNumber ||
                        !frontImage ||
                        !backImage ||
                        !businessLicense ||
                        (selectedNeed === 'Chủ dịch vụ' && !professionalLicense) ||
                        cccdError
                    }
                >
                    {isSubmitting ? "Đang xử lý..." : "Đăng ký thành chủ"}
                </button>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
                        <button
                            className="absolute top-0 right-2 text-black font-bold hover:text-gray-800"
                            onClick={() => setPreviewImage(null)}
                        >
                            ✕
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Xác nhận đăng ký</h2>
                        <p className="text-gray-600 mb-4 text-center">Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</p>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Số CCCD:</strong> {cccdNumber}</p>

                            {/* Chạy các ảnh ngang hàng */}
                            <div className="flex space-x-4 mb-4">
                                <div className="flex-1">
                                    <p><strong>Ảnh CCCD mặt trước:</strong></p>
                                    {frontImage ? (
                                        <img
                                            src={URL.createObjectURL(frontImage)}
                                            alt="Ảnh CCCD mặt trước"
                                            className="w-full h-auto max-h-[80px] object-contain rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(URL.createObjectURL(frontImage));
                                                setShowImagePreview(true);
                                            }}
                                        />
                                    ) : (
                                        <span>Chưa có ảnh</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p><strong>Ảnh CCCD mặt sau:</strong></p>
                                    {backImage ? (
                                        <img
                                            src={URL.createObjectURL(backImage)}
                                            alt="Ảnh CCCD mặt sau"
                                            className="w-full h-auto max-h-[80px] object-contain rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(URL.createObjectURL(backImage));
                                                setShowImagePreview(true);
                                            }}
                                        />
                                    ) : (
                                        <span>Chưa có ảnh</span>
                                    )}
                                </div>
                            </div>

                            {/* Giấy phép kinh doanh và Giấy phép chuyên môn */}
                            <div className="flex space-x-4 mb-4">
                                <div className="flex-1">
                                    <p><strong>Giấy phép kinh doanh:</strong></p>
                                    {businessLicense ? (
                                        <img
                                            src={URL.createObjectURL(businessLicense)}
                                            alt="Giấy phép kinh doanh"
                                            className="w-full h-auto max-h-[80px] object-contain rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(URL.createObjectURL(businessLicense));
                                                setShowImagePreview(true);
                                            }}
                                        />
                                    ) : (
                                        <span>Chưa có ảnh</span>
                                    )}
                                </div>

                                {selectedNeed === 'Chủ dịch vụ' && (
                                    <div className="flex-1">
                                        <p><strong>Giấy phép chuyên môn:</strong></p>
                                        {professionalLicense ? (
                                            <img
                                                src={URL.createObjectURL(professionalLicense)}
                                                alt="Giấy phép chuyên môn"
                                                className="w-full h-auto max-h-[80px] object-contain rounded-lg cursor-pointer"
                                                onClick={() => {
                                                    setSelectedImage(URL.createObjectURL(professionalLicense));
                                                    setShowImagePreview(true);
                                                }}
                                            />
                                        ) : (
                                            <span>Chưa có ảnh</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4 mt-6">
                            <button
                                className="py-2 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                onClick={() => setShowConfirm(false)}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                className={`py-2 px-6 rounded-lg font-medium transition-colors duration-200 ${isSubmitting
                                    ? 'bg-red-300 text-white cursor-not-allowed'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Đang gửi..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Preview Image */}
            {showImagePreview && (
                <div className="fixed  inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white relative p-4 rounded-lg max-w-3xl max-h-[80vh] overflow-auto">
                        <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[70vh] object-contain" />
                        <button
                            onClick={() => setShowImagePreview(false)}
                            className="absolute top-0 right-0 text-black font-bold hover:text-gray-800"
                        >
                            <MdClose className='text-black text-2xl' />
                        </button>
                    </div>
                </div>
            )}



        </div>
    );
};

export default RegisterLandlord;