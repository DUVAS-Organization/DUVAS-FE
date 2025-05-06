import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import RoomService from "../../../Services/User/RoomService";
import CategoryRoomService from "../../../Services/User/CategoryRoomService";
import BuildingServices from "../../../Services/User/BuildingService";
import BookingManagementService from "../../../Services/Landlord/BookingManagementService";
import UserRentRoomService from "../../../Services/User/UserRentRoomService";
import MonthlyPaymentService from "../../../Services/Landlord/MonthlyPaymentService";
import Loading from "../../../Components/Loading";
import SidebarUser from "../../../Components/Layout/SidebarUser";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useAuth } from "../../../Context/AuthProvider";
import OtherService from "../../../Services/User/OtherService";

const RoomRentalConfirmation = () => {
    const { roomId, rentalId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

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
    const [paymentFormData, setPaymentFormData] = useState({
        dien: "",
        nuoc: "",
        internet: "",
        rac: "",
        guiXe: "",
        quanLy: "",
        chiPhiKhac: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [contractStatus, setContractStatus] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [isPaymentRequestCreated, setIsPaymentRequestCreated] = useState(false);

    // Đơn giá thực tế (sử dụng từ roomData nếu có, nếu không để người dùng nhập)
    const UNIT_PRICES = {
        dien: roomData?.dien || null,
        nuoc: roomData?.nuoc || null,
        internet: roomData?.internet || null,
        rac: roomData?.rac || null,
        guiXe: roomData?.guiXe || null,
        quanLy: roomData?.quanLy || null,
        chiPhiKhac: roomData?.chiPhiKhac || null,
    };

    // Tính tổng chi phí
    const calculateTotalPayment = () => {
        const dienCost = UNIT_PRICES.dien
            ? (parseInt(paymentFormData.dien) || 0) * UNIT_PRICES.dien
            : parseInt(paymentFormData.dien) || 0;
        const nuocCost = UNIT_PRICES.nuoc
            ? (parseInt(paymentFormData.nuoc) || 0) * UNIT_PRICES.nuoc
            : parseInt(paymentFormData.nuoc) || 0;
        const internetCost = UNIT_PRICES.internet || parseInt(paymentFormData.internet) || 0;
        const racCost = UNIT_PRICES.rac || parseInt(paymentFormData.rac) || 0;
        const guiXeCost = UNIT_PRICES.guiXe || parseInt(paymentFormData.guiXe) || 0;
        const quanLyCost = UNIT_PRICES.quanLy || parseInt(paymentFormData.quanLy) || 0;
        const chiPhiKhacCost = UNIT_PRICES.chiPhiKhac || parseInt(paymentFormData.chiPhiKhac) || 0;

        return dienCost + nuocCost + internetCost + racCost + guiXeCost + quanLyCost + chiPhiKhacCost;
    };

    useEffect(() => {
        const now = new Date();
        const isoDate = now.toISOString().split("T")[0];
        setToday(isoDate);
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setDataLoading(true);
                const [categories, buildingList, roomDataResponse, rentalsResp] = await Promise.all([
                    CategoryRoomService.getCategoryRooms(),
                    BuildingServices.getBuildings(),
                    roomId ? RoomService.getRoomById(roomId) : Promise.resolve(null),
                    user?.userId && user?.token
                        ? BookingManagementService.getRentalListOfLandlord(user.userId, user.token)
                        : Promise.resolve([]),
                ]);

                setCategoryRooms(categories);
                setBuildings(buildingList);
                setRoomData(roomDataResponse);

                const rentalList = rentalsResp.rentalList || rentalsResp || [];
                const foundBooking = rentalList.find(
                    (r) => r.roomId === parseInt(roomId) && r.rentalId === parseInt(rentalId)
                );

                if (foundBooking) {
                    setOccupantRental(foundBooking);
                    setContractStatus(foundBooking.contractStatus ?? null);

                    const rentDateRaw = foundBooking.rentDate;
                    const monthForRent = foundBooking.monthForRent;
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
                            formattedRentDate = rentDateRaw.split(" ")[0];
                            const testDate = new Date(formattedRentDate);
                            if (!isNaN(testDate.getTime())) {
                                testDate.setDate(testDate.getDate() + 1);
                                formattedRentDate = testDate.toISOString().split("T")[0];
                                const endDate = new Date(testDate);
                                endDate.setMonth(endDate.getMonth() + monthForRent);
                                setCalculatedEndDate(endDate.toISOString().split("T")[0]);
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
                            setCalculatedEndDate(endDate.toISOString().split("T")[0]);
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

                    const currentDate = new Date();
                    const paymentDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    if (currentDate < paymentDueDate) paymentDueDate.setMonth(paymentDueDate.getMonth() - 1);

                    const insiderTradings = await MonthlyPaymentService.getInsiderTradingsByRoomId(roomId);
                    const hasPendingPayment = insiderTradings.some((it) =>
                        it.Type === "MonthlyPayment" &&
                        it.CreatedDate.startsWith(paymentDueDate.toISOString().split("T")[0].slice(0, 7)) &&
                        it.Status === 0
                    );
                    setIsPaymentRequestCreated(hasPendingPayment);
                } else {
                    setOccupantRental(null);
                    setContractStatus(null);
                    setMinStartDate(today);
                    setCalculatedEndDate(today);
                    setIsPaymentRequestCreated(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire("Error", "Không thể load dữ liệu", "error");
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllData();
    }, [roomId, rentalId, today, user]);

    useEffect(() => {
        if (roomData && typeof roomData.price === "number") {
            setFormData((prev) => ({ ...prev, price: roomData.price.toString() }));
        }
    }, [roomData]);

    useEffect(() => {
        if (calculatedEndDate) {
            setFormData((prev) => ({ ...prev, endDate: calculatedEndDate }));
        }
    }, [calculatedEndDate]);

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

    const validatePaymentForm = () => {
        const newErrors = {};

        const fields = ["dien", "nuoc", "internet", "rac", "guiXe", "quanLy", "chiPhiKhac"];
        fields.forEach((field) => {
            const value = paymentFormData[field];
            // Kiểm tra nếu trường trống hoặc không được điền
            if (value === "" || value === undefined || value === null) {
                newErrors[field] = "Trường này không được để trống";
            } else {
                const numericValue = parseInt(value);
                // Kiểm tra nếu giá trị không phải là số hoặc âm
                if (isNaN(numericValue) || numericValue < 0) {
                    newErrors[field] = "Giá trị phải là số không âm";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "price") {
            const rawValue = value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, [name]: rawValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        const numericValue = value.replace(/[^0-9]/g, "") || "";
        setPaymentFormData((prev) => ({
            ...prev,
            [name]: numericValue,
        }));
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
            if (user.role !== "Landlord") throw new Error("Chỉ Landlord mới có thể xác nhận yêu cầu này.");

            const uploadedImageUrls = await Promise.all(newFiles.map((file) => uploadFile(file)));
            const dataToSend = {
                roomId: roomId,
                rentalDateTimeStart: formData.startDate,
                rentalDateTimeEnd: formData.endDate,
                contractFile: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : "",
                deposit: parseFloat(formData.deposit) || 0,
                price: parseFloat(formData.price) || 0,
            };

            const response = await BookingManagementService.confirmReservation(roomId, dataToSend, token);

            Swal.fire({
                title: "Thành công!",
                text: response || "Booking đã được xác nhận",
                icon: "success",
                confirmButtonText: "Đồng ý",
            }).then(() => navigate("/Room"));
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

    const handleConfirmRental = async () => {
        try {
            const rentalIdLocal = occupantRental?.rentalId;
            const roomPrice = roomData?.Price || 0;
            const landlordId = roomData?.UserId;

            const checkBalanceData = { UserId: user.userId, Amount: roomPrice };
            const balanceResponse = await BookingManagementService.checkBalance(checkBalanceData, user.token);

            if (balanceResponse !== "Bạn đủ tiền.") {
                Swal.fire("Thông báo", "Bạn không đủ tiền. Vui lòng nạp thêm tiền để tiếp tục.", "warning");
                return;
            }

            const updateBalanceData = { UserId: user.userId, Amount: -roomPrice };
            await BookingManagementService.updateBalance(updateBalanceData, user.token);

            const insiderTradingData = {
                Remitter: user.userId,
                Receiver: landlordId,
                Money: roomPrice,
            };
            const insiderTradingResponse = await BookingManagementService.firstMonthInsiderTrading(
                insiderTradingData,
                user.token
            );

            const actionDate = new Date().toISOString();
            const insiderTradingId = insiderTradingResponse.InsiderTradingId || 0;
            await BookingManagementService.scheduleAction(
                actionDate,
                landlordId,
                roomPrice,
                insiderTradingId,
                user.token
            );

            await UserRentRoomService.confirmRental(rentalIdLocal, {}, user.token);

            setSuccessMessage("Xác nhận thuê phòng thành công!");
            Swal.fire({
                title: "Thành công!",
                text: "Xác nhận thuê phòng thành công!",
                icon: "success",
                confirmButtonText: "Đồng ý",
            }).then(() => navigate("/Room"));
        } catch (error) {
            console.error("❌ [FE] Error confirming rental:", error);
            Swal.fire({
                title: "Lỗi",
                text: "Có lỗi xảy ra khi xác nhận thuê phòng: " + error.message,
                icon: "error",
                confirmButtonText: "Đồng ý",
            });
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

    const handleRequestPayment = async (e) => {
        e.preventDefault();
        if (!validatePaymentForm()) return;
        setIsLoading(true);

        try {
            const token = user?.token;
            if (!token) throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
            if (user.role !== "Landlord") throw new Error("Chỉ Landlord mới có thể tạo yêu cầu thanh toán.");

            const currentDate = new Date();
            const paymentDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            if (currentDate < paymentDueDate) paymentDueDate.setMonth(paymentDueDate.getMonth() - 1);

            const insiderTradings = await MonthlyPaymentService.getInsiderTradingsByRoomId(roomId);
            const hasPendingPayment = insiderTradings.some((it) =>
                it.Type === "MonthlyPayment" &&
                it.CreatedDate.startsWith(paymentDueDate.toISOString().split("T")[0].slice(0, 7)) &&
                it.Status === 0
            );

            if (hasPendingPayment) {
                throw new Error("Đã có yêu cầu thanh toán cho tháng này.");
            }

            const paymentData = {
                Dien: paymentFormData.dien ? parseInt(paymentFormData.dien) : 0,
                Nuoc: paymentFormData.nuoc ? parseInt(paymentFormData.nuoc) : 0,
                Internet: paymentFormData.internet ? parseInt(paymentFormData.internet) : 0,
                Rac: paymentFormData.rac ? parseInt(paymentFormData.rac) : 0,
                GuiXe: paymentFormData.guiXe ? parseInt(paymentFormData.guiXe) : 0,
                QuanLy: paymentFormData.quanLy ? parseInt(paymentFormData.quanLy) : 0,
                ChiPhiKhac: paymentFormData.chiPhiKhac ? parseInt(paymentFormData.chiPhiKhac) : 0,
            };

            const response = await MonthlyPaymentService.requestMonthlyPayment(roomId, paymentData);
            setIsPaymentRequestCreated(true);
            Swal.fire({
                title: "Thành công!",
                text: response.Message || "Yêu cầu thanh toán đã được tạo thành công!",
                icon: "success",
                confirmButtonText: "Đồng ý",
            });
        } catch (error) {
            console.error("Lỗi tạo yêu cầu thanh toán:", error.message);
            Swal.fire({
                title: "Lỗi",
                text: error.message || "Không thể tạo yêu cầu thanh toán. Vui lòng kiểm tra lại.",
                icon: "error",
                confirmButtonText: "Đồng ý",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (insiderTradingId, status) => {
        try {
            const token = user?.token;
            if (!token) throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
            if (user.role !== "Landlord" && user.role !== "Renter") throw new Error("Bạn không có quyền cập nhật trạng thái.");

            const response = await MonthlyPaymentService.updateInsiderTradingStatus(insiderTradingId, status);
            Swal.fire({
                title: "Thành công!",
                text: response.Message || "Trạng thái giao dịch đã được cập nhật!",
                icon: "success",
                confirmButtonText: "Đồng ý",
            });
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error.message);
            Swal.fire({
                title: "Lỗi",
                text: error.message || "Không thể cập nhật trạng thái. Vui lòng kiểm tra lại.",
                icon: "error",
                confirmButtonText: "Đồng ý",
            });
        }
    };

    if (dataLoading) {
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
                                <h2 className="text-xl font-bold">Thông tin người thuê</h2>
                                {occupantRental ? (
                                    <>
                                        <p>
                                            <strong>Tên:</strong> {occupantRental.renterName || "Không có"}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {occupantRental.renterEmail || "Không có"}
                                        </p>
                                        <p>
                                            <strong>Số điện thoại:</strong> {occupantRental.renterPhone || "Không có"}
                                        </p>
                                    </>
                                ) : (
                                    <p>Phòng này chưa có người thuê nào.</p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1 mr-5">
                                <h2 className="text-xl font-bold">Thông tin phòng</h2>
                                <h1 className="text-xl font-medium">{roomData.title || "Không có tiêu đề"}</h1>
                                <p className="font-medium">
                                    Mức giá:{" "}
                                    <span className="text-red-500 font-medium">
                                        {roomData.price
                                            ? Number(roomData.price).toLocaleString("vi-VN") + " đ/tháng"
                                            : "Không có"}
                                    </span>
                                </p>
                                <div className="gap-x-3">
                                    <div>
                                        <strong>Diện tích:</strong> {roomData.acreage ? roomData.acreage + " m²" : "Không có"}
                                    </div>
                                    <div>
                                        <strong>Loại Phòng:</strong> {getCategoryName(roomData.categoryRoomId)}
                                    </div>
                                    <div>
                                        <strong>Trạng thái:</strong> {getRoomStatus()}
                                    </div>
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
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Thanh toán hàng tháng</h2>
                            </div>
                            <form onSubmit={handleRequestPayment} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {UNIT_PRICES.dien ? `Điện (kWh) - ${UNIT_PRICES.dien.toLocaleString("vi-VN")} đ/kWh` : "Điện (đ)"}
                                            {!UNIT_PRICES.dien && (
                                                <span className="text-red-500 ml-2">Chưa có giá</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                name="dien"
                                                value={paymentFormData.dien}
                                                onChange={handlePaymentInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.dien ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                placeholder={UNIT_PRICES.dien ? "Nhập số lượng" : "Nhập giá"}
                                                required
                                            />
                                        </div>
                                        Tạm tính: {paymentFormData.dien && (
                                            <span className="text-base text-gray-800">
                                                {(UNIT_PRICES.dien
                                                    ? (parseInt(paymentFormData.dien) * UNIT_PRICES.dien)
                                                    : parseInt(paymentFormData.dien)).toLocaleString("vi-VN")} đ
                                            </span>
                                        )}
                                        {errors.dien && <p className="mt-1 text-sm text-red-500">{errors.dien}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {UNIT_PRICES.nuoc ? `Nước (m³) - ${UNIT_PRICES.nuoc.toLocaleString("vi-VN")} đ/m³` : "Nước (đ)"}
                                            {!UNIT_PRICES.nuoc && (
                                                <span className="text-red-500 ml-2">Chưa có giá</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                name="nuoc"
                                                value={paymentFormData.nuoc}
                                                onChange={handlePaymentInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.nuoc ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                placeholder={UNIT_PRICES.nuoc ? "Nhập số lượng" : "Nhập giá"}
                                                required
                                            />
                                        </div>
                                        Tạm tính: {paymentFormData.nuoc && (
                                            <span className="text-base text-gray-800">
                                                {(UNIT_PRICES.nuoc
                                                    ? (parseInt(paymentFormData.nuoc) * UNIT_PRICES.nuoc)
                                                    : parseInt(paymentFormData.nuoc)).toLocaleString("vi-VN")} đ
                                            </span>
                                        )}
                                        {errors.nuoc && <p className="mt-1 text-sm text-red-500">{errors.nuoc}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {UNIT_PRICES.internet ? `Internet (tháng) - ${UNIT_PRICES.internet.toLocaleString("vi-VN")} đ/tháng` : "Internet (đ)"}
                                            {!UNIT_PRICES.internet && (
                                                <span className="text-red-500 ml-2">Chưa có giá</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                name="internet"
                                                value={paymentFormData.internet}
                                                onChange={handlePaymentInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.internet ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                placeholder={UNIT_PRICES.internet ? "Nhập số tháng" : "Nhập giá"}
                                                required
                                            />
                                        </div>
                                        Tạm tính: {paymentFormData.internet && (
                                            <span className="text-base text-gray-800">
                                                {(UNIT_PRICES.internet
                                                    ? (parseInt(paymentFormData.internet) * UNIT_PRICES.internet)
                                                    : parseInt(paymentFormData.internet)).toLocaleString("vi-VN")} đ/tháng
                                            </span>
                                        )}
                                        {errors.internet && <p className="mt-1 text-sm text-red-500">{errors.internet}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {UNIT_PRICES.rac ? `Rác (tháng) - ${UNIT_PRICES.rac.toLocaleString("vi-VN")} đ/tháng` : "Rác (đ)"}
                                            {!UNIT_PRICES.rac && (
                                                <span className="text-red-500 ml-2">Chưa có giá</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                name="rac"
                                                value={paymentFormData.rac}
                                                onChange={handlePaymentInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.rac ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                placeholder={UNIT_PRICES.rac ? "Nhập số tháng" : "Nhập giá"}
                                                required
                                            />
                                        </div>
                                        Tạm tính: {paymentFormData.rac && (
                                            <span className="text-base text-gray-800">
                                                {(UNIT_PRICES.rac
                                                    ? (parseInt(paymentFormData.rac) * UNIT_PRICES.rac)
                                                    : parseInt(paymentFormData.rac)).toLocaleString("vi-VN")} đ/tháng
                                            </span>
                                        )}
                                        {errors.rac && <p className="mt-1 text-sm text-red-500">{errors.rac}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {UNIT_PRICES.guiXe ? `Gửi xe (tháng) - ${UNIT_PRICES.guiXe.toLocaleString("vi-VN")} đ/tháng` : "Gửi xe (đ)"}
                                            {!UNIT_PRICES.guiXe && (
                                                <span className="text-red-500 ml-2">Chưa có giá</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                name="guiXe"
                                                value={paymentFormData.guiXe}
                                                onChange={handlePaymentInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.guiXe ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                placeholder={UNIT_PRICES.guiXe ? "Nhập số tháng" : "Nhập giá"}
                                                required
                                            />
                                        </div>
                                        Tạm tính: {paymentFormData.guiXe && (
                                            <span className="text-base text-gray-800">
                                                {(UNIT_PRICES.guiXe
                                                    ? (parseInt(paymentFormData.guiXe) * UNIT_PRICES.guiXe)
                                                    : parseInt(paymentFormData.guiXe)).toLocaleString("vi-VN")} đ/tháng
                                            </span>
                                        )}
                                        {errors.guiXe && <p className="mt-1 text-sm text-red-500">{errors.guiXe}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {UNIT_PRICES.quanLy ? `Quản lý (tháng) - ${UNIT_PRICES.quanLy.toLocaleString("vi-VN")} đ/tháng` : "Quản lý (đ)"}
                                            {!UNIT_PRICES.quanLy && (
                                                <span className="text-red-500 ml-2">Chưa có giá</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                name="quanLy"
                                                value={paymentFormData.quanLy}
                                                onChange={handlePaymentInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.quanLy ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                placeholder={UNIT_PRICES.quanLy ? "Nhập số tháng" : "Nhập giá"}
                                                required
                                            />
                                        </div>
                                        Tạm tính: {paymentFormData.quanLy && (
                                            <span className="text-base text-gray-800">
                                                {(UNIT_PRICES.quanLy
                                                    ? (parseInt(paymentFormData.quanLy) * UNIT_PRICES.quanLy)
                                                    : parseInt(paymentFormData.quanLy)).toLocaleString("vi-VN")} đ/tháng
                                            </span>
                                        )}
                                        {errors.quanLy && <p className="mt-1 text-sm text-red-500">{errors.quanLy}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {UNIT_PRICES.chiPhiKhac ? `Chi phí khác (tháng) - ${UNIT_PRICES.chiPhiKhac.toLocaleString("vi-VN")} đ/tháng` : "Chi phí khác (đ)"}
                                            {!UNIT_PRICES.chiPhiKhac && (
                                                <span className="text-red-500 ml-2">Chưa có giá</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                name="chiPhiKhac"
                                                value={paymentFormData.chiPhiKhac}
                                                onChange={handlePaymentInputChange}
                                                className={`mt-1 block w-full rounded-md border ${errors.chiPhiKhac ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                                                placeholder={UNIT_PRICES.chiPhiKhac ? "Nhập số tháng" : "Nhập giá"}
                                                required
                                            />
                                        </div>
                                        Tạm tính: {paymentFormData.chiPhiKhac && (
                                            <span className="text-base text-gray-800">
                                                {(UNIT_PRICES.chiPhiKhac
                                                    ? (parseInt(paymentFormData.chiPhiKhac) * UNIT_PRICES.chiPhiKhac)
                                                    : parseInt(paymentFormData.chiPhiKhac)).toLocaleString("vi-VN")} đ/tháng
                                            </span>
                                        )}
                                        {errors.chiPhiKhac && <p className="mt-1 text-sm text-red-500">{errors.chiPhiKhac}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-lg font-semibold">
                                        Tổng chi phí: {" "}
                                        <span className="text-red-500">
                                            {calculateTotalPayment().toLocaleString("vi-VN")} đ
                                        </span>
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={isLoading || isPaymentRequestCreated}
                                        className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isLoading || isPaymentRequestCreated ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-400"}`}
                                    >
                                        {isLoading ? "Đang xử lý..." : isPaymentRequestCreated ? "Yêu cầu đã được tạo" : "Tạo yêu cầu thanh toán"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : getRoomStatus() === "Chờ Người thuê xác nhận" ? (
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
                                                            <div
                                                                key={index}
                                                                className="relative border p-2 rounded-lg shadow-sm"
                                                            >
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
                                        {errors.contractFile && (
                                            <p className="mt-1 text-sm text-red-500">{errors.contractFile}</p>
                                        )}
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

export default RoomRentalConfirmation;