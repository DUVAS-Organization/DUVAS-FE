import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingService from '../../../Services/Admin/BuildingServices';
import { showCustomNotification } from '../../../Components/Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus } from "react-icons/fa";


const BuildingDetails = () => {
    const [buildings, setBuilding] = useState({});
    const { buildingId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (buildingId) {
            BuildingService.getBuildingById(buildingId)
                .then(data => {
                    setBuilding({
                        buildingId: data.buildingId,
                        buildingName: data.buildingName,
                        location: data.location,
                        image: data.image || '',
                    });
                })
                .catch(error => console.error('Error fetching Category Service:', error));
        } else {
            // Nếu tạo mới, khởi tạo state với giá trị mặc định
            setBuilding({

            });
        }
    }, [buildingId]);

    const handleEdit = () => {
        navigate(`/Admin/Buildings/Edit/${buildingId}`);
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Tòa Nhà này?")) {
            try {
                await BuildingService.deleteBuilding(buildingId);
                showCustomNotification("success", "Xóa Tòa Nhà thành công!");
                navigate('/Admin/Buildings');
            } catch (error) {
                showCustomNotification("error", "Xóa Tòa Nhà thất bại, vui lòng thử lại!");
            }
        }
    };


    return (
        <div className="relative">

            <div className="p-6">
                {/* Header với nút quay lại */}
                <div className="max-w-7xl rounded-2xl mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-2"
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <h1 className="text-4xl font-bold text-blue-600 mb-6">Chi tiết Tòa Nhà</h1>
                    <div className="border-t-2 border-black w-full mb-5"></div>
                </div>


                {/* Bố cục 2 cột: hiển thị các trường thông tin */}
                <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg py-5 px-10">
                    <div className="space-y-6">
                        <div className="flex justify-between">
                            <p className="text-lg font-medium"><strong>Tên Chủ Sở Hữu: </strong> {buildings.userId}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-lg font-medium"><strong>Tên Tòa Nhà:</strong> {buildings.buildingName}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-lg font-medium"><strong>Địa chỉ:</strong> {buildings.location}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 max-w-3xl mx-auto bg-gray-100 shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Ảnh: </h2>
                    {buildings.image && buildings.image !== '' && (
                        (() => {
                            let images;
                            try {
                                images = JSON.parse(buildings.image);
                            } catch (error) {
                                images = buildings.image;
                            }
                            if (Array.isArray(images)) {
                                return (
                                    <div className="grid grid-cols-4 gap-4 w-full">
                                        {images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Image ${index}`}
                                                className="w-full h-52 object-cover rounded-lg cursor-pointer"
                                                onClick={() => setPreviewImage(img)}
                                            />
                                        ))}
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="grid grid-cols-4 gap-4 w-full">
                                        <img
                                            src={images}
                                            alt={buildings.buildingName}
                                            className="w-full h-auto object-cover rounded-lg cursor-pointer"
                                            onClick={() => setPreviewImage(images)}
                                        />
                                    </div>
                                );
                            }
                        })()
                    )}
                </div>

                {/* Các nút chỉnh sửa và xóa */}
                <div className="mt-6 mx-20 flex justify-around">
                    <button
                        onClick={handleEdit}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
                    >
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400"
                    >
                        Xóa
                    </button>
                </div>
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
export default BuildingDetails;