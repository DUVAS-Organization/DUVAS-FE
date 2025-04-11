import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryRooms from "../../../Services/Admin/CategoryRooms";
import { FiPlus } from 'react-icons/fi';

const CategoryRoomList = () => {
    const [categoryRooms, setCategoryRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        CategoryRooms.getCategoryRooms()
            .then(data => {
                setCategoryRooms(data);
            })
            .catch(error => console.error('Error fetching Category Room:', error));
    };

    const handleCreate = () => {
        navigate('/Admin/CategoryRooms/Creates');
    };

    const handleDelete = (categoryRoomId) => {
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa Loại Phòng này?");
        if (isConfirmed) {
            CategoryRooms.deleteCategoryRoom(categoryRoomId)
                .then(() => fetchData())
                .catch(error => console.error('Lỗi khi xóa:', error));
        }
    };

    const handleLock = (id) => {
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn KHÓA loại phòng này?");
        if (isConfirmed) {
            CategoryRooms.lockCategoryRoom(id)
                .then(fetchData)
                .catch((err) => console.error("Lỗi khi khóa:", err));
        }
    };

    const handleUnlock = (id) => {
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn MỞ KHÓA loại phòng này?");
        if (isConfirmed) {
            CategoryRooms.unlockCategoryRoom(id)
                .then(fetchData)
                .catch((err) => console.error("Lỗi khi mở khóa:", err));
        }
    };

    return (
        <div className="p-6">
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1>Loại Phòng</h1>
                <button
                    onClick={handleCreate}
                    className='flex mr-2 items-center text-white bg-blue-500 rounded-3xl h-11 px-2'>
                    <FiPlus className="mr-2 text-xl" />
                    <p className="font-semibold text-lg mr-2">Tạo mới</p>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên Loại Dịch Vụ</th>
                            <th className="py-2 px-4 text-center font-semibold text-black">Trạng Thái</th>
                            <th className="py-2 px-4 text-center font-semibold text-black">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryRooms.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            categoryRooms.map((categoryRoom, index) => (
                                <tr key={categoryRoom.categoryRoomId} className="hover:bg-gray-200 border-collapse border border-gray-300">
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{categoryRoom.categoryName}</td>

                                    <td className="py-2 px-4 text-center border-b">
                                        <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${categoryRoom.status === 1 ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                            {categoryRoom.status === 1 ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>

                                    <td className="py-2 px-4 text-center border-b">
                                        <div className="flex justify-around gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-700"
                                                onClick={() => navigate(`/Admin/CategoryRooms/${categoryRoom.categoryRoomId}`)}
                                            >
                                                Chỉnh Sửa
                                            </button>
                                            <button
                                                className="text-blue-600 hover:text-blue-700"
                                                onClick={() => handleDelete(categoryRoom.categoryRoomId)}
                                            >
                                                Xóa
                                            </button>
                                            {categoryRoom.status === 1 ? (
                                                <button
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleLock(categoryRoom.categoryRoomId)}
                                                >
                                                    Khóa
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() => handleUnlock(categoryRoom.categoryRoomId)}
                                                >
                                                    Mở Khóa
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryRoomList;
