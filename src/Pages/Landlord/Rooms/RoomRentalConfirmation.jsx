import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import RoomService from "../../../Services/User/RoomService";
import CategoryRoomService from "../../../Services/User/CategoryRoomService";
import BuildingServices from "../../../Services/User/BuildingService";
import BookingManagementService from "../../../Services/Landlord/BookingManagementService";
import Loading from "../../../Components/Loading";
import SidebarUser from "../../../Components/Layout/SidebarUser";

const RoomRentalConfirmation = () => {
    const { roomId } = useParams();
    console.log("Route parameters:", { roomId });

    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState(null);
    const [roomContract, setRoomContract] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [today, setToday] = useState("");
    const [formData, setFormData] = useState({
        price: "",
        deposit: "",
        startDate: "",
        endDate: "",
        contractFile: null,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [occupantRental, setOccupantRental] = useState(null);
    const [occupantUser, setOccupantUser] = useState(null);

    // Xác định ngày hôm nay để giới hạn min cho input date
    useEffect(() => {
        const now = new Date();
        const isoDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
        setToday(isoDate);
    }, []);

    // Fetch tất cả dữ liệu cần thiết
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setDataLoading(true);
                const [categories, buildingList, roomDataResponse, roomContractResponse] = await Promise.all([
                    CategoryRoomService.getCategoryRooms(),
                    BuildingServices.getBuildings(),
                    roomId ? RoomService.getRoomById(roomId) : Promise.resolve(null),
                    roomId ? RoomService.getRoomContract(roomId) : Promise.resolve(null),
                ]);
                console.log("Categories:", categories);
                console.log("Buildings:", buildingList);
                console.log("Room Data:", roomDataResponse);
                console.log("Room Contract:", roomContractResponse);

                setCategoryRooms(categories);
                setBuildings(buildingList);
                setRoomData(roomDataResponse);
                setRoomContract(roomContractResponse);

                // Kiểm tra và lấy thông tin Rental List từ roomData hoặc roomContract
                let rentalLists = null;
                if (roomDataResponse?.rentalLists && roomDataResponse.rentalLists.length > 0) {
                    rentalLists = roomDataResponse.rentalLists;
                } else if (roomContractResponse?.rentalLists && roomContractResponse.rentalLists.length > 0) {
                    rentalLists = roomContractResponse.rentalLists;
                }

                if (rentalLists && rentalLists.length > 0) {
                    setOccupantRental(rentalLists[0]);
                    setOccupantUser({
                        name: rentalLists[0].renterName,
                        gmail: rentalLists[0].renterEmail,
                        phone: rentalLists[0].renterPhone,
                    });
                } else {
                    setOccupantRental(null);
                    setOccupantUser(null);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire("Error", "Failed to load data", "error");
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllData();
    }, [roomId]);

    // Điền sẵn giá phòng vào form
    useEffect(() => {
        if (roomData && typeof roomData.price === "number") {
            setFormData((prev) => ({ ...prev, price: roomData.price.toString() }));
        }
    }, [roomData]);


    // Hàm helper lấy tên loại phòng
    const getCategoryName = (categoryRoomId) => {
        if (!categoryRoomId) return "Không có";
        const found = categoryRooms.find((c) => c.categoryRoomId === categoryRoomId);
        return found ? found.categoryName : "Không có";
    };

    // Hàm lấy trạng thái thuê
    const getRentalStatus = (status) => {
        switch (status) {
            case 0: return "Đang trống";
            case 1: return "Đang chờ giao dịch";
            case 2: return "Đã xác nhận";
            default: return "Không xác định";
        }
    };

    // Validate form input (tiếng Việt)
    const validateForm = () => {
        const newErrors = {};
        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) newErrors.price = "Giá phải là số dương";
        if (!formData.deposit || parseFloat(formData.deposit) <= 0) newErrors.deposit = "Số tiền gửi phải lớn hơn 0";
        if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }
        if (!formData.contractFile) newErrors.contractFile = "Tệp hợp đồng không được để trống";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý thay đổi tệp
    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            contractFile: e.target.files[0],
        }));
    };

    // Xử lý submit form (Xác nhận yêu cầu thuê)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const formDataToSend = new FormData();
            formDataToSend.append("price", formData.price);
            formDataToSend.append("deposit", formData.deposit);
            formDataToSend.append("startDate", formData.startDate);
            formDataToSend.append("endDate", formData.endDate);
            formDataToSend.append("contractFile", formData.contractFile);

            await BookingManagementService.confirmReservation(roomId, formDataToSend, token);
            Swal.fire({
                title: "Thành công!",
                text: "Yêu cầu thuê phòng đã được xác nhận",
                icon: "success",
                confirmButtonText: "Đồng ý",
            }).then(() => {
                window.location.reload();
            });
        } catch (error) {
            console.error("Lỗi khi xác nhận yêu cầu:", error);
            Swal.fire("Lỗi", "Không thể xác nhận yêu cầu thuê phòng", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý hủy yêu cầu
    const handleCancelRequest = async () => {
        const result = await Swal.fire({
            title: "Hủy Yêu cầu thuê phòng?",
            text: "Bạn có chắc chắn muốn hủy yêu cầu này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Không",
            reverseButtons: true,
        });
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                const rentalId = occupantRental?.RentalId;
                if (!rentalId) throw new Error("Không tìm thấy Rental ID");
                await BookingManagementService.cancelReservation(rentalId, token);
                Swal.fire("Đã hủy", "Yêu cầu thuê phòng đã bị hủy.", "success").then(() => {
                    window.location.reload();
                });
            } catch (error) {
                console.error("Lỗi khi hủy yêu cầu:", error);
                Swal.fire("Lỗi", "Không thể hủy yêu cầu", "error");
            }
        }
    };

    // Hiển thị loading khi dữ liệu chưa sẵn sàng
    if (dataLoading || !roomData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div>
            <SidebarUser />
            <div className="bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8 ml-56">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Phần hiển thị thông tin */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
                            {/* Cột 1: Thông tin người thuê */}
                            <div className="flex flex-col space-y-4">
                                <h2 className="text-xl font-bold">Thông tin người thuê phòng</h2>
                                {occupantUser ? (
                                    <>
                                        <p><strong>Tên:</strong> {occupantUser.name || "Không có"}</p>
                                        <p><strong>Email:</strong> {occupantUser.gmail || "Không có"}</p>
                                        <p><strong>SĐT:</strong> {occupantUser.phone || "Không có"}</p>
                                    </>
                                ) : (
                                    <p>Phòng này chưa có yêu cầu thuê nào.</p>
                                )}
                            </div>
                            {/* Cột 2: Thông tin phòng */}
                            <div className="flex flex-col space-y-4 mr-5">
                                <h2 className="text-xl font-bold">Thông tin phòng</h2>
                                <h1 className="text-xl font-semibold">{roomData.title || "Không có tiêu đề"}</h1>
                                <p>
                                    Mức giá: <span className="text-red-500">{roomData.price ? Number(roomData.price).toLocaleString("vi-VN") + " đ/tháng" : "Không có"}</span>
                                </p>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                                    <div><strong>Diện tích:</strong> {roomData.acreage ? roomData.acreage + " m²" : "Không có"}</div>
                                    <div><strong>Loại Phòng:</strong> {getCategoryName(roomData.categoryRoomId)}</div>
                                    <div><strong>Phòng tắm:</strong> {roomData.numberOfBathroom || "Không có"}</div>
                                    <div><strong>Giường ngủ:</strong> {roomData.numberOfBedroom || "Không có"}</div>

                                </div>
                            </div>
                            {/* Cột 3: Thông tin Rental List */}
                            <div className="flex flex-col space-y-4">
                                <h2 className="text-xl font-bold">Thông tin Rental List</h2>
                                {occupantRental ? (
                                    <div className="border p-4 rounded-md shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="font-semibold">Mã Rental:</div>
                                            <div>{occupantRental.rentalId}</div>
                                            <div className="font-semibold">Tháng thuê:</div>
                                            <div>{occupantRental.monthForRent}</div>
                                            <div className="font-semibold">Ngày thuê:</div>
                                            <div>{new Date(occupantRental.rentDate).toLocaleDateString()}</div>
                                            <div className="font-semibold">Trạng thái:</div>
                                            <div>{getRentalStatus(occupantRental.rentalStatus)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Phòng này chưa có yêu cầu thuê nào.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Phần form xác nhận thuê phòng - Chỉ hiển thị nếu có rentalLists */}
                    {occupantRental ? (
                        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Xác nhận đơn Thuê</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Giá</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.price ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                readOnly
                                            />
                                            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Số tiền gửi</label>
                                            <input
                                                type="number"
                                                name="deposit"
                                                value={formData.deposit}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.deposit ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                            />
                                            {errors.deposit && <p className="mt-1 text-sm text-red-500">{errors.deposit}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                min={today}
                                                className={`mt-1 block w-full rounded-md border ${errors.startDate ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                            />
                                            {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                min={today}
                                                className={`mt-1 block w-full rounded-md border ${errors.endDate ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                            />
                                            {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tệp Hợp đồng</label>
                                            <input
                                                type="file"
                                                name="contractFile"
                                                accept=".jpeg,.png,.gif"
                                                onChange={handleFileChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.contractFile ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:outline-none`}
                                            />
                                            {errors.contractFile && <p className="mt-1 text-sm text-red-500">{errors.contractFile}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={handleCancelRequest}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            disabled={isLoading}
                                        >
                                            Hủy Yêu cầu
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                        >
                                            {isLoading ? "Đang xử lý..." : "Xác nhận Yêu cầu"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
                            <p className="text-lg text-gray-700">Phòng này hiện chưa có yêu cầu thuê nào để xác nhận.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomRentalConfirmation;