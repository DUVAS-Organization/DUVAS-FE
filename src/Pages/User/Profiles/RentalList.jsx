import { useState, useEffect } from "react";
import SidebarUser from "../../../Components/Layout/SidebarUser";
import BookingManagementService from "../../../Services/Landlord/BookingManagementService";
import { useAuth } from "../../../Context/AuthProvider";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaFileContract, FaMapMarkerAlt, FaMoneyBillWave, FaStar } from "react-icons/fa";
import UserRentRoomService from "../../../Services/User/UserRentRoomService";
import { useNavigate } from "react-router-dom";
import Loading from "../../../Components/Loading";
import OtherService from "../../../Services/User/OtherService";
import UserService from '../../../Services/User/UserService';
import { showCustomNotification } from "../../../Components/Notification";

export default function RentalList() {
    const [pendingRentals, setPendingRentals] = useState([]);
    const [waitingLandlordRentals, setWaitingLandlordRentals] = useState([]);
    const [rentingRooms, setRentingRooms] = useState([]);
    const [rentedRooms, setRentedRooms] = useState([]);
    const [cancelledRooms, setCancelledRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [contractId, setContractId] = useState(null);
    const [showReportPopup, setShowReportPopup] = useState(false);
    const [reportContent, setReportContent] = useState("");
    const [images, setImages] = useState([]);
    const [reviewedRooms, setReviewedRooms] = useState(() => {
        const savedReviews = localStorage.getItem('reviewedRooms');
        return savedReviews ? JSON.parse(savedReviews) : [];
    });

    useEffect(() => {
        const fetchRentals = async () => {
            setLoading(true);
            try {
                const list = await BookingManagementService.getRentalListOfUser(user.userId, user.token);

                const waitingLandlord = [];
                const pendingTrans = [];
                const rentingRoomsArr = [];
                const rentedRoomsArr = [];
                const cancelledRoomsArr = [];

                list.forEach(r => {
                    if (r.rentalStatus === 1 && !r.contractId && r.roomStatus === 1) {
                        waitingLandlord.push(r);
                        return;
                    }
                    if (r.contractId && r.contractStatus === 4) {
                        pendingTrans.push(r);
                        return;
                    }
                    if (r.contractId && r.contractStatus === 1 && r.roomStatus === 3 && r.rentalStatus === 1) {
                        rentingRoomsArr.push(r);
                        return;
                    }
                    if (r.contractId && r.contractStatus === 3 && r.roomStatus === 1 && r.rentalStatus === 1) {
                        rentedRoomsArr.push(r);
                        return;
                    }
                    if (r.rentalStatus === 2 || r.contractStatus === 2) {
                        cancelledRoomsArr.push(r);
                        return;
                    }
                    cancelledRoomsArr.push(r);
                });

                setWaitingLandlordRentals(waitingLandlord);
                setPendingRentals(pendingTrans);
                setRentingRooms(rentingRoomsArr);
                setRentedRooms(rentedRoomsArr);
                setCancelledRooms(cancelledRoomsArr);

            } catch (error) {
                console.error("❌ [FE] Error fetching rental list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRentals();
    }, [user?.userId, user?.token]);

    const addReport = async () => {
        if (!reportContent.trim()) {
            showCustomNotification("warning", "Vui lòng nhập nội dung báo cáo!");
            return;
        }
        setLoading(true);
        try {
            const uploadedImageUrls = await Promise.all(images.map(file => uploadFile(file)));
            const report = {
                'RoomId': roomId,
                'Image': JSON.stringify(uploadedImageUrls),
                'ReportContent': reportContent,
            };
            if ((await UserService.addReport(report)).status === 200) {
                showCustomNotification("success", "Báo cáo thành công.");
                setShowReportPopup(false);
                setReportContent("");
                setImages([]);
            }
        } catch (error) {
            showCustomNotification("error", "Có lỗi xảy ra khi gửi báo cáo!");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        setImages(files);
    };

    const handleSelectRental = (rentalId) => {
        const rental = [...pendingRentals, ...waitingLandlordRentals, ...rentingRooms, ...rentedRooms, ...cancelledRooms]
            .find(r => r.rentalId === rentalId);

        if (rental) {
            setSelectedRoom({
                rentalList: {
                    rentalId: rental.rentalId,
                    roomId: rental.roomId,
                    renterID: rental.renterID,
                    rentalStatus: rental.rentalStatus,
                    createdDate: rental.createdDate,
                    monthForRent: rental.monthForRent,
                    rentDate: rental.rentDate,
                    scheduledActionDate: rental.scheduledActionDate
                },
                room: rental.roomDetails,
                contract: rental.contractDetails
            });
        } else {
            console.error(`❌ [FE] Rental with rentalId ${rentalId} not found.`);
            setSelectedRoom(null);
        }
    };

    const handleConfirmRental = async () => {
        try {
            const rentalId = selectedRoom?.rentalList?.rentalId;
            const roomPrice = selectedRoom?.room?.price || 0;
            const landlordId = selectedRoom?.room?.landlordId;

            const checkBalanceData = { UserId: user.userId, Amount: roomPrice };
            const balanceResponse = await BookingManagementService.checkBalance(checkBalanceData, user.token);

            if (balanceResponse !== "Bạn đủ tiền.") {
                setSuccessMessage("Bạn không đủ tiền. Vui lòng nạp thêm tiền để tiếp tục.");
                setShowSuccessPopup(true);
                setShowConfirmPopup(false);
                return;
            }

            const updateBalanceData = { UserId: user.userId, Amount: -roomPrice };
            await BookingManagementService.updateBalance(updateBalanceData, user.token);

            const insiderTradingData = {
                Remitter: user.userId,
                Receiver: landlordId,
                Money: roomPrice
            };
            const insiderTradingResponse = await BookingManagementService.firstMonthInsiderTrading(insiderTradingData, user.token);

            const actionDate = new Date().toISOString();
            const insiderTradingId = insiderTradingResponse.InsiderTradingId || 0;
            await BookingManagementService.scheduleAction(actionDate, landlordId, roomPrice, insiderTradingId, user.token);

            await UserRentRoomService.confirmRental(rentalId, user.token);

            setSelectedRoom(prev => ({
                ...prev,
                rentalList: { ...prev.rentalList, scheduledActionDate: actionDate }
            }));

            setSuccessMessage("Xác nhận thuê phòng thành công!");
            setShowSuccessPopup(true);
            setShowConfirmPopup(false);

            const rentalList = await BookingManagementService.getRentalListOfUser(user.userId, user.token);
            updateRentalStates(rentalList);
            setSelectedRoom(null);
        } catch (error) {
            setSuccessMessage("Có lỗi xảy ra khi xác nhận thuê phòng: " + error.message);
            setShowSuccessPopup(true);
            setShowConfirmPopup(false);
        }
    };

    const handleCancelRental = async () => {
        try {
            const rentalId = selectedRoom?.rentalList?.rentalId;

            const actionDate = selectedRoom?.rentalList?.scheduledActionDate;
            if (!actionDate) {
                console.log("[FE] Không có hành động nào được lên lịch để hủy.");
            } else {
                const cancelData = { actionDate };
                console.log("[FE] Dữ liệu hủy gửi đi:", cancelData);
                await BookingManagementService.cancelScheduledAction(cancelData, user.token);
                console.log("🛑 [FE] Đã hủy lịch giữ tiền.");
            }

            await UserRentRoomService.cancelRental(rentalId, user.token);
            setSuccessMessage("Hủy thuê phòng thành công!");
            setShowSuccessPopup(true);
            setShowCancelPopup(false);

            const rentalList = await BookingManagementService.getRentalListOfUser(user.userId, user.token);
            updateRentalStates(rentalList);
            setSelectedRoom(null);
        } catch (error) {
            setSuccessMessage("Có lỗi xảy ra khi hủy thuê phòng: " + error.message);
            setShowSuccessPopup(true);
            setShowCancelPopup(false);
        }
    };

    const updateRentalStates = (rentalList) => {
        const waitingLandlordFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 && rental.roomStatus === 1 && (!rental.contractStatus || rental.contractStatus !== 3)
        );
        const pendingFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 && rental.roomStatus === 2 && rental.contractStatus === 4
        );
        const rentingFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 && rental.roomStatus === 3 && rental.contractStatus === 1
        );
        const rentedFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 && rental.roomStatus === 1 && rental.contractStatus === 3
        );
        const cancelledFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 2 && rental.contractStatus === 2
        );

        setWaitingLandlordRentals(waitingLandlordFiltered);
        setPendingRentals(pendingFiltered);
        setRentingRooms(rentingFiltered);
        setRentedRooms(rentedFiltered);
        setCancelledRooms(cancelledFiltered);
    };

    const getRoomStatus = () => {
        if (!selectedRoom || !selectedRoom.rentalList || !selectedRoom.room) return "Không xác định";

        const rentalStatus = selectedRoom.rentalList.rentalStatus;
        const roomStatus = selectedRoom.room.status;
        const cStatus = selectedRoom.contract?.status;

        if (rentalStatus === 1 && roomStatus === 3 && cStatus === 1) return "Phòng này đang cho thuê";
        if (rentalStatus === 1 && roomStatus === 1) {
            if (cStatus === 3) return "Phòng này đang cho thuê";
            return "Đang chờ giao dịch";
        }
        if (rentalStatus === 1 && roomStatus === 2 && cStatus === 4) return "Chờ Người dùng xác nhận";
        if (rentalStatus === 2 && cStatus === 2) return "Đã hủy";
        return "Không xác định";
    };

    const handleImageSelection = (event) => {
        const files = Array.from(event.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
        setSelectedImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const data = await OtherService.uploadImage(formData);
            return data.imageUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            showCustomNotification("warning", "Có lỗi khi upload ảnh!");
            throw error;
        }
    };

    const uploadImages = async () => {
        const uploadPromises = selectedImages.map(file => uploadFile(file));
        return await Promise.all(uploadPromises);
    };

    const submitReview = async () => {
        if (rating === 0) {
            showCustomNotification("warning", "Vui lòng chọn số sao để đánh giá!");
            return;
        }
        setLoading(true);
        try {
            const uploadedUrls = await uploadImages();
            const finalImage = JSON.stringify([...existingImages, ...uploadedUrls]);
            const feedbackBody = {
                comment,
                star: rating,
                image: finalImage,
                roomId: selectedRoom.room.roomId,
                contractId: selectedRoom.contract.contractId
            };
            const response = await UserRentRoomService.sendFeedback(feedbackBody);
            if (response.status === 200) {
                showCustomNotification("success", "Đánh giá của bạn đã được gửi");
                setReviewedRooms(prev => {
                    const updatedReviews = [...prev, selectedRoom.room.roomId];
                    localStorage.setItem('reviewedRooms', JSON.stringify(updatedReviews));
                    return updatedReviews;
                });
                setShowReviewModal(false);
                setComment("");
                setRating(0);
                setPreviewImages([]);
                setSelectedImages([]);
            } else {
                showCustomNotification("error", "Gửi đánh giá thất bại, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("❌ Lỗi khi gửi đánh giá:", error.response?.data || error.message);
            showCustomNotification("error", "Không thể gửi đánh giá, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = () => {
        setComment("");
        setRating(0);
        setPreviewImages([]);
        setSelectedImages([]);
        setShowReviewModal(true);
    };

    if (loading) return <div className="flex justify-center items-center h-screen">
        <Loading />
    </div>;

    return (
        <div className="bg-white dark:bg-gray-800 dark:text-white">
            <SidebarUser />
            <div className="mx-auto ml-56 max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-1 bg-white p-4 rounded-xl shadow-lg dark:bg-gray-800 ">
                        <h2 className="text-2xl font-bold text-black mb-4 dark:text-white">Danh sách phòng</h2>

                        <h3 className="text-lg font-bold text-yellow-600 mb-2">Đang chờ giao dịch</h3>
                        {pendingRentals.length > 0 ? pendingRentals.map(room => (
                            <motion.div key={room.rentalId} whileHover={{ scale: 1.05 }}
                                className={`p-4 dark:bg-gray-800 dark:text-white border rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-yellow-300' : 'bg-gray-50 hover:bg-yellow-200'}`}
                                onClick={() => handleSelectRental(room.rentalId)}>
                                <p className="font-semibold text-yellow-700">Phòng #{room.roomId}</p>
                                <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                            </motion.div>
                        )) : <p className="text-gray-500 dark:text-white">Không có phòng nào đang chờ giao dịch.</p>}

                        <h3 className="text-lg font-bold text-orange-600 mt-4 mb-2">Chờ Chủ phòng xác nhận</h3>
                        {waitingLandlordRentals.length > 0 ? waitingLandlordRentals.map(room => (
                            <motion.div key={room.rentalId} whileHover={{ scale: 1.05 }}
                                className={`p-4 border dark:bg-gray-800 dark:text-white rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-orange-300' : 'bg-gray-50 hover:bg-orange-200'}`}
                                onClick={() => handleSelectRental(room.rentalId)}>
                                <p className="font-semibold text-orange-700">Phòng #{room.roomId}</p>
                                <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                            </motion.div>
                        )) : <p className="text-gray-500 dark:text-white">Không có phòng nào chờ chủ phòng xác nhận.</p>}

                        <h3 className="text-lg font-bold text-blue-700 mt-4 mb-2">Đang thuê</h3>
                        {rentingRooms.length > 0 ? rentingRooms.map(room => (
                            <motion.div key={room.rentalId} whileHover={{ scale: 1.05 }}
                                className={`p-4 border dark:bg-gray-800 dark:text-white rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-blue-300' : 'bg-gray-50 hover:bg-blue-200'}`}
                                onClick={() => handleSelectRental(room.rentalId)}>
                                <p className="font-semibold text-blue-700">Phòng #{room.roomId}</p>
                                <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                            </motion.div>
                        )) : <p className="text-gray-500 dark:text-white">Không có phòng nào đang thuê.</p>}

                        <h3 className="text-lg font-bold text-green-700 mt-4 mb-2">Đã thuê</h3>
                        {rentedRooms.length > 0 ? rentedRooms.map(room => (
                            <motion.div key={room.rentalId} whileHover={{ scale: 1.05 }}
                                className={`p-4 border dark:bg-gray-800 dark:text-white rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-green-300' : 'bg-gray-50 hover:bg-green-200'}`}
                                onClick={() => handleSelectRental(room.rentalId)}>
                                <p className="font-semibold text-green-700">Phòng #{room.roomId}</p>
                                <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                            </motion.div>
                        )) : <p className="text-gray-500 dark:text-white">Không có phòng nào đã thuê.</p>}

                        <h3 className="text-lg font-bold text-red-700 mt-4 mb-2">Đã hủy</h3>
                        {cancelledRooms.length > 0 ? cancelledRooms.map(room => (
                            <motion.div key={room.rentalId} whileHover={{ scale: 1.05 }}
                                className={`p-4 border dark:bg-gray-800 dark:text-white rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-red-300' : 'bg-gray-50 hover:bg-red-200'}`}
                                onClick={() => handleSelectRental(room.rentalId)}>
                                <p className="font-semibold text-red-700">Phòng #{room.roomId}</p>
                                <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                            </motion.div>
                        )) : <p className="text-gray-500 dark:text-white">Không có phòng nào đã bị hủy.</p>}
                    </div>

                    <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white p-8 rounded-xl shadow-lg dark:bg-gray-800 dark:text-white">
                        {selectedRoom ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <img
                                    src={selectedRoom.room?.image ? JSON.parse(selectedRoom.room.image)[0] : "https://via.placeholder.com/600"}
                                    alt={selectedRoom.room?.title || "Không có tiêu đề"}
                                    className="w-full h-52 object-cover rounded-xl mb-4"
                                />
                                <h2 className="text-2xl font-bold text-red-600 mb-2">{selectedRoom.room?.title || "Không có tiêu đề"}</h2>
                                <p className="text-lg font-semibold flex items-center dark:bg-gray-800 dark:text-white">
                                    <FaMoneyBillWave className="text-green-600 mr-2" />
                                    Giá: {selectedRoom.room?.price ? selectedRoom.room.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center dark:bg-gray-800 dark:text-white">
                                    <FaMapMarkerAlt className="text-green-600 mr-2" />
                                    Địa chỉ: {selectedRoom.room?.locationDetail || "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center dark:bg-gray-800 dark:text-white">
                                    <FaCalendarAlt className="text-gray-500 mr-2" />
                                    Ngày thuê: {selectedRoom.rentalList?.rentDate ? new Date(selectedRoom.rentalList.rentDate).toLocaleDateString() : "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center dark:bg-gray-800 dark:text-white">
                                    <FaCalendarAlt className="text-gray-500 mr-2" />
                                    Ngày hết hạn: {selectedRoom.rentalList?.rentDate && selectedRoom.rentalList?.monthForRent ? (() => {
                                        const startDate = new Date(selectedRoom.rentalList.rentDate);
                                        const endDate = new Date(startDate.setMonth(startDate.getMonth() + selectedRoom.rentalList.monthForRent));
                                        return endDate.toLocaleDateString();
                                    })() : "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center dark:bg-gray-800 dark:text-white">
                                    <FaFileContract className="text-red-600 mr-2" />
                                    Trạng thái hợp đồng: {selectedRoom.contract?.status === 4 ? "Đang chờ giao dịch" :
                                        selectedRoom.contract?.status === 1 ? "Đang thuê" :
                                            selectedRoom.contract?.status === 3 ? "Đã thuê" :
                                                selectedRoom.contract?.status === 2 ? "Đã hủy" :
                                                    selectedRoom.contract?.status === undefined && selectedRoom.rentalList?.rentalStatus === 1 && selectedRoom.room?.status === 1 ?
                                                        <span className='text-gray-500 ml-0.5 dark:text-white'>Chờ Chủ phòng xác nhận</span> : <span className='text-gray-500 ml-0.5'>Không xác định</span>}
                                </p>
                                <p className="text-gray-700 flex items-center dark:bg-gray-800 dark:text-white">
                                    <FaFileContract className="text-red-600 mr-2" />
                                    Hợp đồng: {selectedRoom.contract?.contractFile ? (
                                        <a href={selectedRoom.contract.contractFile} className="text-blue-500 underline ml-2" target="_blank" rel="noopener noreferrer">Xem hợp đồng</a>
                                    ) : selectedRoom.contract?.status === undefined && selectedRoom.rentalList?.rentalStatus === 1 && selectedRoom.room?.status === 1 ?
                                        <span className='text-gray-500 ml-0.5 dark:text-white'>Chờ Chủ phòng tạo hợp đồng</span> : <span className='text-gray-500 ml-0.5'>Không có hợp đồng</span>}
                                </p>
                                {selectedRoom.contract?.status === 3 && (
                                    <div className="mt-4 flex space-x-4">
                                        <button
                                            onClick={openReviewModal}
                                            className={`px-4 py-2 rounded-lg transition text-white ${reviewedRooms.includes(selectedRoom.room.roomId)
                                                ? "bg-green-300 opacity-50 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                                }`}
                                            disabled={reviewedRooms.includes(selectedRoom.room.roomId)}
                                        >
                                            Đánh Giá
                                        </button>
                                        <button
                                            onClick={() => { setShowReportPopup(true); setRoomId(selectedRoom.room.roomId); }}
                                            className="text-red-500 px-3 py-2 rounded-md text-base font-medium border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
                                        >
                                            Báo cáo!
                                        </button>
                                    </div>
                                )}
                                {selectedRoom.contract?.status === 4 && (
                                    <div className="mt-4 flex space-x-4">
                                        <button onClick={() => { setShowConfirmPopup(true); }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Xác nhận</button>
                                        <button onClick={() => { setShowCancelPopup(true); }}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Hủy</button>
                                    </div>
                                )}
                                {selectedRoom.contract?.status === 1 && (
                                    <button
                                        onClick={() => { setShowReportPopup(true); setRoomId(selectedRoom.room.roomId); }}
                                        className="text-red-500 px-3 py-2 rounded-md text-base font-medium border border-red-400 hover:bg-red-500 hover:text-white transition-colors duration-150"
                                    >
                                        Báo cáo!
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <p className="text-center text-gray-500 dark:bg-gray-800 dark:text-white">Chọn một phòng để xem chi tiết</p>
                        )}
                    </div>
                </div>
            </div>

            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                        <h3 className="text-lg font-bold mb-4">Xác nhận thuê phòng</h3>

                        <ul className="list-disc list-inside text-gray-800 mb-3 space-y-1">
                            <li>Sau khi nhấn "Xác nhận" sẽ hoàn tất quá trình thuê phòng.</li>
                            <li>Phòng sẽ được đánh dấu là “Đang thuê” và bạn sẽ không thể hoàn tác.</li>
                            <li>Vui lòng kiểm tra kỹ thông tin hợp đồng trước khi tiếp tục.</li>
                        </ul>
                        {/* <p className="mb-4">Bạn có chắc chắn muốn xác nhận thuê phòng này?</p> */}
                        <div className="flex justify-between">
                            <button onClick={() => { setShowConfirmPopup(false); }}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition">Hủy</button>
                            <button onClick={handleConfirmRental}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {showCancelPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Hủy thuê phòng</h3>
                        <p className="mb-4">Bạn có chắc chắn muốn hủy thuê phòng này không?</p>
                        <div className="flex justify-between">
                            <button onClick={() => { setShowCancelPopup(false); }}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition">Hủy</button>
                            <button onClick={handleCancelRental}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">{successMessage.includes("thành công") ? "Thành công" : "Lỗi"}</h3>
                        <p className="mb-4">{successMessage}</p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setShowSuccessPopup(false);
                                    if (successMessage.includes("không đủ tiền")) navigate("/Moneys");
                                }}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-[500px] max-h-[800px] overflow-y-auto relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <Loading />
                            </div>
                        )}

                        <h3 className="text-xl font-bold mb-4">Đánh Giá Phòng</h3>

                        <div className="flex mb-4">
                            {[...Array(5)].map((_, index) => {
                                const starValue = index + 1;
                                return (
                                    <FaStar
                                        key={index}
                                        className={`cursor-pointer text-2xl ${starValue <= (hover || rating) ? "text-yellow-500" : "text-gray-300"}`}
                                        onMouseEnter={() => setHover(starValue)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(starValue)}
                                    />
                                );
                            })}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Vui lòng chọn số sao (bắt buộc)</p>

                        <textarea
                            className="w-full border rounded-lg p-2 mb-4"
                            rows="3"
                            placeholder="Nhập đánh giá của bạn... (không bắt buộc)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>

                        <label className="block mb-2 font-medium text-gray-700">Hình ảnh (không bắt buộc):</label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageSelection}
                            />
                            <p className="text-gray-500">
                                Kéo và thả ảnh vào đây hoặc <span className="text-green-500 font-semibold">chọn ảnh</span>
                            </p>
                            <p className="text-sm text-gray-400 mt-1">.jpg, .png, .gif</p>
                        </div>

                        {previewImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                {previewImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img}
                                            alt="Uploaded"
                                            className="w-full h-20 object-cover rounded-lg shadow-sm"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between mt-6 sticky bottom-0 bg-white pt-4">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={submitReview}
                                className={`px-6 py-2 rounded-lg text-white transition ${rating === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                                disabled={rating === 0}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReportPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg min-w-[600px] max-w-[800px] max-h-[80vh] overflow-y-auto relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <Loading />
                            </div>
                        )}

                        <h3 className="text-lg font-bold mb-4">Báo cáo</h3>
                        <p className="mb-4 text-gray-600">Báo cáo về những gì bạn gặp trong quá trình thuê phòng.</p>

                        <label className="block mb-2 font-medium text-gray-700">Nội dung (bắt buộc):</label>
                        <textarea
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            rows="4"
                            placeholder="Nhập nội dung báo cáo..."
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                        ></textarea>

                        <label className="block mt-4 mb-2 font-medium text-gray-700">Hình ảnh (không bắt buộc):</label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-gray-500">
                                Kéo và thả ảnh vào đây hoặc <span className="text-blue-500 font-semibold">chọn ảnh</span>
                            </p>
                            <p className="text-sm text-gray-400 mt-1">Hỗ trợ nhiều ảnh</p>
                        </div>

                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={img.name}
                                            className="w-full h-24 object-cover rounded-md shadow-sm"
                                        />
                                        <button
                                            onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                        <p className="text-xs text-gray-600 mt-1 truncate">{img.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between mt-6 sticky bottom-0 bg-white pt-4">
                            <button
                                onClick={() => setShowReportPopup(false)}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={addReport}
                                className={`px-6 py-2 rounded-lg text-white transition flex items-center justify-center ${!reportContent.trim() || loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                                disabled={!reportContent.trim()}
                            >
                                Báo cáo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}