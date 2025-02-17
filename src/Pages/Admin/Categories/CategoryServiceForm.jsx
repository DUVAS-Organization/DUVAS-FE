import React, { useState, useEffect } from 'react';
import CategoryServices from '../../../Services/Admin/CategoryServices';
import { useNavigate, useParams } from 'react-router-dom';
import { showCustomNotification } from '../../../Components/Notification';
import { FaArrowLeft } from "react-icons/fa";

const CategoryServiceForm = () => {
    const [categoryService, setcategoryServices] = useState({
        categoryServiceId: 0,
        categoryServiceName: '',
    });
    const { categoryServiceId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (categoryServiceId) {
            CategoryServices.getCategoryServiceById(categoryServiceId)
                .then(data => {
                    setcategoryServices({
                        categoryServiceId: data.categoryServiceId,
                        categoryServiceName: data.categoryServiceName,
                    });
                })
                .catch(error => console.error('Error fetching Category Service:', error));
        } else {
            setcategoryServices({
                categoryServiceId: 0,
                categoryServiceName: '',
            });
        }
    }, [categoryServiceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let categoryServicesData = {
                categoryServiceName: categoryService.categoryServiceName || '',
            };

            if (categoryServiceId) {
                categoryServicesData = {
                    ...categoryServicesData,
                    categoryServiceId: categoryService.categoryServiceId,
                };
                await CategoryServices.updateCategoryService(categoryServiceId, categoryServicesData);
                showCustomNotification("success", "Chỉnh sửa thành công!");
            } else {
                await CategoryServices.addCategoryService(categoryServicesData);
                showCustomNotification("success", "Tạo thành công!");
            }
            navigate('/Admin/CategoryServices');
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
                <h1 className="text-3xl font-bold mb-6 text-blue-600 text-left">
                    {categoryServiceId ? 'Chỉnh sửa Loại Dịch Vụ' : 'Tạo Loại Dịch Vụ'}
                </h1>
                <div className="border-t-2 border-gray-500 w-full mb-5"></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Loại Dịch Vụ:
                    </label>
                    <input
                        type="text"
                        value={categoryService.categoryServiceName}
                        onChange={(e) =>
                            setcategoryServices({ ...categoryService, categoryServiceName: e.target.value })
                        }
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên loại Dịch vụ"
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

export default CategoryServiceForm;
