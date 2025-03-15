import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import RoomService from "../../../Services/User/RoomService";
import CategoryRoomService from "../../../Services/User/CategoryRoomService";
import BuildingServices from "../../../Services/User/BuildingService";
import { showCustomNotification } from "../../../Components/Notification";
import Loading from "../../../Components/Loading";
import SidebarUser from "../../../Components/Layout/SidebarUser";

const RoomRentalConfirmation = () => {
    // Đảm bảo route được định nghĩa là /Rooms/Contract/:roomId
    const { roomId } = useParams();
    console.log("Route parameters:", { roomId });

    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    // Lưu giá trị ngày hôm nay ở dạng YYYY-MM-DD để set min cho input date
    const [today, setToday] = useState("");

    const [formData, setFormData] = useState({
        price: "",
        deposit: "",
        startDate: "",
        endDate: "",
        contractFile: null,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false); // dùng cho submit

    // Hàm helper lấy tên tòa nhà
    const getBuildingName = (buildingId) => {
        const found = buildings.find((b) => b.buildingId === buildingId);
        return found ? (found.buildingName || found.name) : "N/A";
    };

    // Hàm helper lấy tên loại phòng
    const getCategoryName = (categoryRoomId) => {
        const found = categoryRooms.find((c) => c.categoryRoomId === categoryRoomId);
        return found ? found.categoryName : "N/A";
    };

    // Xác định ngày hôm nay để giới hạn min cho input date
    useEffect(() => {
        const now = new Date();
        const isoDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
        setToday(isoDate);
    }, []);

    // Fetch tất cả dữ liệu cần thiết sử dụng Promise.all
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setDataLoading(true);
                const [categories, buildingList, roomDataResponse] = await Promise.all([
                    CategoryRoomService.getCategoryRooms(),
                    BuildingServices.getBuildings(),
                    roomId ? RoomService.getRoomById(roomId) : Promise.resolve(null),
                ]);
                setCategoryRooms(categories);
                setBuildings(buildingList);
                setRoomData(roomDataResponse);
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire("Error", "Failed to load data", "error");
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllData();
    }, [roomId]);

    if (dataLoading || !roomData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    // Validate form input (tiếng Việt)
    const validateForm = () => {
        const newErrors = {};
        if (!formData.price) newErrors.price = "Giá không được để trống";
        if (!formData.deposit) newErrors.deposit = "Số tiền gửi không được để trống";
        if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
        if (!formData.contractFile)
            newErrors.contractFile = "Tệp hợp đồng không được để trống";
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

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            contractFile: e.target.files[0],
        }));
    };

    // Xử lý submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        showCustomNotification();
        setIsLoading(true);
        // Giả lập API call; thay thế bằng API thật nếu cần
        setTimeout(() => {
            Swal.fire({
                title: "Thành công!",
                text: "Yêu cầu thuê phòng đã được gửi",
                icon: "success",
                confirmButtonText: "Đồng ý",
            });
            setIsLoading(false);
        }, 1500);
    };

    // Xử lý hủy request
    const handleCancelRequest = () => {
        Swal.fire({
            title: "Hủy Yêu cầu thuê phòng?",
            text: "Bạn có chắc chắn muốn hủy yêu cầu này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Không",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                showCustomNotification("Cancel", "Yêu cầu thuê phòng của bạn đã bị hủy.");
                Swal.fire("Đã hủy", "Yêu cầu thuê phòng của bạn đã bị hủy.", "success");
            } else {
                Swal.fire("Không hủy", "Yêu cầu của bạn vẫn còn hiệu lực.", "info");
            }
        });
    };

    return (
        <div>
            <SidebarUser />
            <div className="bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8 ml-56">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* PHẦN HIỂN THÔNG TIN PHÒNG */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* CỘT 1: ẢNH PHÒNG */}
                            <div className="relative md:w-1/3 h-64">
                                <img
                                    src={roomData.image}
                                    alt="Room Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src =
                                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";
                                    }}
                                />
                            </div>

                            {/* CỘT 2: CHI TIẾT PHÒNG */}
                            <div className="md:w-2/3 p-4 flex flex-col justify-center">
                                <h1 className="text-xl font-semibold mb-3">{roomData.title}</h1>
                                <h2 className="text-lg font-semibold mb-2">
                                    Mức giá:{" "}
                                    <span className="text-red-500">
                                        {Number(roomData.price).toLocaleString("vi-VN")} đ/tháng
                                    </span>
                                </h2>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                                    {roomData.buildingId !== null && (
                                        <div className="flex gap-x-1 items-center">
                                            <strong>Tòa Nhà:</strong>
                                            <span>{getBuildingName(roomData.buildingId)}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-x-1 items-center">
                                        <strong>Diện tích:</strong>
                                        <span>{roomData.acreage} m²</span>
                                    </div>
                                    <div className="flex gap-x-1 items-center">
                                        <strong>Nội thất:</strong>
                                        <span>{roomData.furniture || "Không"}</span>
                                    </div>
                                    <div className="flex gap-x-1 items-center">
                                        <strong>Phòng tắm:</strong>
                                        <span>{roomData.numberOfBathroom}</span>
                                    </div>
                                    <div className="flex gap-x-1 items-center">
                                        <strong>Giường ngủ:</strong>
                                        <span>{roomData.numberOfBedroom}</span>
                                    </div>
                                    <div className="flex gap-x-1 items-center">
                                        <strong>Loại Phòng:</strong>
                                        <span>{getCategoryName(roomData.categoryRoomId)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PHẦN FORM INPUT XÁC NHẬN THUÊ PHÒNG */}
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Xác nhận đơn Thuê</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Giá
                                        </label>
                                        <input
                                            type="text"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md border ${errors.price ? "border-red-500" : "border-gray-300"
                                                } px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                        />
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Số tiền gửi
                                        </label>
                                        <input
                                            type="number"
                                            name="deposit"
                                            value={formData.deposit}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md border ${errors.deposit ? "border-red-500" : "border-gray-300"
                                                } px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                        />
                                        {errors.deposit && (
                                            <p className="mt-1 text-sm text-red-500">{errors.deposit}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ngày bắt đầu
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            min={today} // Không cho phép chọn ngày trước hôm nay
                                            className={`mt-1 block w-full rounded-md border ${errors.startDate ? "border-red-500" : "border-gray-300"
                                                } px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                        />
                                        {errors.startDate && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.startDate}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ngày kết thúc
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            min={today} // Không cho phép chọn ngày trước hôm nay
                                            className={`mt-1 block w-full rounded-md border ${errors.endDate ? "border-red-500" : "border-gray-300"
                                                } px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                        />
                                        {errors.endDate && (
                                            <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tệp Hợp đồng
                                        </label>
                                        <input
                                            type="file"
                                            name="contractFile"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className={`mt-1 block w-full rounded-md border ${errors.contractFile ? "border-red-500" : "border-gray-300"
                                                } px-3 py-2 focus:outline-none`}
                                        />
                                        {errors.contractFile && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.contractFile}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleCancelRequest}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                </div>
            </div>
        </div>
    );
};

export default RoomRentalConfirmation;
