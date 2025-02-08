import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingService from '../../../Services/Admin/BuildingServices';
import { showCustomNotification } from '../../Notification';
import { useAuth } from '../../../Context/AuthProvider';
import { FaArrowLeft, FaTimes, FaPlus } from "react-icons/fa";

const BuildingsForm = () => {
    const [building, setBuilding] = useState([]);
    const { buildingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (buildingId) {
            BuildingService.getBuildingById(buildingId)
                .then(data => {
                    setBuilding({
                        buildingName: data.buildingName || '',
                        userId: data.userId || user.userId, // Nếu có userId trong dữ liệu, dùng; nếu không, lấy từ context
                        location: data.location || '',
                        verify: data.verify || false,
                    });
                })
                .catch(error => console.error('Error fetching Building:', error));
        } else {
            setBuilding(prevBuilding => ({
                ...prevBuilding,
                userId: user.userId, // Lấy userId từ context và gán vào form
            }));
        }
    }, [buildingId, user.userId]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        // Loại bỏ file trùng lặp (theo tên file)
        const newFiles = selectedFiles.filter(file =>
            !files.some(existingFile => existingFile.name === file.name)
        );

        setFiles(prevFiles => [...prevFiles, ...newFiles]); // Thêm file mới vào danh sách
    };

    // Hàm xóa file đã chọn
    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            console.log("Dữ liệu gửi đi:", building);
            formData.append("buildingName", building.buildingName);
            formData.append("location", building.location);
            formData.append("userId", user.userId);

            files.forEach((file) => {
                formData.append("documents", file);
            });

            if (buildingId) {
                await BuildingService.updateBuilding(buildingId, formData);
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
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
                    <label className="text-lg text-left font-bold text-black mb-2">
                        Giấy tờ:
                    </label>
                    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm w-full text-center">
                        {/* Input chọn file */}
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

                        {/* Danh sách file đã chọn */}
                        {files.length > 0 && (
                            <div className="mt-3">
                                <p className="font-semibold text-gray-700">File đã chọn:</p>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative border p-2 rounded-lg shadow-sm">
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                            {file.type.startsWith("image/") ? (
                                                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-20 object-cover rounded-md" />
                                            ) : (
                                                <p className="text-sm text-gray-600 truncate">{file.name}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verify</label>
                    <div className="flex items-center">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="garret"
                                value="True"
                                checked={building.verify === true}
                                onChange={() => setBuilding({ ...building, verify: true })}
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="garret"
                                value="False"
                                checked={building.verify === false}
                                onChange={() => setBuilding({ ...building, verify: false })}
                            />
                            No
                        </label>
                    </div>
                </div> */}

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
        </div>
    );
};

export default BuildingsForm;
