import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import RoomService from "../../../Services/User/RoomService";
import CategoryRoomService from "../../../Services/User/CategoryRoomService";
import BuildingServices from "../../../Services/User/BuildingService";
import BookingManagementService from "../../../Services/Landlord/BookingManagementService";
import Loading from "../../../Components/Loading";
import SidebarUser from "../../../Components/Layout/SidebarUser";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useAuth } from "../../../Context/AuthProvider";

const RoomRentalConfirmation = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState(null);
    const [roomContract, setRoomContract] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [today, setToday] = useState("");
    const [minStartDate, setMinStartDate] = useState("");
    const [calculatedEndDate, setCalculatedEndDate] = useState("");
    const [formData, setFormData] = useState({
        price: "",
        deposit: "",
        startDate: "",
        endDate: "",
        contractFile: [],
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [occupantRental, setOccupantRental] = useState(null);
    const [occupantUser, setOccupantUser] = useState(null);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [contractStatus, setContractStatus] = useState(null);

    // Thiết lập ngày hiện tại
    useEffect(() => {
        const now = new Date();
        const isoDate = now.toISOString().split("T")[0];
        setToday(isoDate);
    }, []);

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setDataLoading(true);
                const [categories, buildingList, roomDataResponse, roomContractResponse, rentalResponse] = await Promise.all([
                    CategoryRoomService.getCategoryRooms(),
                    BuildingServices.getBuildings(),
                    roomId ? RoomService.getRoomById(roomId) : Promise.resolve(null),
                    roomId ? RoomService.getRoomContract(roomId) : Promise.resolve(null),
                    user?.userId && user?.token ? BookingManagementService.getRentalListOfLandlord(user.userId, user.token) : Promise.resolve([]),
                ]);

                setCategoryRooms(categories);
                setBuildings(buildingList);
                setRoomData(roomDataResponse);
                setRoomContract(roomContractResponse);

                const rentalForRoom = rentalResponse.find(r => r.roomId === parseInt(roomId));
                if (rentalForRoom) {
                    setOccupantRental(rentalForRoom);
                    setOccupantUser({
                        name: rentalForRoom.renterName,
                        gmail: rentalForRoom.renterEmail,
                        phone: rentalForRoom.renterPhone,
                    });
                    console.log(rentalForRoom);
                    setContractStatus(rentalForRoom?.contractStatus ?? null);

                    const rentDateRaw = rentalForRoom.rentDate;
                    const monthForRent = rentalForRoom.monthForRent;
                    let formattedRentDate;

                    if (typeof rentDateRaw === "string") {
                        const rentDate = new Date(rentDateRaw);
                        if (!isNaN(rentDate.getTime())) {
                            rentDate.setDate(rentDate.getDate() + 1);
                            formattedRentDate = rentDate.toISOString().split("T")[0];

                            const endDate = new Date(rentDate);
                            endDate.setMonth(endDate.getMonth() + monthForRent);
                            const formattedEndDate = endDate.toISOString().split("T")[0];
                            setCalculatedEndDate(formattedEndDate);
                        } else {
                            formattedRentDate = rentDateRaw.split(" ")[0];
                            const testDate = new Date(formattedRentDate);
                            if (!isNaN(testDate.getTime())) {
                                testDate.setDate(testDate.getDate() + 1);
                                formattedRentDate = testDate.toISOString().split("T")[0];

                                const endDate = new Date(testDate);
                                endDate.setMonth(endDate.getMonth() + monthForRent);
                                const formattedEndDate = endDate.toISOString().split("T")[0];
                                setCalculatedEndDate(formattedEndDate);
                            } else {
                                console.error("Invalid rentDate format:", rentDateRaw);
                                formattedRentDate = today;
                                setCalculatedEndDate(today);
                            }
                        }
                    } else {
                        const rentDate = new Date(rentDateRaw);
                        if (!isNaN(rentDate.getTime())) {
                            rentDate.setDate(rentDate.getDate() + 1);
                            formattedRentDate = rentDate.toISOString().split("T")[0];

                            const endDate = new Date(rentDate);
                            endDate.setMonth(endDate.getMonth() + monthForRent);
                            const formattedEndDate = endDate.toISOString().split("T")[0];
                            setCalculatedEndDate(formattedEndDate);
                        } else {
                            console.error("Invalid rentDate:", rentDateRaw);
                            formattedRentDate = today;
                            setCalculatedEndDate(today);
                        }
                    }

                    setMinStartDate(formattedRentDate);
                    if (!formData.startDate || new Date(formData.startDate) < new Date(formattedRentDate)) {
                        setFormData((prev) => ({
                            ...prev,
                            startDate: formattedRentDate,
                            endDate: calculatedEndDate || prev.endDate,
                        }));
                    }
                } else {
                    setOccupantRental(null);
                    setOccupantUser(null);
                    setMinStartDate(today);
                    setCalculatedEndDate(today);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire("Error", "Failed to load data", "error");
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllData();
    }, [roomId, today, user]);

    // Cập nhật giá phòng: chỉ set giá mặc định theo giá của phòng (không nhân với số tháng)
    useEffect(() => {
        if (roomData && typeof roomData.price === "number") {
            setFormData((prev) => ({ ...prev, price: roomData.price.toString() }));
        }
    }, [roomData]);

    // Cập nhật ngày kết thúc
    useEffect(() => {
        if (calculatedEndDate) {
            setFormData((prev) => ({ ...prev, endDate: calculatedEndDate }));
        }
    }, [calculatedEndDate]);

    // Lấy tên loại phòng
    const getCategoryName = (categoryRoomId) => {
        if (!categoryRoomId) return "Không có";
        const found = categoryRooms.find((c) => c.categoryRoomId === categoryRoomId);
        return found ? found.categoryName : "Không có";
    };

    // CHỈ SỬA 1 CHỖ NÀY: đổi "Đang cho thuê" => "Phòng này đang cho thuê"
    const getRoomStatus = () => {
        if (!occupantRental || !roomData) return "Không xác định";

        const rentalStatus = occupantRental.rentalStatus;
        const roomStatus = roomData.status;
        const cStatus = occupantRental.contractStatus;

        // Nếu rentalStatus=1, roomStatus=3, cStatus=1 => "Phòng này đang cho thuê"
        if (rentalStatus === 1 && roomStatus === 3 && cStatus === 1) {
            return "Phòng này đang cho thuê";
        }
        // Nếu rentalStatus=1, roomStatus=1 => có thể chờ giao dịch hoặc đã thuê
        if (rentalStatus === 1 && roomStatus === 1) {
            if (cStatus === 3) {
                return "Phòng này đang cho thuê";
            }
            return "Đang chờ giao dịch";
        }
        // Chờ Người dùng xác nhận: RentalStatus=1, roomStatus=2, cStatus=4
        else if (rentalStatus === 1 && roomStatus === 2 && cStatus === 4) {
            return "Chờ Người dùng xác nhận";
        }
        // Đã hủy: RentalStatus=1, contractStatus=2
        else if (rentalStatus === 1 && cStatus === 2) {
            return "Đã hủy";
        }
        // Đã hủy: RentalStatus=2, roomStatus=2, contractStatus=2
        else if (rentalStatus === 2 && roomStatus === 2 && cStatus === 2) {
            return "Đã hủy";
        }
        // Nếu occupantRental không có => kiểm tra roomData.status
        if (!occupantRental) {
            switch (roomStatus) {
                case 0: return "Đang trống";
                case 1: return "Đang chờ giao dịch";
                case 2: return "Đã được đặt";
                case 3: return "Đang cho thuê";
                default: return "Không xác định";
            }
        }
        return "Không xác định";
    };

    // Xác thực form
    const validateForm = () => {
        const newErrors = {};
        const price = parseFloat(formData.price);
        const expectedPrice = roomData?.price && occupantRental?.monthForRent
            ? roomData.price * occupantRental.monthForRent
            : 0;

        if (isNaN(price) || price <= 0) {
            newErrors.price = "Giá phải là số dương";
        }
        // else if (price !== expectedPrice && roomData) {
        //     newErrors.price = `Giá phải bằng ${roomData.price.toLocaleString("vi-VN")}`;
        // }

        if (!formData.deposit || parseFloat(formData.deposit) < 0)
            newErrors.deposit = "Số tiền gửi phải lớn hơn 0";
        if (!formData.startDate)
            newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!formData.endDate)
            newErrors.endDate = "Vui lòng chọn ngày kết thúc";
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }
        if (newFiles.length === 0)
            newErrors.contractFile = "Vui lòng chọn ít nhất một ảnh hợp đồng";
        if (formData.startDate && minStartDate && new Date(formData.startDate) < new Date(minStartDate)) {
            newErrors.startDate = "Ngày bắt đầu phải từ ngày sau ngày thuê trở đi";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "price" || name === "deposit") {
            const rawValue = value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({
                ...prev,
                [name]: rawValue,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Xử lý thêm file
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setNewFiles((prev) => [...prev, ...selectedFiles]);
            const previews = selectedFiles.map((file) => URL.createObjectURL(file));
            setNewPreviews((prev) => [...prev, ...previews]);
            setFormData((prev) => ({
                ...prev,
                contractFile: [...(Array.isArray(prev.contractFile) ? prev.contractFile : []), ...selectedFiles],
            }));
        }
    };

    // Xóa file
    const handleRemoveFile = (index) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
        setFormData((prev) => ({
            ...prev,
            contractFile: Array.isArray(prev.contractFile) ? prev.contractFile.filter((_, i) => i !== index) : [],
        }));
    };

    // Upload file lên server
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch("http://apiduvas1.runasp.net/api/Upload/upload-image", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error("Upload failed");
            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    // Xử lý xác nhận
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const token = user?.token;
            if (!token) {
                throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
            }

            if (user.role !== "Landlord") {
                throw new Error("Bạn không có quyền xác nhận yêu cầu này. Chỉ Landlord mới có thể thực hiện.");
            }

            const uploadedImageUrls = await Promise.all(newFiles.map((file) => uploadFile(file)));

            const dataToSend = {
                roomId: roomId,
                rentalDateTimeStart: formData.startDate,
                rentalDateTimeEnd: formData.endDate,
                contractFile: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : "",
                deposit: parseFloat(formData.deposit) || 0,
                price: parseFloat(formData.price) || 0,
            };

            console.log("Data gửi đi:", dataToSend);

            const response = await BookingManagementService.confirmReservation(
                roomId,
                dataToSend,
                token
            );

            Swal.fire({
                title: "Thành công!",
                text: response || "Yêu cầu thuê phòng đã được xác nhận",
                icon: "success",
                confirmButtonText: "Đồng ý",
            }).then(() => {
                navigate("/Room");
            });
        } catch (error) {
            console.error("Lỗi xác nhận yêu cầu:", error.message);
            Swal.fire({
                title: "Lỗi",
                text: error.message || "Không thể xác nhận yêu cầu thuê phòng. Vui lòng kiểm tra lại.",
                icon: "error",
                confirmButtonText: "Đồng ý",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Hủy yêu cầu
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
                const token = user?.token;
                if (!token) {
                    throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
                }

                if (user.role !== "Landlord") {
                    throw new Error("Bạn không có quyền hủy yêu cầu này. Chỉ Landlord mới có thể thực hiện.");
                }

                const rentalId = occupantRental?.rentalId;
                if (!rentalId) throw new Error("Không tìm thấy Rental ID");

                const response = await BookingManagementService.cancelReservation(rentalId, token);

                Swal.fire({
                    title: "Đã hủy",
                    text: response || "Yêu cầu thuê phòng đã bị hủy.",
                    icon: "success",
                    confirmButtonText: "Đồng ý",
                }).then(() => {
                    navigate("/Room");
                });
            } catch (error) {
                console.error("Lỗi hủy yêu cầu:", error.message);
                Swal.fire({
                    title: "Lỗi",
                    text: error.message || "Không thể hủy yêu cầu. Vui lòng kiểm tra lại.",
                    icon: "error",
                    confirmButtonText: "Đồng ý",
                });
            }
        }
    };

    // Kiểm tra điều kiện để hiển thị thông báo chờ xác nhận
    const isWaitingUserConfirmation = () => {
        return (
            occupantRental?.rentalStatus === 1 &&
            roomData?.status === 2 &&
            contractStatus === 4
        );
    };

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
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
                            <div className="flex flex-col space-y-4">
                                <h2 className="text-xl font-bold">Thông tin người thuê phòng</h2>
                                {occupantUser ? (
                                    <>
                                        <p><strong>Tên:</strong> {occupantUser.name || "Không có"}</p>
                                        <p><strong>Email:</strong> {occupantUser.gmail || "Không có"}</p>
                                        <p><strong>Số điện thoại:</strong> {occupantUser.phone || "Không có"}</p>
                                    </>
                                ) : (
                                    <p>Phòng này chưa có người thuê.</p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1 mr-5">
                                <h2 className="text-xl font-bold">Thông tin phòng</h2>
                                <h1 className="text-xl font-medium">{roomData.title || "Không có tiêu đề"}</h1>
                                <p className="font-medium">
                                    Mức giá: <span className="text-red-500 font-medium">{roomData.price ? Number(roomData.price).toLocaleString("vi-VN") + " đ/tháng" : "Không có"}</span>
                                </p>
                                <div className="gap-x-3">
                                    <div><strong>Diện tích:</strong> {roomData.acreage ? roomData.acreage + " m²" : "Không có"}</div>
                                    <div><strong>Loại Phòng:</strong> {getCategoryName(roomData.categoryRoomId)}</div>
                                    <div><strong>Trạng thái:</strong> {getRoomStatus()}</div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-4">
                                <h2 className="text-xl font-bold">Thông tin Rental List</h2>
                                {occupantRental ? (
                                    <div className="rounded-md shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="font-semibold">Mã Rental:</div>
                                            <div>{occupantRental.rentalId}</div>
                                            <div className="font-semibold">Tháng thuê:</div>
                                            <div>{occupantRental.monthForRent}</div>
                                            <div className="font-semibold">Ngày thuê:</div>
                                            <div>{new Date(occupantRental.rentDate).toLocaleDateString()}</div>
                                            <div className="font-semibold">Ngày kết thúc:</div>
                                            <div>{calculatedEndDate ? new Date(calculatedEndDate).toLocaleDateString() : "Không có"}</div>
                                            <div className="font-semibold">Trạng thái:</div>
                                            <div>{getRoomStatus()}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Phòng này chưa có yêu cầu thuê nào.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {occupantRental ? (
                        isWaitingUserConfirmation() ? (
                            <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
                                <p className="text-lg text-gray-700 font-semibold">
                                    Phòng này hiện đang chờ Người dùng xác nhận đơn. Vui lòng chờ...
                                </p>
                            </div>
                        ) : getRoomStatus() === "Phòng này đang cho thuê" ? (
                            <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
                                <p className="text-lg text-gray-700">
                                    Phòng này đang cho thuê
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-4">Xác nhận đơn Thuê</h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Giá(đ)</label>
                                                <input
                                                    type="text"
                                                    name="price"
                                                    value={formData.price ? Number(formData.price).toLocaleString("vi-VN") : ""}
                                                    onChange={handleInputChange}
                                                    className={`mt-1 block w-full rounded-md border ${errors.price ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                    placeholder="Nhập giá phòng"
                                                />
                                                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Số tiền gửi</label>
                                                <input
                                                    type="text"
                                                    name="deposit"
                                                    value={formData.deposit ? Number(formData.deposit).toLocaleString("vi-VN") : ""}
                                                    onChange={handleInputChange}
                                                    className={`mt-1 block w-full rounded-md border ${errors.deposit ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                    placeholder="Nhập số tiền gửi"
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
                                                    min={minStartDate}
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
                                                    min={formData.startDate || minStartDate}
                                                    className={`mt-1 block w-full rounded-md border ${errors.endDate ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                />
                                                {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ảnh hợp đồng</label>
                                            <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm w-full text-center">
                                                <div className="flex items-center justify-center">
                                                    <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2">
                                                        <FaPlus className="text-blue-600" />
                                                        <span className="text-gray-700 font-semibold">Thêm Ảnh</span>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            onChange={handleFileChange}
                                                            accept=".jpeg,.png,.gif"
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-gray-500 text-sm mb-3 font-medium text-center mt-2">
                                                    Định dạng: JPEG, PNG, GIF - Tối đa 5MB
                                                </p>
                                                {newPreviews.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="font-semibold text-gray-700">Ảnh đã chọn:</p>
                                                        <div className="grid grid-cols-3 gap-3 mt-2">
                                                            {newPreviews.map((url, index) => (
                                                                <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFile(index)}
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                                    >
                                                                        <FaTimes size={14} />
                                                                    </button>
                                                                    <img
                                                                        src={url}
                                                                        alt={`Contract ${index}`}
                                                                        className="w-full h-20 object-cover rounded-md cursor-pointer"
                                                                        onClick={() => setPreviewImage(url)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.contractFile && <p className="mt-1 text-sm text-red-500">{errors.contractFile}</p>}
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
                        )
                    ) : (
                        <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
                            <p className="text-lg text-gray-700">
                                Phòng này hiện chưa có yêu cầu thuê nào để xác nhận.
                            </p>
                        </div>
                    )}
                </div>
                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                        onClick={() => setPreviewImage(null)}
                    >
                        <img
                            src={previewImage}
                            alt="Enlarged Preview"
                            className="max-w-[75%] max-h-[85%] object-cover rounded-lg"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomRentalConfirmation;
