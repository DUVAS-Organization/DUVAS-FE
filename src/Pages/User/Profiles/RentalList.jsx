import { useState, useEffect } from "react";
import SidebarUser from "../../../Components/Layout/SidebarUser";
import BookingManagementService from "../../../Services/Landlord/BookingManagementService";
import { useAuth } from "../../../Context/AuthProvider";
import { motion } from "framer-motion";
import { FaBath, FaBed, FaCalendarAlt, FaCouch, FaFileContract, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import UserRentRoomService from "../../../Services/User/UserRentRoomService";

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

    useEffect(() => {
        console.log("🔎 selectedRoom updated:", selectedRoom);
    }, [selectedRoom]);

    useEffect(() => {
        if (!user?.userId || !user?.token) return;

        const fetchRentals = async () => {
            try {
                setLoading(true);
                const rentalList = await BookingManagementService.getRentalListOfUser(user.userId, user.token);
                console.log("📌 API Response (Rental List):", rentalList);

                const waitingLandlordFiltered = rentalList.filter(rental =>
                    rental.rentalStatus === 1 &&
                    rental.roomStatus === 1 &&
                    (!rental.contractStatus || rental.contractStatus !== 3)
                );

                const pendingFiltered = rentalList.filter(rental =>
                    rental.rentalStatus === 1 &&
                    rental.roomStatus === 2 &&
                    rental.contractStatus === 4
                );

                const rentingFiltered = rentalList.filter(rental =>
                    rental.rentalStatus === 1 &&
                    rental.roomStatus === 3 &&
                    rental.contractStatus === 1
                );

                const rentedFiltered = rentalList.filter(rental =>
                    rental.rentalStatus === 1 &&
                    rental.roomStatus === 1 &&
                    rental.contractStatus === 3
                );

                const cancelledFiltered = rentalList.filter(rental =>
                    rental.rentalStatus === 2 &&
                    rental.contractStatus === 2
                );

                setWaitingLandlordRentals(waitingLandlordFiltered);
                setPendingRentals(pendingFiltered);
                setRentingRooms(rentingFiltered);
                setRentedRooms(rentedFiltered);
                setCancelledRooms(cancelledFiltered);
            } catch (error) {
                console.error("❌ Error fetching rental list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRentals();
    }, [user?.userId, user?.token]);

    const handleSelectRental = (rentalId) => {
        // Tìm rental trong danh sách đã lấy từ GetRentalListOfUser
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
                    rentDate: rental.rentDate
                },
                room: rental.roomDetails,
                contract: rental.contractDetails
            });
        } else {
            console.error(`❌ Rental with rentalId ${rentalId} not found.`);
            setSelectedRoom(null);
        }
    };

    const handleConfirmRental = async () => {
        try {
            console.log("➡️ Xác nhận thuê phòng với rentalId:", selectedRoom?.rentalList?.rentalId);
            await UserRentRoomService.confirmRental(selectedRoom.rentalList.rentalId, user.token);
            setSuccessMessage("Xác nhận thuê phòng thành công!");
            setShowSuccessPopup(true);
            setShowConfirmPopup(false);

            const rentalList = await BookingManagementService.getRentalListOfUser(user.userId, user.token);
            updateRentalStates(rentalList);
            setSelectedRoom(null);
        } catch (error) {
            console.error("❌ Error confirming rental:", error);
            setSuccessMessage("Có lỗi xảy ra khi xác nhận thuê phòng.");
            setShowSuccessPopup(true);
        }
    };

    const handleCancelRental = async () => {
        try {
            console.log("➡️ Hủy thuê phòng với rentalId:", selectedRoom?.rentalList?.rentalId);
            await UserRentRoomService.cancelRental(selectedRoom.rentalList.rentalId, user.token);
            setSuccessMessage("Hủy thuê phòng thành công!");
            setShowSuccessPopup(true);
            setShowCancelPopup(false);

            const rentalList = await BookingManagementService.getRentalListOfUser(user.userId, user.token);
            updateRentalStates(rentalList);
            setSelectedRoom(null);
        } catch (error) {
            console.error("❌ Error cancelling rental:", error);
            setSuccessMessage("Có lỗi xảy ra khi hủy thuê phòng.");
            setShowSuccessPopup(true);
        }
    };

    const updateRentalStates = (rentalList) => {
        const waitingLandlordFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 &&
            rental.roomStatus === 1 &&
            (!rental.contractStatus || rental.contractStatus !== 3)
        );
        const pendingFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 &&
            rental.roomStatus === 2 &&
            rental.contractStatus === 4
        );
        const rentingFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 &&
            rental.roomStatus === 3 &&
            rental.contractStatus === 1
        );
        const rentedFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 1 &&
            rental.roomStatus === 1 &&
            rental.contractStatus === 3
        );
        const cancelledFiltered = rentalList.filter(rental =>
            rental.rentalStatus === 2 &&
            rental.contractStatus === 2
        );

        console.log("🔄 Updated rental states:", { waitingLandlordFiltered, pendingFiltered, rentingFiltered, rentedFiltered, cancelledFiltered });
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

        if (rentalStatus === 1 && roomStatus === 3 && cStatus === 1) {
            return "Phòng này đang cho thuê";
        }
        if (rentalStatus === 1 && roomStatus === 1) {
            if (cStatus === 3) {
                return "Phòng này đang cho thuê";
            }
            return "Đang chờ giao dịch";
        }
        else if (rentalStatus === 1 && roomStatus === 2 && cStatus === 4) {
            return "Chờ Người dùng xác nhận";
        }
        else if (rentalStatus === 2 && cStatus === 2) {
            return "Đã hủy";
        }
        return "Không xác định";
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
    }

    return (
        <div className="bg-white">
            <SidebarUser />
            <div className="mx-auto ml-56 max-w-6xl">
                <div className="grid grid-cols-3 gap-6">
                    {/* Danh sách phòng */}
                    <div className="col-span-1 bg-white p-4 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Danh sách phòng</h2>

                        {/* Đang chờ giao dịch */}
                        <h3 className="text-lg font-bold text-yellow-600 mb-2">Đang chờ giao dịch</h3>
                        {pendingRentals.length > 0 ? (
                            pendingRentals.map((room) => (
                                <motion.div
                                    key={room.rentalId}
                                    whileHover={{ scale: 1.05 }}
                                    className={`p-4 border rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-yellow-300' : 'bg-gray-50 hover:bg-yellow-200'}`}
                                    onClick={() => handleSelectRental(room.rentalId)}
                                >
                                    <p className="font-semibold text-yellow-700">Phòng #{room.roomId}</p>
                                    <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500">Không có phòng nào đang chờ giao dịch.</p>
                        )}

                        {/* Chờ Chủ phòng xác nhận */}
                        <h3 className="text-lg font-bold text-orange-600 mt-4 mb-2">Chờ Chủ phòng xác nhận</h3>
                        {waitingLandlordRentals.length > 0 ? (
                            waitingLandlordRentals.map((room) => (
                                <motion.div
                                    key={room.rentalId}
                                    whileHover={{ scale: 1.05 }}
                                    className={`p-4 border rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-orange-300' : 'bg-gray-50 hover:bg-orange-200'}`}
                                    onClick={() => handleSelectRental(room.rentalId)}
                                >
                                    <p className="font-semibold text-orange-700">Phòng #{room.roomId}</p>
                                    <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500">Không có phòng nào chờ chủ phòng xác nhận.</p>
                        )}

                        {/* Đang thuê */}
                        <h3 className="text-lg font-bold text-blue-700 mt-4 mb-2">Đang thuê</h3>
                        {rentingRooms.length > 0 ? (
                            rentingRooms.map((room) => (
                                <motion.div
                                    key={room.rentalId}
                                    whileHover={{ scale: 1.05 }}
                                    className={`p-4 border rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-blue-300' : 'bg-gray-50 hover:bg-blue-200'}`}
                                    onClick={() => handleSelectRental(room.rentalId)}
                                >
                                    <p className="font-semibold text-blue-700">Phòng #{room.roomId}</p>
                                    <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500">Không có phòng nào đang thuê.</p>
                        )}

                        {/* Đã thuê */}
                        <h3 className="text-lg font-bold text-green-700 mt-4 mb-2">Đã thuê</h3>
                        {rentedRooms.length > 0 ? (
                            rentedRooms.map((room) => (
                                <motion.div
                                    key={room.rentalId}
                                    whileHover={{ scale: 1.05 }}
                                    className={`p-4 border rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-green-300' : 'bg-gray-50 hover:bg-green-200'}`}
                                    onClick={() => handleSelectRental(room.rentalId)}
                                >
                                    <p className="font-semibold text-green-700">Phòng #{room.roomId}</p>
                                    <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500">Không có phòng nào đã thuê.</p>
                        )}

                        {/* Đã hủy */}
                        <h3 className="text-lg font-bold text-red-700 mt-4 mb-2">Đã hủy</h3>
                        {cancelledRooms.length > 0 ? (
                            cancelledRooms.map((room) => (
                                <motion.div
                                    key={room.rentalId}
                                    whileHover={{ scale: 1.05 }}
                                    className={`p-4 border rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.rentalList?.rentalId === room.rentalId ? 'bg-red-300' : 'bg-gray-50 hover:bg-red-200'}`}
                                    onClick={() => handleSelectRental(room.rentalId)}
                                >
                                    <p className="font-semibold text-red-700">Phòng #{room.roomId}</p>
                                    <p>Ngày thuê: {new Date(room.rentDate).toLocaleDateString()}</p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500">Không có phòng nào đã bị hủy.</p>
                        )}
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="col-span-2 bg-white p-8 rounded-xl shadow-lg">
                        {selectedRoom ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <img
                                    src={selectedRoom.room?.image ? JSON.parse(selectedRoom.room.image)[0] : "https://via.placeholder.com/600"}
                                    alt={selectedRoom.room?.title || "Không có tiêu đề"}
                                    className="w-full h-52 object-cover rounded-xl mb-4"
                                />
                                <h2 className="text-2xl font-bold text-red-600 mb-2">
                                    {selectedRoom.room?.title || "Không có tiêu đề"}
                                </h2>
                                <p className="text-lg font-semibold flex items-center">
                                    <FaMoneyBillWave className="text-green-600 mr-2" />
                                    Giá: {selectedRoom.room?.price ? selectedRoom.room.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center">
                                    <FaMapMarkerAlt className="text-green-600 mr-2" />
                                    Địa chỉ: {selectedRoom.room?.locationDetail || "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center">
                                    <FaCalendarAlt className="text-gray-500 mr-2" />
                                    Ngày thuê: {selectedRoom.rentalList?.rentDate ? new Date(selectedRoom.rentalList.rentDate).toLocaleDateString() : "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center">
                                    <FaCalendarAlt className="text-gray-500 mr-2" />
                                    Ngày hết hạn: {selectedRoom.contract?.rentalDateTimeEnd ? new Date(selectedRoom.contract.rentalDateTimeEnd).toLocaleDateString() : "Chưa cập nhật"}
                                </p>
                                <p className="text-gray-700 flex items-center">
                                    <FaFileContract className="text-red-600 mr-2" />
                                    Trạng thái hợp đồng: {selectedRoom.contract?.status === 4 ? "Đang chờ giao dịch" :
                                        selectedRoom.contract?.status === 1 ? "Đang thuê" :
                                            selectedRoom.contract?.status === 3 ? "Đã thuê" :
                                                selectedRoom.contract?.status === 2 ? "Đã hủy" :
                                                    selectedRoom.contract?.status === undefined && selectedRoom.rentalList?.rentalStatus === 1 && selectedRoom.room?.status === 1 ?
                                                        <span className='text-gray-500 ml-0.5'>Chờ Chủ phòng xác nhận</span>
                                                        : <span className='text-gray-500 ml-0.5'>Không xác định</span>}
                                </p>
                                <p className="text-gray-700 flex items-center">
                                    <FaFileContract className="text-red-600 mr-2" />
                                    Hợp đồng: {selectedRoom.contract?.contractFile ? (
                                        <a href={selectedRoom.contract.contractFile} className="text-blue-500 underline ml-2" target="_blank" rel="noopener noreferrer">
                                            Xem hợp đồng
                                        </a>
                                    ) : selectedRoom.contract?.status === undefined && selectedRoom.rentalList?.rentalStatus === 1 && selectedRoom.room?.status === 1 ?
                                        <span className='text-gray-500 ml-0.5'> Chờ Chủ phòng tạo hợp đồng</span>
                                        : <span className='text-gray-500 ml-0.5'>Không có hợp đồng</span>}
                                </p>

                                {/* Nút Xác nhận và Hủy chỉ hiển thị khi hợp đồng ở trạng thái "Chờ Người dùng xác nhận" */}
                                {selectedRoom.contract?.status === 4 && (
                                    <div className="mt-4 flex space-x-4">
                                        <button
                                            onClick={() => {
                                                console.log("➡️ Click xác nhận");
                                                setShowConfirmPopup(true);
                                            }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                        >
                                            Xác nhận
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log("➡️ Click hủy");
                                                setShowCancelPopup(true);
                                            }}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <p className="text-center text-gray-500">Chọn một phòng để xem chi tiết</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup xác nhận thuê phòng */}
            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Xác nhận thuê phòng</h3>
                        <p className="mb-4">Bạn có chắc chắn muốn xác nhận thuê phòng này không?</p>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    console.log("➡️ Đóng popup xác nhận");
                                    setShowConfirmPopup(false);
                                }}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmRental}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup hủy thuê phòng */}
            {showCancelPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Hủy thuê phòng</h3>
                        <p className="mb-4">Bạn có chắc chắn muốn hủy thuê phòng này không?</p>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    console.log("➡️ Đóng popup hủy");
                                    setShowCancelPopup(false);
                                }}
                                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCancelRental}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup thông báo thành công */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">{successMessage.includes("thành công") ? "Thành công" : "Lỗi"}</h3>
                        <p className="mb-4">{successMessage}</p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    console.log("➡️ Đóng popup thành công");
                                    setShowSuccessPopup(false);
                                }}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}