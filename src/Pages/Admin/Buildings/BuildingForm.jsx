import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingService from '../../../Services/Admin/BuildingServices';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus } from "react-icons/fa";
import Loading from '../../../Components/Loading';
import OtherService from '../../../Services/User/OtherService';

const BuildingsForm = () => {
    const [building, setBuilding] = useState({});
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    // State cho ảnh đã lưu (khi edit)
    const [existingImages, setExistingImages] = useState([]);
    // State cho file mới được chọn
    const [newFiles, setNewFiles] = useState([]);
    // State cho preview URL của file mới
    const [newPreviews, setNewPreviews] = useState([]);
    // State hiển thị preview phóng to
    const [previewImage, setPreviewImage] = useState(null);
    useEffect(() => {
        if (buildingId) {
            BuildingService.getBuildingById(buildingId)
                .then(data => {
                    let images = [];
                    try {
                        images = data.image ? JSON.parse(data.image) : [];
                    } catch (error) {
                        images = data.image ? [data.image] : [];
                    }
                    setBuilding({
                        buildingId: data.buildingId,
                        buildingName: data.buildingName || '',
                        userId: data.userId || user.userId,
                        location: data.location || '',
                    });
                    setExistingImages(images);
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
            });
        }
    }, [buildingId, user.userId]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setNewFiles(prev => [...prev, ...selectedFiles]);
            const previews = selectedFiles.map(file => URL.createObjectURL(file));
            setNewPreviews(prev => [...prev, ...previews]);
        }
    };

    // Xóa file khỏi danh sách: nếu isNew=true thì xóa file mới, ngược lại xóa ảnh đã có
    const handleRemoveFile = (index, isNew) => {
        if (isNew) {
            setNewFiles(prev => prev.filter((_, i) => i !== index));
            setNewPreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Hàm upload file mới lên API xử lý upload ảnh lên Cloudinary
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const data = await OtherService.uploadImage(formData);
            return data.imageUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    const combinedPreviews = [
        ...existingImages.map(url => ({ url, isNew: false })),
        ...newPreviews.map((url, idx) => ({ url, isNew: true, index: idx }))
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalImagesCount = existingImages.length + newFiles.length;
        if (totalImagesCount === 0) {
            showCustomNotification("error", "Vui lòng chọn ít nhất 1 ảnh!");
            return;
        }
        setLoading(true);
        try {
            // Upload file mới song song để giảm thời gian chờ
            const uploadedImageUrls = await Promise.all(newFiles.map(file => uploadFile(file)));
            // Kết hợp URL từ ảnh đã có và ảnh mới upload
            const finalImageUrls = [...existingImages, ...uploadedImageUrls];
            const buildingData = {
                buildingName: building.buildingName,
                userId: user.userId,
                location: building.location,
                image: JSON.stringify(finalImageUrls)
            }
            if (buildingId) {
                // Nếu có buildingId thì gọi API update
                await BuildingService.updateBuilding(buildingId, { ...buildingData, buildingId: building.buildingId });
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                // Nếu không có buildingId thì gọi API add mới
                await BuildingService.addBuilding(buildingData);
                showCustomNotification("success", "Tạo thành công!");
            }


            navigate('/Admin/Buildings');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            showCustomNotification("error", "Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="relative">
            {
                loading && (
                    <Loading />
                )
            }
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
                                    <span className="text-gray-700 font-semibold">Thêm Ảnh</span>
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
                                Định dạng: JPEG, PNG - Tối đa 5MB
                            </p>
                            {combinedPreviews.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold text-gray-700">Ảnh đã chọn:</p>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {combinedPreviews.map((item, index) => (
                                            <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (item.isNew) {
                                                            // Với ảnh mới, item.index chứa index trong newFiles/newPreviews
                                                            handleRemoveFile(item.index, true);
                                                        } else {
                                                            handleRemoveFile(index, false);
                                                        }
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                                <img
                                                    src={item.url}
                                                    alt={`File ${index}`}
                                                    className="w-full h-20 object-cover rounded-md cursor-pointer"
                                                    onClick={() => setPreviewImage(item.url)}
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
        </div>

    );
};

export default BuildingsForm;
