import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomLandlordService from '../../../Services/Landlord/RoomLandlordService';
import BuildingServices from '../../../Services/Admin/BuildingServices';
import CategoryRooms from '../../../Services/Admin/CategoryRooms';
import RoomServices from '../../../Services/Admin/RoomServices';
import BookingManagementService from '../../../Services/Landlord/BookingManagementService';
import OtherService from '../../../Services/User/OtherService';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import Loading from '../../../Components/Loading';
import SidebarUser from '../../../Components/Layout/SidebarUser';
import StepConfirmation from '../../../Components/ComponentPage/StepConfirmation';
import PriorityRoomService from '../../../Services/Admin/PriorityRoomService';

const RoomEdit = () => {
    const [room, setRoom] = useState({
        roomId: '',
        buildingId: null,
        title: '',
        description: '',
        locationDetail: '',
        acreage: 0,
        furniture: '',
        numberOfBathroom: 0,
        numberOfBedroom: 0,
        garret: false,
        price: 0,
        categoryRoomId: 1,
        note: '',
        status: 1,
        deposit: 0,
        isPermission: 1,
        reputation: 0,
        dien: 0,
        nuoc: 0,
        internet: 0,
        rac: 0,
        guiXe: 0,
        quanLy: 0,
        chiPhiKhac: 0,
        authorization: 0,
        startDate: '',
        endDate: '',
        priorityPrice: 0,
        categoryPriorityPackageRoomId: 0,
        duration: 0,
        priorityPackageRoomId: null,
    });
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [invalidImages, setInvalidImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDropOpen, setIsDropOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState('');
    const [currentPriorityPackageId, setCurrentPriorityPackageId] = useState(null);
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Handle API Errors
    const handleApiError = (error, customMessage = "Đã xảy ra lỗi, vui lòng thử lại!") => {
        const apiMessage = error?.response?.data?.message || error.message;
        console.error('API Error:', { status: error?.response?.status, message: apiMessage });
        if (error?.response?.status === 409) {
            if (apiMessage.includes("Mô tả phòng đã từng được sử dụng")) {
                showCustomNotification("error", "Mô tả này đã bị trùng với phòng khác trong hệ thống. Vui lòng chỉnh sửa.");
            } else if (apiMessage.includes("tiêu đề và địa chỉ")) {
                showCustomNotification("error", "Phòng với tiêu đề và địa chỉ này đã được đăng. Hãy kiểm tra lại.");
            } else if (apiMessage.includes("Địa chỉ phòng đã được sử dụng")) {
                showCustomNotification("error", "Địa chỉ phòng đã được dùng trong hệ thống. Vui lòng nhập địa chỉ khác.");
            }
        } else if (error?.response?.status === 400 && apiMessage.includes("spam")) {
            showCustomNotification("error", "Mô tả có thể bị spam hoặc trùng với AI. Hãy chỉnh sửa để khác biệt hơn.");
        } else if (error?.response?.status === 401 || apiMessage.includes("Unauthorized")) {
            showCustomNotification("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem('authToken');
            navigate('/Logins');
        } else if (error?.response?.status === 404 && apiMessage.includes("Không tìm thấy PriorityPackageRoom")) {
            console.log("No existing PriorityPackageRoom found, will create a new one.");
        } else {
            showCustomNotification("error", apiMessage || customMessage);
        }
    };

    // Fetch Initial Data
    useEffect(() => {
        if (!roomId) {
            showCustomNotification("error", "Không tìm thấy ID phòng!");
            navigate('/Room');
            return;
        }

        setLoading(true);
        Promise.all([
            CategoryRooms.getCategoryRooms(),
            BuildingServices.getBuildings(),
            RoomLandlordService.getRoom(roomId, user?.token),
            PriorityRoomService.getPriorityRooms().then(rooms =>
                rooms.find(room => room.roomId === parseInt(roomId)) || null
            ),
        ])
            .then(([categories, buildings, roomData, priorityRoom]) => {
                // console.log('API data:', { categories, buildings, roomData, priorityRoom });
                setCategoryRooms(categories);
                setBuildings(buildings);
                let images = [];
                try {
                    images = roomData.image ? JSON.parse(roomData.image) : [];
                } catch {
                    images = roomData.image ? [roomData.image] : [];
                }

                setRoom({
                    roomId: roomData.roomId || '',
                    buildingId: roomData.buildingId || null,
                    title: roomData.title || '',
                    description: roomData.description || '',
                    locationDetail: roomData.locationDetail || '',
                    acreage: roomData.acreage || 0,
                    furniture: roomData.furniture || '',
                    numberOfBathroom: roomData.numberOfBathroom || 0,
                    numberOfBedroom: roomData.numberOfBedroom || 0,
                    garret: roomData.garret || false,
                    price: roomData.price || 0,
                    categoryRoomId: roomData.categoryRoomId || 1,
                    note: roomData.note || '',
                    status: roomData.status || 1,
                    deposit: roomData.deposit || 0,
                    isPermission: roomData.isPermission ?? 1,
                    reputation: roomData.reputation || 0,
                    dien: roomData.dien || 0,
                    nuoc: roomData.nuoc || 0,
                    internet: roomData.internet || 0,
                    rac: roomData.rac || 0,
                    guiXe: roomData.guiXe || 0,
                    quanLy: roomData.quanLy || 0,
                    chiPhiKhac: roomData.chiPhiKhac || 0,
                    authorization: roomData.authorization || 0,
                    startDate: priorityRoom?.startDate || '',
                    endDate: priorityRoom?.endDate || '',
                    priorityPrice: priorityRoom?.price || 0,
                    categoryPriorityPackageRoomId: priorityRoom?.categoryPriorityPackageRoomId || 0,
                    duration: roomData.duration || 0,
                    priorityPackageRoomId: priorityRoom?.priorityPackageRoomId || null,
                });
                setExistingImages(images);
                setCurrentPriorityPackageId(priorityRoom?.categoryPriorityPackageRoomId || null);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                handleApiError(error, "Không thể lấy thông tin phòng!");
            })
            .finally(() => setLoading(false));
    }, [roomId, navigate, user?.token]);

    // Handle File Change
    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setLoading(true);
            try {
                const previews = selectedFiles.map(file => URL.createObjectURL(file));
                const checks = await Promise.all(
                    selectedFiles.map(async (file) => {
                        const result = await OtherService.checkImageAzure(file);
                        console.log(`Kiểm tra ảnh ${file.name}:`, result);
                        return {
                            isSafe: result.isSafe !== undefined ? result.isSafe : false,
                            message: result.message || "Không có thông tin kiểm tra."
                        };
                    })
                );
                const newInvalidImages = checks.map(result => !result.isSafe);

                setNewFiles(prev => [...prev, ...selectedFiles]);
                setNewPreviews(prev => [...prev, ...previews]);
                setInvalidImages(prev => [...prev, ...newInvalidImages]);

                if (newInvalidImages.some(invalid => invalid)) {
                    showCustomNotification("error", "Ảnh không phù hợp. Vui lòng kiểm tra và thay thế.");
                } else {
                    showCustomNotification("success", "Tất cả ảnh đã được kiểm tra và hợp lệ.");
                }
            } catch (error) {
                console.error('Lỗi trong handleFileChange:', error);
                showCustomNotification("error", error.message || "Lỗi khi kiểm tra ảnh.");
            } finally {
                setLoading(false);
            }
        }
    };

    // Remove File
    const handleRemoveFile = (index, isNew) => {
        if (isNew) {
            setNewFiles(prev => prev.filter((_, i) => i !== index));
            setNewPreviews(prev => prev.filter((_, i) => i !== index));
            setInvalidImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Upload File
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const data = await OtherService.uploadImage(formData);
        return data.imageUrl;
    };

    // Generate with AI
    const handleGenerateWithAI = async () => {
        setLoading(true);
        try {
            if (!user || !user.userId || !user.token) {
                showCustomNotification("error", "Bạn cần đăng nhập để thực hiện hành động này!");
                navigate('/Logins');
                return;
            }

            const roomData = {
                Title: room.title,
                Description: room.description,
                LocationDetail: room.locationDetail,
                Image: JSON.stringify(existingImages),
                Acreage: Number(room.acreage),
                Furniture: room.furniture || 'Không nội thất',
                NumberOfBedroom: Number(room.numberOfBedroom),
                NumberOfBathroom: Number(room.numberOfBathroom),
                Price: Number(room.price),
                Note: room.note,
                UserId: user.userId,
                BuildingId: room.buildingId,
                CategoryRoomId: Number(room.categoryRoomId),
                Garret: room.garret,
                IsPermission: room.isPermission,
                Deposit: Number(room.deposit),
                status: room.status,
                reputation: room.reputation,
                Dien: Number(room.dien),
                Nuoc: Number(room.nuoc),
                Internet: Number(room.internet),
                Rac: Number(room.rac),
                GuiXe: Number(room.guiXe),
                QuanLy: Number(room.quanLy),
                ChiPhiKhac: Number(room.chiPhiKhac),
                authorization: Number(room.authorization || 0),
                PriorityPackageRooms: [],
                RentalLists: []
            };

            if (roomData.Acreage <= 0) throw new Error('Diện tích phải lớn hơn 0.');
            if (roomData.Price <= 0) throw new Error('Giá phải lớn hơn 0.');
            if (!['Đầy đủ', 'Cơ bản', 'Không nội thất'].includes(roomData.Furniture)) {
                throw new Error('Vui lòng chọn nội thất hợp lệ.');
            }
            if (!roomData.LocationDetail) throw new Error('Địa chỉ không được để trống.');
            if (!roomData.UserId) throw new Error('UserId không được để trống.');

            const result = await RoomLandlordService.generateRoomDescription(roomData, user.token);
            setRoom(prev => ({
                ...prev,
                title: result.title || prev.title,
                description: result.description || prev.description,
            }));
            showCustomNotification("success", "Tạo tiêu đề và mô tả thành công với AI!");
        } catch (error) {
            handleApiError(error, "Lỗi khi tạo với AI!");
        } finally {
            setLoading(false);
        }
    };

    // Toggle Permission
    const handleTogglePermission = (type) => {
        setAction(type);
        setShowPopup(true);
    };

    const confirmTogglePermission = async () => {
        setShowPopup(false);
        setLoading(true);
        try {
            if (action === 'lock') {
                await RoomServices.lockRoom(roomId, user?.token);
                setRoom(prev => ({ ...prev, isPermission: 0 }));
                showCustomNotification("success", "Khóa phòng thành công!");
            } else if (action === 'unlock') {
                await RoomServices.unlockRoom(roomId, user?.token);
                setRoom(prev => ({ ...prev, isPermission: 1 }));
                showCustomNotification("success", "Mở khóa phòng thành công!");
            }
        } catch (error) {
            handleApiError(error, `Lỗi khi ${action === 'lock' ? 'khóa' : 'mở khóa'} phòng!`);
        } finally {
            setLoading(false);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    // Submit Form
    const handleSubmit = async () => {
        // Validate inputs
        if (!validateImages()) {
            showCustomNotification("error", "Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.");
            return;
        }
        if (existingImages.length + newFiles.length === 0) {
            showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
            return;
        }
        if (!room.title || room.title.length < 3) {
            showCustomNotification("error", "Tiêu đề phải ít nhất 3 ký tự!");
            return;
        }
        if (!room.description || room.description.length < 50) {
            showCustomNotification("error", "Mô tả phải ít nhất 50 ký tự!");
            return;
        }
        if (!room.furniture) {
            showCustomNotification("error", "Vui lòng chọn nội thất!");
            return;
        }
        if (!room.locationDetail) {
            showCustomNotification("error", "Địa chỉ không được để trống!");
            return;
        }
        if (!room.categoryRoomId || isNaN(room.categoryRoomId)) {
            showCustomNotification("error", "Vui lòng chọn loại phòng hợp lệ!");
            return;
        }
        if (!room.categoryPriorityPackageRoomId && room.categoryPriorityPackageRoomId !== 0) {
            showCustomNotification("error", "Vui lòng chọn gói ưu tiên!");
            return;
        }
        if (!currentPriorityPackageId && room.categoryPriorityPackageRoomId !== 0 && (!room.startDate || !room.endDate)) {
            showCustomNotification("error", "Vui lòng chọn ngày bắt đầu hợp lệ!");
            return;
        }

        // Validate user authentication
        if (!user || !user.userId || !user.token) {
            console.error('Authentication failed:', { user });
            showCustomNotification('error', 'Bạn cần đăng nhập để thực hiện hành động này!');
            navigate('/Logins');
            return;
        }

        setLoading(true);
        try {
            // Check balance for new paid packages
            if (!currentPriorityPackageId && room.priorityPrice > 0) {
                const checkBalanceData = { UserId: user.userId, Amount: room.priorityPrice };
                const balanceResponse = await BookingManagementService.checkBalance(checkBalanceData, user.token);
                const isBalanceSufficient =
                    (typeof balanceResponse === 'string' && balanceResponse === 'Bạn đủ tiền.') ||
                    (typeof balanceResponse === 'object' && balanceResponse.isSuccess);

                if (!isBalanceSufficient) {
                    showCustomNotification('error', 'Bạn không đủ tiền để thực hiện giao dịch này!');
                    navigate('/Moneys');
                    return;
                }

                const updateBalanceData = { UserId: user.userId, Amount: -room.priorityPrice };
                await BookingManagementService.updateBalance(updateBalanceData, user.token);
            }

            // Upload Images
            const uploadedImageUrls = await Promise.all(newFiles.map(uploadFile));
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];

            // Prepare Room Data
            const roomData = {
                title: room.title,
                description: room.description,
                locationDetail: room.locationDetail || '',
                acreage: Number(room.acreage),
                furniture: room.furniture || 'Không nội thất',
                numberOfBathroom: Number(room.numberOfBathroom),
                numberOfBedroom: Number(room.numberOfBedroom),
                garret: room.garret,
                price: Number(room.price),
                categoryRoomId: Number(room.categoryRoomId),
                note: room.note || '',
                buildingId: room.buildingId || null,
                image: JSON.stringify(finalImageUrls),
                status: room.status,
                deposit: Number(room.deposit),
                isPermission: room.isPermission,
                reputation: room.reputation,
                dien: Number(room.dien),
                nuoc: Number(room.nuoc),
                internet: Number(room.internet),
                rac: Number(room.rac),
                guiXe: Number(room.guiXe),
                quanLy: Number(room.quanLy),
                chiPhiKhac: Number(room.chiPhiKhac),
                authorization: Number(room.authorization || 0),
                PriorityPackageRooms: []
            };

            // Update Room
            await RoomLandlordService.updateRoom(roomId, roomData, user.token);

            // Handle Priority Room for new paid packages
            if (!currentPriorityPackageId && room.categoryPriorityPackageRoomId !== 0) {
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                };

                const priorityRoomData = {
                    roomId: roomId,
                    userId: user.userId,
                    categoryPriorityPackageRoomId: room.categoryPriorityPackageRoomId,
                    startDate: formatDate(room.startDate),
                    endDate: formatDate(room.endDate),
                    price: room.priorityPrice,
                    status: 1,
                };

                if (room.priorityPackageRoomId) {
                    await PriorityRoomService.updatePriorityRoom(room.priorityPackageRoomId, priorityRoomData);
                } else {
                    await PriorityRoomService.createPriorityRoom(priorityRoomData);
                }
            }

            showCustomNotification("success", "Cập nhật phòng thành công!");
            navigate('/Room');
        } catch (error) {
            console.error('Submit error:', error);
            handleApiError(error, "Không thể cập nhật phòng!");
        } finally {
            setLoading(false);
        }
    };

    // Validate Images
    const validateImages = () => {
        if (invalidImages.some(invalid => invalid)) {
            showCustomNotification("error", "Vui lòng thay thế các ảnh không phù hợp trước khi tiếp tục.");
            return false;
        }
        return true;
    };

    // Validate Step
    const validateStep = () => {
        if (step === 1) {
            const newErrors = {};
            if (!room.title) newErrors.title = 'Tiêu đề là bắt buộc';
            else if (room.title.length < 3) newErrors.title = 'Tiêu đề phải ít nhất 3 ký tự';
            if (!room.price || isNaN(Number(room.price)) || Number(room.price) <= 0) newErrors.price = 'Giá phải là số dương';
            if (!room.categoryRoomId) newErrors.categoryRoomId = 'Loại phòng là bắt buộc';
            if (!room.locationDetail) newErrors.locationDetail = 'Địa chỉ là bắt buộc';
            if (!room.acreage || isNaN(Number(room.acreage)) || Number(room.acreage) < 0) newErrors.acreage = 'Diện tích phải là số không âm';
            if (!room.furniture) newErrors.furniture = 'Nội thất là bắt buộc';
            if (room.numberOfBathroom < 0 || isNaN(Number(room.numberOfBathroom))) newErrors.numberOfBathroom = 'Số phòng tắm phải là số không âm';
            if (room.numberOfBedroom < 0 || isNaN(Number(room.numberOfBedroom))) newErrors.numberOfBedroom = 'Số giường ngủ phải là số không âm';
            if (!room.description) newErrors.description = 'Mô tả là bắt buộc';
            else if (room.description.length <= 50) newErrors.description = 'Mô tả phải trên 50 ký tự';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        if (step === 2) {
            if (existingImages.length + newFiles.length === 0) {
                showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
                return false;
            }
            if (!validateImages()) {
                return false;
            }
            setErrors(prev => ({ ...prev, images: '' }));
            return true;
        }
        return true;
    };

    // Navigation
    const handleNext = () => {
        if (validateStep()) {
            if (step < 3) {
                setStep(step + 1);
            } else {
                handleSubmit();
            }
        }
    };

    // Handle Back
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Increment/Decrement
    const handleIncrement = (field) => {
        setRoom(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }));
    };

    const handleDecrement = (field) => {
        setRoom(prev => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) - 1) }));
    };

    // Toggle Costs
    const toggleDropOpen = () => setIsDropOpen(prev => !prev);

    // Combined Previews
    const combinedPreviews = [
        ...existingImages.map(url => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({ url, isNew: true, index: idx, isInvalid: invalidImages[idx] }))
    ];

    return (
        <div className="flex min-h-screen bg-white">
            {loading && <Loading />}
            <SidebarUser />
            <div className="w-64 bg-white px-2 py-8 max-w-6xl mx-auto ml-56 h-full border-r border-gray-200">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Chỉnh Sửa Phòng</h1>
                <ul className="space-y-2">
                    {['Thông tin Phòng', 'Hình ảnh', 'Xác nhận'].map((label, idx) => (
                        <li key={idx} className={`text-lg ${step === idx + 1 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            Bước {idx + 1}: {label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-8">
                <StepConfirmation
                    step={step}
                    room={room}
                    setRoom={setRoom}
                    buildings={buildings}
                    categoryRooms={categoryRooms}
                    errors={errors}
                    roomId={roomId}
                    user={user}
                    existingImages={existingImages}
                    newFiles={newFiles}
                    newPreviews={newPreviews}
                    invalidImages={invalidImages}
                    combinedPreviews={combinedPreviews}
                    isDropOpen={isDropOpen}
                    previewImage={previewImage}
                    handleFileChange={handleFileChange}
                    handleRemoveFile={handleRemoveFile}
                    handleGenerateWithAI={handleGenerateWithAI}
                    handleIncrement={handleIncrement}
                    handleDecrement={handleDecrement}
                    toggleDropOpen={toggleDropOpen}
                    setPreviewImage={setPreviewImage}
                    handleBack={handleBack}
                    handleNext={handleNext}
                    handleSubmit={handleSubmit}
                    handleTogglePermission={handleTogglePermission}
                    showPopup={showPopup}
                    action={action}
                    confirmTogglePermission={confirmTogglePermission}
                    closePopup={closePopup}
                    currentPriorityPackageId={currentPriorityPackageId}
                />
            </div>
        </div>
    );
};

export default RoomEdit;