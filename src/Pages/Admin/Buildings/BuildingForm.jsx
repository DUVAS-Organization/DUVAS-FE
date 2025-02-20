import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingService from '../../../Services/Admin/BuildingServices';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus } from "react-icons/fa";

const BuildingsForm = () => {
    const [building, setBuilding] = useState({});
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (buildingId) {
            BuildingService.getBuildingById(buildingId)
                .then(data => {
                    setBuilding({
                        buildingId: data.buildingId,
                        buildingName: data.buildingName || '',
                        userId: data.userId || user.userId, // Nếu có userId trong dữ liệu, dùng; nếu không, lấy từ context
                        location: data.location || '',
                        verify: data.verify || false,
                        image: data.image || [],
                    });
                })
                .catch(error => {
                    console.error('Error fetching Building:', error);
                    showCustomNotification("error", "Không thể lấy thông tin tòa nhà!");
                });
        } else {
            setBuilding({
                buildingName: '',
                userId: user.userId,
                location: '',
                verify: false,
                image: [],
            });
        }
    }, [buildingId, user.userId]);

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => {
                console.error("Error converting file to base64");
                reject(new Error("File conversion error"));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            // Cập nhật state files để hiển thị preview
            setFiles(prev => [...prev, ...selectedFiles]);

            // Chuyển đổi tất cả các file được chọn sang Base64
            Promise.all(selectedFiles.map(file => convertFileToBase64(file)))
                .then(base64Array => {
                    setBuilding(prev => ({ ...prev, image: [...prev.image, ...base64Array] }));
                })
                .catch(error => {
                    console.error("Error converting files:", error);
                    showCustomNotification("error", "Lỗi khi chuyển đổi file!");
                });
        }
    };

    // Hàm xóa file đã chọn
    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setBuilding(prev => ({ ...prev, image: prev.image.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!building.image || building.image.length === 0) {
            showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
            return;
        }
        try {
            // Tạo một FormData object để gửi dữ liệu dưới dạng multipart/form-data
            let formData = new FormData();
            formData.append('buildingName', building.buildingName);
            formData.append('userId', Number(user.userId));
            formData.append('location', building.location);
            formData.append('verify', building.verify);

            // Thêm ảnh vào FormData
            building.image.forEach((img, index) => {
                formData.append('image', img); // Thêm file vào trong formData
            });
            for (let value of formData.entries()) {
                console.log(value[0] + ": " + value[1]);
            }
            if (buildingId) {
                // Nếu có buildingId thì gọi API update
                await BuildingService.updateBuilding(buildingId, formData);
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                // Nếu không có buildingId thì gọi API add mới
                await BuildingService.addBuilding(formData);
                showCustomNotification("success", "Tạo thành công!");
            }

            navigate('/Admin/Buildings');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            showCustomNotification("error", "Vui lòng thử lại!");
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <div className='max-w-7xl rounded-2xl mb-2'>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-5xl font-bold mb-6 text-blue-600  text-left">
                    {buildingId ? 'Chỉnh Sửa Tòa Nhà' : 'Tạo Tòa Nhà'}
                </h1>
                <div className="border-t-2 border-gray-500 w-full mb-5"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Tên Tòa Nhà: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <input
                            type="text"
                            value={building.buildingName}
                            onChange={(e) => setBuilding({ ...building, buildingName: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập Tên Tòa nhà"
                        />
                    </div>
                    <div className="w-full">
                        <label className="flex text-lg font-bold text-black mb-1">
                            Địa chỉ: <p className='text-red-500 ml-1'>*</p>
                        </label>
                        <input
                            type="text"
                            value={building.location}
                            onChange={(e) => setBuilding({ ...building, location: e.target.value })}
                            required
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập Địa chỉ"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="flex text-lg text-left font-bold text-black mb-2">
                        Ảnh: <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm w-full text-center">
                        <div className="flex items-center justify-center">
                            <label className="cursor-pointer bg-gray-200 p-3 rounded-lg flex items-center gap-2">
                                <FaPlus className="text-blue-600" />
                                <span className="text-gray-700 font-semibold">Thêm file</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".jpeg, .png, .pdf, .mp4"
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-gray-500 text-sm mb-3 font-medium text-center mt-2">
                            Định dạng: JPEG, PNG, PDF, MP4 - Tối đa 20MB
                        </p>
                        {building.image && building.image.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-gray-700">File đã chọn:</p>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {building.image.map((img, index) => (
                                        <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                            <img
                                                src={img}
                                                alt={`File ${index}`}
                                                className="w-full h-20 object-cover rounded-md"
                                                onClick={() => setPreviewImage(img)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center flex-col">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-400 transition duration-200"
                    >
                        Lưu
                    </button>

                </div>
            </form>
            {/* Modal để phóng to ảnh */}
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

export default BuildingsForm;
