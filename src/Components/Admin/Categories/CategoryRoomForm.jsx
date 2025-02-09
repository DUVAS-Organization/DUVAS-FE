import React, { useState, useEffect } from 'react';
import CategoryRooms from '../../../Services/Admin/CategoryRooms';
import { useNavigate, useParams } from 'react-router-dom';
import { showCustomNotification } from '../../Notification'
import { FaArrowLeft } from "react-icons/fa";

const CategoryRoomForm = () => {
    const [categoryRoom, setCategoryRooms] = useState({
        categoryRoomId: 0,
        categoryName: '',
    });
    const { categoryRoomId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (categoryRoomId) {
            CategoryRooms.getCategoryRoomsById(categoryRoomId)
                .then(data => {
                    setCategoryRooms({
                        categoryRoomId: data.categoryRoomId,
                        categoryName: data.categoryName,
                    });
                })
                .catch(error => console.error('Error fetching Category Room:', error));
        } else {
            setCategoryRooms({
                categoryRoomId: 0,
                categoryName: '',
            });
        }
    }, [categoryRoomId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let CategoryRoomsData = {
                categoryName: categoryRoom.categoryName || '',
            };

            if (categoryRoomId) {
                CategoryRoomsData = {
                    ...CategoryRoomsData,
                    categoryRoomId: categoryRoom.categoryRoomId,
                };
                await CategoryRooms.updateCategoryRoom(categoryRoomId, CategoryRoomsData);
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                await CategoryRooms.addCategoryRoom(CategoryRoomsData);
                showCustomNotification("success", "Tạo thành công!");
            }
            navigate('/Admin/CategoryRooms');
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
                <h1 className="text-3xl font-bold mb-6 text-blue-600  text-left">
                    {categoryRoomId ? 'Chỉnh sửa Loại Phòng' : 'Tạo Loại Phòng'}
                </h1>
                <div className="border-t-2 border-gray-500 w-full mb-5"></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Loại Phòng:
                    </label>
                    <input
                        type="text"
                        value={categoryRoom.categoryName}
                        onChange={(e) => setCategoryRooms({ ...categoryRoom, categoryName: e.target.value })}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên Loại Phòng"
                    />
                </div>


                {/* Buttons */}
                <div className="flex items-center flex-col">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-400 transition duration-200"
                    >
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryRoomForm;
