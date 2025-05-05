import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import RoomService from "../../../../Services/User/RoomService";
import CategoryRoomService from "../../../../Services/User/CategoryRoomService";
import BuildingServices from "../../../../Services/User/BuildingService";
import AdminManageRoomService from "../../../../Services/Admin/AdminManageRoomService";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useAuth } from "../../../../Context/AuthProvider";
import OtherService from "../../../../Services/User/OtherService";
import Loading from "../../../../Components/Loading";

const AdminRoomRentalConfirmation = () => {
    const { roomId, rentalId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // State declarations
    const [categoryRooms, setCategoryRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState(null);
    const [occupantRental, setOccupantRental] = useState(null);
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
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [contractStatus, setContractStatus] = useState(null);
    const [noBookingFound, setNoBookingFound] = useState(false);

    // Set current date
    useEffect(() => {
        const now = new Date();
        const isoDate = now.toISOString().split("T")[0];
        setToday(isoDate);
    }, []);

    // Fetch all data from API
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setDataLoading(true);
                console.log("User Token:", user?.token);
                const [categories, buildingList, roomDataResponse, authorizedResp] = await Promise.all([
                    CategoryRoomService.getCategoryRooms(),
                    BuildingServices.getBuildings(),
                    roomId ? RoomService.getRoomById(roomId) : Promise.resolve(null),
                    user?.token ? AdminManageRoomService.getAuthorizedRooms(user.token) : Promise.resolve({ rooms: [], rentals: [], contracts: [] }),
                ]);

                setCategoryRooms(categories);
                setBuildings(buildingList);
                setRoomData(roomDataResponse);

                // Log API response for debugging
                console.log("Raw API Response from getAuthorizedRooms:", authorizedResp);

                // Normalize rental list
                const rentalList = authorizedResp?.rentals && Array.isArray(authorizedResp.rentals) ? authorizedResp.rentals : [];
                console.log("Normalized Rental List:", rentalList);

                const parsedRoomId = parseInt(roomId);
                const parsedRentalId = parseInt(rentalId);

                const foundBooking = rentalList.find(
                    (r) => parseInt(r.roomId) === parsedRoomId && parseInt(r.rentalId) === parsedRentalId
                );

                console.log("Searching for roomId:", parsedRoomId, "rentalId:", parsedRentalId);
                console.log("Found Booking:", foundBooking);

                if (foundBooking) {
                    const normalizedBooking = {
                        rentalId: foundBooking.rentalId,
                        roomId: foundBooking.roomId,
                        renterID: foundBooking.renterID || 0,
                        rentDate: foundBooking.createdDate,
                        monthForRent: foundBooking.monthForRent || 1,
                        rentalStatus: foundBooking.rentalStatus || 1,
                        renterName: foundBooking.renterName || "Không có",
                        renterEmail: foundBooking.renterEmail || "Không có",
                        renterPhone: foundBooking.renterPhone || "Không có",
                        contractStatus: foundBooking.contractStatus ?? null,
                    };

                    setOccupantRental(normalizedBooking);
                    setContractStatus(normalizedBooking.contractStatus);

                    // Process rental dates
                    const rentDateRaw = foundBooking.createdDate;
                    const monthForRent = normalizedBooking.monthForRent;
                    let formattedRentDate;

                    if (typeof rentDateRaw === "string") {
                        const rentDate = new Date(rentDateRaw);
                        if (!isNaN(rentDate.getTime())) {
                            rentDate.setDate(rentDate.getDate() + 1);
                            formattedRentDate = rentDate.toISOString().split("T")[0];
                            const endDate = new Date(rentDate);
                            endDate.setMonth(endDate.getMonth() + monthForRent);
                            setCalculatedEndDate(endDate.toISOString().split("T")[0]);
                        } else {
                            formattedRentDate = rentDateRaw.split("T")[0];
                            const testDate = new Date(formattedRentDate);
                            if (!isNaN(testDate.getTime())) {
                                testDate.setDate(testDate.getDate() + 1);
                                formattedRentDate = testDate.toISOString().split("T")[0];
                                const endDate = new Date(testDate);
                                endDate.setMonth(endDate.getMonth() + monthForRent);
                                setCalculatedEndDate(endDate.toISOString().split("T")[0]);
                            } else {
                                console.error("Invalid createdDate format:", rentDateRaw);
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
                            setCalculatedEndDate(endDate.toISOString().split("T")[0]);
                        } else {
                            console.error("Invalid createdDate:", rentDateRaw);
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
                    console.warn("No matching booking found for roomId:", parsedRoomId, "rentalId:", parsedRentalId);
                    setOccupantRental(null);
                    setContractStatus(null);
                    setMinStartDate(today);
                    setCalculatedEndDate(today);
                    setNoBookingFound(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                console.log("API Error Details:", error.message, error.stack);
                Swal.fire("Lỗi", "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.", "error");
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllData();
    }, [roomId, rentalId, today, user]);

    // Set default room price
    useEffect(() => {
        if (roomData && typeof roomData.price === "number") {
            setFormData((prev) => ({ ...prev, price: roomData.price.toString() }));
        }
    }, [roomData]);

    // Update end date from calculatedEndDate
    useEffect(() => {
        if (calculatedEndDate) {
            setFormData((prev) => ({ ...prev, endDate: calculatedEndDate }));
        }
    }, [calculatedEndDate]);

    // Helper functions
    const getCategoryName = (categoryRoomId) => {
        if (!categoryRoomId) return "Không có";
        const found = categoryRooms.find((c) => c.categoryRoomId === categoryRoomId);
        return found ? found.categoryName : "Không có";
    };

    const getRoomStatus = () => {
        if (!occupantRental || !roomData) return "Còn trống";
        const { rentalStatus } = occupantRental;
        const { status: roomStatus } = roomData;
        const { contractStatus: cStatus } = occupantRental;

        if (rentalStatus === 1 && roomStatus === 3 && cStatus === 1) return "Phòng này đang cho thuê";
        if (rentalStatus === 1 && roomStatus === 1) {
            return cStatus === 3 ? "Phòng này đang cho thuê" : "Đang chờ giao dịch";
        }
        if (rentalStatus === 1 && roomStatus === 2 && cStatus === 4) return "Chờ Người thuê xác nhận";
        if (rentalStatus === 2 && roomStatus === 2 && cStatus === 2) return "Đã hủy";
        return "Còn trống";
    };

    const validateForm = () => {
        const newErrors = {};
        const price = parseFloat(formData.price);

        if (isNaN(price) || price <= 0) newErrors.price = "Giá phải là số dương";
        if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
        if (
            formData.startDate &&
            formData.endDate &&
            new Date(formData.startDate) >= new Date(formData.endDate)
        ) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }
        if (newFiles.length === 0) newErrors.contractFile = "Vui lòng chọn ít nhất một ảnh hợp đồng";
        if (
            formData.startDate &&
            minStartDate &&
            new Date(formData.startDate) < new Date(minStartDate)
        ) {
            newErrors.startDate = "Ngày bắt đầu phải từ ngày sau ngày thuê trở đi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Event handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "price") {
            const rawValue = value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, [name]: rawValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

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

    const handleRemoveFile = (index) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
        setFormData((prev) => ({
            ...prev,
            contractFile: Array.isArray(prev.contractFile)
                ? prev.contractFile.filter((_, i) => i !== index)
                : [],
        }));
    };

    const uploadFile = async (file) => {
        const formDataFile = new FormData();
        formDataFile.append("file", file);
        try {
            const data = await OtherService.uploadImage(formDataFile);
            return data.imageUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const token = user?.token;
            if (!token) throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
            if (user.role !== "Admin") throw new Error("Chỉ Admin mới có thể xác nhận yêu cầu này.");

            const uploadedImageUrls = await Promise.all(newFiles.map((file) => uploadFile(file)));
            const dataToSend = {
                roomId: parseInt(roomId),
                rentalDateTimeStart: formData.startDate,
                rentalDateTimeEnd: formData.endDate,
                contractFile: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : "",
                deposit: parseFloat(formData.deposit) || 0,
                price: parseFloat(formData.price) || 0,
                renterID: occupantRental?.renterID || 0,
                status: 4,
                contractId: null,
            };

            const response = await AdminManageRoomService.confirmReservation(roomId, rentalId, dataToSend, token);

            Swal.fire({
                title: "Thành công!",
                text: response || "Yêu cầu thuê đã được xác nhận",
                icon: "success",
                confirmButtonText: "Đồng ý",
            }).then(() => navigate("/Admin/rooms/list"));
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
                if (!token) throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
                if (user.role !== "Admin") throw new Error("Chỉ Admin mới có thể hủy yêu cầu này.");

                const rentalIdLocal = occupantRental?.rentalId;
                if (!rentalIdLocal) throw new Error("Không tìm thấy Rental ID");

                const response = await AdminManageRoomService.cancelReservation(rentalIdLocal, token);

                Swal.fire({
                    title: "Đã hủy",
                    text: response || "Yêu cầu thuê phòng đã bị hủy.",
                    icon: "success",
                    confirmButtonText: "Đồng ý",
                }).then(() => navigate("/Admin/rooms/list"));
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

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="bg-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {noBookingFound && (
                    <div className="text-center text-red-500">
                        Không tìm thấy thông tin thuê cho phòng này. Vui lòng kiểm tra lại.
                    </div>
                )}
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-xl font-bold">Thông tin người thuê</h2>
                            {occupantRental ? (
                                <>
                                    <p><strong>Tên:</strong> {occupantRental.renterName}</p>
                                    <p><strong>Email:</strong> {occupantRental.renterEmail}</p>
                                    <p><strong>Số điện thoại:</strong> {occupantRental.renterPhone}</p>
                                </>
                            ) : (
                                <p>Phòng này chưa có người thuê nào.</p>
                            )}
                        </div>
                        <div className="flex flex-col space-y-1 mr-5">
                            <h2 className="text-xl font-bold">Thông tin phòng</h2>
                            <h1 className="text-xl font-medium">{roomData?.title || "Không có tiêu đề"}</h1>
                            <p className="font-medium">
                                Mức giá:{" "}
                                <span className="text-red-500 font-medium">
                                    {roomData?.price
                                        ? Number(roomData.price).toLocaleString("vi-VN") + " đ/tháng"
                                        : "Không có"}
                                </span>
                            </p>
                            <div className="gap-x-3">
                                <div><strong>Diện tích:</strong> {roomData?.acreage ? roomData.acreage + " m²" : "Không có"}</div>
                                <div><strong>Loại Phòng:</strong> {getCategoryName(roomData?.categoryRoomId)}</div>
                                <div><strong>Trạng thái:</strong> {getRoomStatus()}</div>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-xl font-bold">Thông tin Thuê</h2>
                            {occupantRental ? (
                                <div className="rounded-md shadow-sm">
                                    <div className="space-y-1">
                                        <div className="flex">
                                            <div className="font-semibold min-w-[100px]">Mã Rental:</div>
                                            <div>{occupantRental.rentalId}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="font-semibold min-w-[100px]">Tháng thuê:</div>
                                            <div>{occupantRental.monthForRent}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="font-semibold min-w-[100px]">Ngày thuê:</div>
                                            <div>{new Date(occupantRental.rentDate).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="font-semibold min-w-[100px]">Trạng thái:</div>
                                            <div>{getRoomStatus()}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>Phòng này chưa có yêu cầu thuê nào.</p>
                            )}
                        </div>
                    </div>
                </div>

                {occupantRental && getRoomStatus() === "Phòng này đang cho thuê" ? (
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
                        <p className="text-lg text-gray-700 font-semibold">Phòng này đang cho thuê</p>
                    </div>
                ) : occupantRental && getRoomStatus() === "Chờ Người thuê xác nhận" ? (
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
                        <p className="text-lg text-gray-700 font-semibold">Phòng này đang chờ người thuê xác nhận</p>
                    </div>
                ) : (
                    occupantRental && (
                        <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
                            <h2 className="text-xl font-bold mb-4">Xác nhận đơn Thuê</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Giá(đ)</label>
                                        <input
                                            type="text"
                                            name="price"
                                            readOnly
                                            value={formData.price ? Number(formData.price).toLocaleString("vi-VN") : ""}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md border ${errors.price ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                            placeholder="Nhập giá phòng"
                                        />
                                        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
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
                    )
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
    );
};

export default AdminRoomRentalConfirmation;