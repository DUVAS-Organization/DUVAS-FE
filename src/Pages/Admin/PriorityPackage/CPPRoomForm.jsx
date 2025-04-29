import React, { useState, useEffect } from 'react';
import CPPRoomsService from '../../../Services/Admin/CPPRoomsService';
import { useNavigate, useParams } from 'react-router-dom';
import { showCustomNotification } from '../../../Components/Notification';
import { FaArrowLeft } from 'react-icons/fa';
import PriceInput from '../../../Components/Layout/Range/PriceInput';

const CPPRoomForm = () => {
    const [cppRoom, setCppRoom] = useState({
        categoryPriorityPackageRoomId: 0,
        categoryPriorityPackageRoomValue: 0,
        price: 0,
        status: 1,
    });
    const [isLoading, setIsLoading] = useState(false);
    const { categoryPriorityPackageRoomId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (categoryPriorityPackageRoomId) {
            setIsLoading(true);
            CPPRoomsService.getCPPRoomById(categoryPriorityPackageRoomId)
                .then(data => {
                    // console.log('Dữ liệu nhận được từ getCPPRoomById:', data);
                    setCppRoom({
                        categoryPriorityPackageRoomId: data.categoryPriorityPackageRoomId || 0,
                        categoryPriorityPackageRoomValue: parseInt(data.categoryPriorityPackageRoomValue) || 0,
                        price: parseFloat(data.price) || 0,
                        status: data.status !== undefined ? parseInt(data.status) : 1,
                    });
                })
                .catch(error => {
                    console.error('Lỗi khi lấy thông tin Gói Ưu tiên Phòng:', error);
                    showCustomNotification('error', 'Không thể tải dữ liệu Gói Ưu tiên Phòng!');
                    navigate('/Admin/CategoryPriorityRooms');
                })
                .finally(() => setIsLoading(false));
        } else {
            setCppRoom({
                categoryPriorityPackageRoomId: 0,
                categoryPriorityPackageRoomValue: 0,
                price: 0,
                status: 1,
            });
        }
    }, [categoryPriorityPackageRoomId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Xác thực dữ liệu
            const value = parseInt(cppRoom.categoryPriorityPackageRoomValue);
            if (isNaN(value) || value <= 0) {
                showCustomNotification('error', 'Giá trị Gói Ưu tiên phải là số nguyên lớn hơn 0!');
                return;
            }
            const price = parseFloat(cppRoom.price);
            if (isNaN(price) || price <= 0) {
                showCustomNotification('error', 'Giá phải là số lớn hơn 0!');
                return;
            }

            const cppRoomData = {
                categoryPriorityPackageRoomValue: value,
                price: price,
                status: parseInt(cppRoom.status),
            };

            if (categoryPriorityPackageRoomId) {
                cppRoomData.categoryPriorityPackageRoomId = parseInt(cppRoom.categoryPriorityPackageRoomId);
                // console.log('Dữ liệu gửi lên (chỉnh sửa):', cppRoomData);
                await CPPRoomsService.updateCPPRoom(categoryPriorityPackageRoomId, cppRoomData);
                showCustomNotification('success', 'Chỉnh sửa thành công!');
            } else {
                // console.log('Dữ liệu gửi lên (tạo mới):', cppRoomData);
                await CPPRoomsService.createCPPRoom(cppRoomData);
                showCustomNotification('success', 'Tạo thành công!');
            }
            navigate('/Admin/CategoryPriorityRooms');
        } catch (error) {
            console.error('Lỗi trong handleSubmit:', error);
            console.log('Chi tiết lỗi API:', error.response?.data);
            showCustomNotification('error', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
    };
    const parsePrice = (value) => {
        if (!value && value !== 0) return '';
        if (typeof value === 'number') return value;
        return value.replace(/\./g, '');
    };
    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            {isLoading ? (
                <div className="text-center py-4">Đang tải dữ liệu...</div>
            ) : (
                <>
                    <div className="max-w-7xl rounded-2xl mb-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                        >
                            <FaArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold mb-6 text-blue-600 text-left">
                            {categoryPriorityPackageRoomId ? 'Chỉnh sửa Gói Ưu tiên Phòng' : 'Tạo Gói Ưu tiên Phòng'}
                        </h1>
                        <div className="border-t-2 border-gray-500 w-full mb-5"></div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá trị Gói Ưu tiên:
                            </label>
                            <input
                                type="number"
                                value={cppRoom.categoryPriorityPackageRoomValue}
                                onChange={(e) =>
                                    setCppRoom({ ...cppRoom, categoryPriorityPackageRoomValue: e.target.value })
                                }
                                required
                                min="1"
                                step="1"
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập giá trị Gói Ưu tiên (số nguyên)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá:
                            </label>
                            <PriceInput
                                value={cppRoom.price || 0}
                                onChange={(val) => setCppRoom({ ...cppRoom, price: val })}
                            />
                        </div>

                        <div className="flex items-center flex-col">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-400 transition duration-200"
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default CPPRoomForm;