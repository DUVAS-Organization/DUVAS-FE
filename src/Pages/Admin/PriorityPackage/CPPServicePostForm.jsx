import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showCustomNotification } from '../../../Components/Notification';
import { FaArrowLeft } from 'react-icons/fa';
import CPPServicePostsService from '../../../Services/Admin/CPPServicePostsService';
import PriceInput from '../../../Components/Layout/Range/PriceInput';

const CPPServicePostForm = () => {
    const [cppServicePost, setCppServicePost] = useState({
        categoryPriorityPackageServicePostId: 0,
        categoryPriorityPackageServicePostValue: 0,
        price: 0,
        status: 1,
    });
    const [isLoading, setIsLoading] = useState(false);
    const { categoryPriorityPackageServicePostId } = useParams();
    const navigate = useNavigate();


    const parsePrice = (value) => {
        if (!value && value !== 0) return '';
        if (typeof value === 'number') return value;
        return value.replace(/\./g, '');
    };

    useEffect(() => {
        if (categoryPriorityPackageServicePostId) {
            setIsLoading(true);
            CPPServicePostsService.getCategoryPriorityPackageServicePostById(categoryPriorityPackageServicePostId)
                .then(data => {
                    setCppServicePost({
                        categoryPriorityPackageServicePostId: data.categoryPriorityPackageServicePostId || 0,
                        categoryPriorityPackageServicePostValue: parseInt(data.categoryPriorityPackageServicePostValue) || 0,
                        price: parseFloat(data.price) || 0,
                        status: data.status !== undefined ? parseInt(data.status) : 1,
                    });
                })
                .catch(error => {
                    console.error('Lỗi khi lấy thông tin Gói Ưu tiên Dịch Vụ:', error);
                    showCustomNotification('error', 'Không thể tải dữ liệu Gói Ưu tiên Dịch Vụ!');
                    navigate('/Admin/CategoryPriorityServices');
                })
                .finally(() => setIsLoading(false));
        } else {
            setCppServicePost({
                categoryPriorityPackageServicePostId: 0,
                categoryPriorityPackageServicePostValue: 0,
                price: 0,
                status: 1,
            });
        }
    }, [categoryPriorityPackageServicePostId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const value = parseInt(cppServicePost.categoryPriorityPackageServicePostValue);
            if (isNaN(value) || value <= 0) {
                showCustomNotification('error', 'Giá trị Gói Ưu tiên phải là số nguyên lớn hơn 0!');
                return;
            }
            const price = parseFloat(parsePrice(cppServicePost.price));
            if (isNaN(price) || price <= 0) {
                showCustomNotification('error', 'Giá phải là số lớn hơn 0!');
                return;
            }

            const cppServicePostData = {
                categoryPriorityPackageServicePostValue: value,
                price: price,
                status: parseInt(cppServicePost.status),
            };

            if (categoryPriorityPackageServicePostId) {
                cppServicePostData.categoryPriorityPackageServicePostId = parseInt(cppServicePost.categoryPriorityPackageServicePostId);
                await CPPServicePostsService.updateCategoryPriorityPackageServicePost(categoryPriorityPackageServicePostId, cppServicePostData);
                showCustomNotification('success', 'Chỉnh sửa thành công!');
            } else {
                await CPPServicePostsService.createCategoryPriorityPackageServicePost(cppServicePostData);
                showCustomNotification('success', 'Tạo thành công!');
            }
            navigate('/Admin/CategoryPriorityServices');
        } catch (error) {
            console.error('Lỗi trong handleSubmit:', error);
            console.log('Chi tiết lỗi API:', error.response?.data);
            showCustomNotification('error', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
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
                            {categoryPriorityPackageServicePostId ? 'Chỉnh sửa Gói Ưu tiên Dịch Vụ' : 'Tạo Gói Ưu tiên Dịch Vụ'}
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
                                value={cppServicePost.categoryPriorityPackageServicePostValue}
                                onChange={(e) => setCppServicePost({ ...cppServicePost, categoryPriorityPackageServicePostValue: e.target.value })}
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
                                value={cppServicePost.price || 0}
                                onChange={(val) => setCppServicePost({ ...cppServicePost, price: val })}
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

export default CPPServicePostForm;
