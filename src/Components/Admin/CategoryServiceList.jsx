import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Icon from '../Icon';
import CategoryServices from "../../Services/Admin/CategoryServices";
import Counts from './Counts'
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaChevronDown, FaLock, FaUnlock } from "react-icons/fa";

const CategoryServiceList = () => {
    const [categoryServices, setCategoryServices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        CategoryServices.getCategoryServices()
            .then(data => {
                setCategoryServices(data);
            })
            .catch(error => console.error('Error fetching Account:', error));

    };

    const handleCreate = () => {
        navigate('/Admin/CategoryServices/Creates');
    };

    const handleDelete = (categoryServiceId) => {
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa Dịch vụ này?");

        if (isConfirmed) {
            CategoryServices.deleteCategoryService(categoryServiceId)
                .then(() => fetchData()) // Cập nhật lại danh sách sau khi xóa
                .catch(error => console.error('Lỗi khi xóa:', error));
        }
    };

    return (
        <div className="p-6">
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1 >Loại Dịch Vụ</h1>
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
                            <th className="py-2 px-4 text-left font-semibold text-black"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryServices.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            categoryServices.map((categoryService, index) => (
                                <tr key={categoryService.userId} className="hover:bg-gray-200 border-collapse border border-gray-300">
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{categoryService.categoryServiceName}</td>

                                    <td className="py-2 px-4 border-b text-blue-600 text-center underline underline-offset-2 ">
                                        <div className="flex justify-around">
                                            <button
                                                className=" text-blue-600 hover:text-blue-700"
                                                onClick={() => navigate(`/Admin/CategoryServices/${categoryService.categoryServiceId}`)}
                                            >
                                                Chỉnh Sửa
                                            </button>
                                            <button
                                                className=" text-blue-600 hover:text-blue-700"
                                                onClick={() => handleDelete(categoryService.categoryServiceId)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div >
    );
};

export default CategoryServiceList;
