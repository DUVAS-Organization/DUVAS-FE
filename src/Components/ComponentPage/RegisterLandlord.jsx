import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Context/AuthProvider';
import UpRoleService from '../../Services/User/UpRoleService';
import OtherService from '../../Services/User/OtherService';
import UserService from '../../Services/User/UserService';
import { showCustomNotification } from '../../Components/Notification';
import { IoClose } from "react-icons/io5";
import { MdClose } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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
    const [dateOfBirth, setdateOfBirth] = useState("");
    const [cccdError, setCccdError] = useState("");
    const [previewImage, setPreviewImage] = useState(null);

    // AI-CCCD verification states
    const [frontImageValid, setFrontImageValid] = useState(null);
    const [backImageValid, setBackImageValid] = useState(null);
    const [validatingFront, setValidatingFront] = useState(false);
    const [validatingBack, setValidatingBack] = useState(false);
    const [frontIdInfo, setFrontIdInfo] = useState(null);
    const [backIdInfo, setBackIdInfo] = useState(null);

    // Refs for file inputs
    const frontImageInputRef = useRef(null);
    const backImageInputRef = useRef(null);
    const businessLicenseInputRef = useRef(null);
    const professionalLicenseInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);

    // State để lưu URL blob của ảnh từ API
    const [frontImageBlobUrl, setFrontImageBlobUrl] = useState(null);
    const [backImageBlobUrl, setBackImageBlobUrl] = useState(null);
    const [businessLicenseBlobUrl, setBusinessLicenseBlobUrl] = useState(null);
    const [professionalLicenseBlobUrl, setProfessionalLicenseBlobUrl] = useState(null);

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

    // Hàm tải ảnh từ URL dưới dạng blob
    const fetchImageAsBlob = async (url) => {
        if (!url) return null;
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Không thể tải ảnh");
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("Lỗi khi tải ảnh dưới dạng blob:", error);
            return null;
        }
    };

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

    // Validate CCCD image with AI (chỉ cho mặt trước)
    const validateCCCDWithAI = async (image, isfront) => {
        if (!image) return;

        // Chỉ xác thực cho CCCD mặt trước
        if (!isfront) return;

        try {
            setValidatingFront(true);

            const result = await OtherService.AICCCD(image);
            const isValid = result && (result.isValid !== undefined ? result.isValid : !!result.cccd);

            setFrontImageValid(isValid);
            setValidatingFront(false);
            if (isValid && result) {
                setFrontIdInfo(result);
                if (result.name) setName(result.name);
                if (result.sex) setSex(result.sex);
                if (result.address) setAddress(result.address);
                if (result.cccd) setCccdNumber(result.cccd);
                if (result.dateOfBirth) setdateOfBirth(result.dateOfBirth);
            }

            if (isValid) {
                showCustomNotification("success", "Ảnh CCCD mặt trước hợp lệ.");
            } else {
                showCustomNotification("error", "Ảnh CCCD mặt trước không hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi khi xác thực ảnh CCCD:", error);
            showCustomNotification("error", "Có lỗi xảy ra khi xác thực ảnh CCCD. Vui lòng thử lại.");
            setValidatingFront(false);
            setFrontImageValid(false);
        }
    };

    const handleFrontImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFrontImage(file);
            validateCCCDWithAI(file, true);
            setFrontImageBlobUrl(URL.createObjectURL(file)); // Hiển thị ảnh cục bộ ban đầu
        }
    };

    const handleBackImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackImage(file);
            setBackImageBlobUrl(URL.createObjectURL(file)); // Hiển thị ảnh cục bộ ban đầu
        }
    };

    const handleBusinessLicenseChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBusinessLicense(file);
            setBusinessLicenseBlobUrl(URL.createObjectURL(file));
        }
    };

    const handleProfessionalLicenseChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfessionalLicense(file);
            setProfessionalLicenseBlobUrl(URL.createObjectURL(file));
        }
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
        if (!frontImageValid) {
            showCustomNotification("error", "Vui lòng sử dụng ảnh CCCD mặt trước hợp lệ.");
            return;
        }

        if (!userId || !token || !cccdNumber || !frontImage || !name || !sex || !address || cccdError) {
            showCustomNotification("error", "Vui lòng điền đầy đủ và đúng thông tin cần thiết.");
            return;
        }

        setIsSubmitting(true);
        try {
            const frontImageUrl = await uploadFile(frontImage);
            const backImageUrl = backImage ? await uploadFile(backImage) : null;
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
                dateOfBirth,
            };

            let response;
            if (selectedNeed === 'Chủ dịch vụ') {
                response = await UpRoleService.createServiceLicense(payload, token);
            } else {
                response = await UpRoleService.createLandlordLicense(payload, token);
            }

            // Tải ảnh từ URL trong response dưới dạng blob
            if (response.anhCCCDMatTruocUrl) {
                const blobUrl = await fetchImageAsBlob(response.anhCCCDMatTruocUrl);
                setFrontImageBlobUrl(blobUrl);
            }
            if (response.anhCCCDMatSauUrl) {
                const blobUrl = await fetchImageAsBlob(response.anhCCCDMatSauUrl);
                setBackImageBlobUrl(blobUrl);
            }
            if (response.giayPhepKinhDoanh) {
                const blobUrl = await fetchImageAsBlob(response.giayPhepKinhDoanh);
                setBusinessLicenseBlobUrl(blobUrl);
            }
            if (response.giayPhepChuyenMon) {
                const blobUrl = await fetchImageAsBlob(response.giayPhepChuyenMon);
                setProfessionalLicenseBlobUrl(blobUrl);
            }
            window.location.reload();
            showCustomNotification("success", "Đăng ký thành công!");
            setShowConfirm(false);
        } catch (error) {
            console.error("Lỗi trong quá trình đăng ký:", error.response?.data || error.message);
            if (error.response && error.response.status === 409) {
                showCustomNotification("error", "Giấy phép có số CCCD này đã tồn tại.");
            } else {
                showCustomNotification("error", error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    return (
        <div className='select-none'>
            <h1 className='text-xl font-medium mb-1'>Đăng ký thành chủ</h1>
            {/* Role Selection */}
            <div className="mb-6">
                <label className="block text-base font-medium text-gray-700 mb-2 dark:text-white">Bạn là:</label>
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
            <h2 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Xác minh danh tính</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Front ID */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:bg-gray-800 dark:text-white">
                        Ảnh CCCD mặt trước:
                        {validatingFront && (
                            <span className="ml-2 text-yellow-500 inline-flex items-center">
                                <AiOutlineLoading3Quarters className="animate-spin mr-1" />
                                Đang xác thực...
                            </span>
                        )}
                        {!validatingFront && frontImageValid === true && (
                            <span className="ml-2 text-green-500 inline-flex items-center">
                                <FaCheckCircle className="mr-1" />
                                Hợp lệ
                            </span>
                        )}
                        {!validatingFront && frontImageValid === false && (
                            <span className="ml-2 text-red-500 inline-flex items-center">
                                <FaTimesCircle className="mr-1" />
                                Không hợp lệ
                            </span>
                        )}
                    </label>
                    <div
                        className="w-full h-40 border dark:bg-gray-800 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                        onClick={() => frontImageBlobUrl && setPreviewImage(frontImageBlobUrl)}
                    >
                        {frontImageBlobUrl ? (
                            <img
                                src={frontImageBlobUrl}
                                alt="Front CCCD"
                                className="object-cover h-full w-full rounded-lg"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm dark:text-white">Chưa có ảnh</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => frontImageInputRef.current.click()}
                        className="mt-2 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                        disabled={isSubmitting || validatingFront}
                    >
                        {validatingFront ? "Đang xác thực..." : "Chọn ảnh"}
                    </button>
                    <input
                        type="file"
                        ref={frontImageInputRef}
                        onChange={handleFrontImageChange}
                        className="hidden"
                        accept="image/*"
                        disabled={isSubmitting || validatingFront}
                    />
                    {frontIdInfo && (
                        <div className="mt-2 text-sm text-gray-700 w-full dark:text-white">
                            <p><strong>Tên:</strong> {frontIdInfo.name}</p>
                            <p><strong>Giới tính:</strong> {frontIdInfo.sex}</p>
                            <p><strong>Địa chỉ:</strong> {frontIdInfo.address}</p>
                            <p><strong>Ngày sinh:</strong> {formatDate(frontIdInfo.dateOfBirth)}</p>
                        </div>
                    )}
                </div>

                {/* Back ID */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                        Ảnh CCCD mặt sau:
                    </label>
                    <div
                        className="w-full h-40 dark:bg-gray-800 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                        onClick={() => backImageBlobUrl && setPreviewImage(backImageBlobUrl)}
                    >
                        {backImageBlobUrl ? (
                            <img
                                src={backImageBlobUrl}
                                alt="Back CCCD"
                                className="object-cover h-full w-full rounded-lg"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm dark:text-white">Chưa có ảnh</span>
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
                        onChange={handleBackImageChange}
                        className="hidden"
                        accept="image/*"
                        disabled={isSubmitting}
                    />
                    {backIdInfo && (
                        <div className="mt-2 text-sm text-gray-700 w-full dark:text-white">
                            <p><strong>Ngày cấp:</strong> {backIdInfo.issueDate}</p>
                            <p><strong>Nơi cấp:</strong> {backIdInfo.issuePlace}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ID Number */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">Số CCCD:</label>
                <input
                    type="text"
                    placeholder="Nhập số CCCD"
                    value={cccdNumber || ""}
                    onChange={handleCccdChange}
                    className={`w-full p-3 border rounded-lg ${cccdError ? 'border-red-500 dark:bg-gray-800 dark:text-white' : 'border-gray-300 dark:bg-gray-800 dark:text-white'}`}
                    maxLength={12}
                    disabled={isSubmitting}
                />
                {cccdError && <p className="mt-1 text-sm text-red-500">{cccdError}</p>}
            </div>

            {/* Legal Documents */}
            <h2 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Giấy tờ pháp lý</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Business License */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">Giấy phép kinh doanh:</label>
                    <div
                        className="w-full h-40 dark:bg-gray-800 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                        onClick={() => businessLicenseBlobUrl && setPreviewImage(businessLicenseBlobUrl)}
                    >
                        {businessLicenseBlobUrl ? (
                            <img
                                src={businessLicenseBlobUrl}
                                alt="Giấy phép kinh doanh"
                                className="object-cover h-full w-full rounded-lg"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm dark:text-white">Chưa có ảnh</span>
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
                        onChange={handleBusinessLicenseChange}
                        className="hidden"
                        accept="image/*"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Professional License (Conditional) */}
                {selectedNeed === 'Chủ dịch vụ' && (
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">Giấy phép chuyên môn:</label>
                        <div
                            className="w-full h-40 dark:bg-gray-800 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
                            onClick={() => professionalLicenseBlobUrl && setPreviewImage(professionalLicenseBlobUrl)}
                        >
                            {professionalLicenseBlobUrl ? (
                                <img
                                    src={professionalLicenseBlobUrl}
                                    alt="Giấy phép chuyên môn"
                                    className="object-cover h-full w-full rounded-lg"
                                />
                            ) : (
                                <span className="text-gray-500 text-sm dark:text-white">Chưa có ảnh</span>
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
                            onChange={handleProfessionalLicenseChange}
                            className="hidden"
                            accept="image/*"
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
                        cccdError ||
                        frontImageValid !== true
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
                        cccdError ||
                        frontImageValid !== true
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
                            className="absolute top-2 right-2 text-black font-bold hover:text-gray-800"
                            onClick={() => setPreviewImage(null)}
                        >
                            <MdClose className="text-xl" />
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
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-white">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center dark:text-white">Xác nhận đăng ký</h2>
                        <p className="text-gray-600 mb-4 text-center dark:text-white">Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</p>
                        <div className="space-y-2 text-gray-700 dark:text-white">
                            <p><strong>Số CCCD:</strong> {cccdNumber}</p>

                            {/* Chạy các ảnh ngang hàng */}
                            <div className="flex space-x-4 mb-4 dark:text-white">
                                <div className="flex-1">
                                    <p><strong>Ảnh CCCD mặt trước:</strong></p>
                                    {frontImageBlobUrl ? (
                                        <img
                                            src={frontImageBlobUrl}
                                            alt="Ảnh CCCD mặt trước"
                                            className="w-full h-auto max-h-20 object-contain rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(frontImageBlobUrl);
                                                setShowImagePreview(true);
                                            }}
                                        />
                                    ) : (
                                        <span>Chưa có ảnh</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p><strong>Ảnh CCCD mặt sau:</strong></p>
                                    {backImageBlobUrl ? (
                                        <img
                                            src={backImageBlobUrl}
                                            alt="Ảnh CCCD mặt sau"
                                            className="w-full h-auto max-h-20 object-contain rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(backImageBlobUrl);
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
                                    {businessLicenseBlobUrl ? (
                                        <img
                                            src={businessLicenseBlobUrl}
                                            alt="Giấy phép kinh doanh"
                                            className="w-full h-auto max-h-20 object-contain rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(businessLicenseBlobUrl);
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
                                        {professionalLicenseBlobUrl ? (
                                            <img
                                                src={professionalLicenseBlobUrl}
                                                alt="Giấy phép chuyên môn"
                                                className="w-full h-auto max-h-20 object-contain rounded-lg cursor-pointer"
                                                onClick={() => {
                                                    setSelectedImage(professionalLicenseBlobUrl);
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
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white relative p-4 rounded-lg max-w-3xl max-h-[80vh] overflow-auto">
                        <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[70vh] object-contain" />
                        <button
                            onClick={() => setShowImagePreview(false)}
                            className="absolute top-2 right-2 text-black font-bold hover:text-gray-800"
                        >
                            <MdClose className="text-2xl" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterLandlord;