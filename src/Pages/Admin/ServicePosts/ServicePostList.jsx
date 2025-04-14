import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Icon from '../../../Components/Icon';
import ServicePost from "../../../Services/Admin/ServicePost";
import CategoryServices from "../../../Services/Admin/CategoryServices";
import Counts from '../../../Components/Counts';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaChevronDown } from "react-icons/fa";

const ServicePostList = () => {
    const [servicePosts, setServicePosts] = useState([]);
    const [categoryServices, setCategoryServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [searchTerm, selectedCategory, sortOrder]);

    const fetchData = async () => {
        try {
            const servicePostsData = await ServicePost.getServicePosts(searchTerm);
            const filteredServicePosts = selectedCategory
                ? servicePostsData.filter(servicePost => servicePost.categoryServiceName === selectedCategory)
                : servicePostsData;
            filteredServicePosts.sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (sortOrder === 'asc') {
                    return titleA.localeCompare(titleB);
                } else {
                    return titleB.localeCompare(titleA);
                }
            });
            setServicePosts(filteredServicePosts);


            const categoryData = await CategoryServices.getCategoryServices();
            setCategoryServices(categoryData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };
    const handleCreate = () => {
        navigate('/Admin/ServicePost/Creates');
    };
    const handleRowClick = (servicePostId) => {
        navigate(`/Admin/ServicePost/Details/${servicePostId}`);
    };
    return (
        <div className="p-6">
            <Counts />
            <div className='font-bold text-4xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1 >Bài Đăng Dịch Vụ</h1>
                <button
                    onClick={handleCreate}
                    className='flex mr-2 items-center text-white bg-blue-500 rounded-3xl h-11 px-2'>
                    <FiPlus className="mr-2 text-xl" />
                    <p className="font-semibold text-lg">Tạo Bài Đăng</p>
                </button>
            </div>
            <div className="flex items-center mb-6">
                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center  mr-2 border bg-white border-gray-300 rounded-lg px-3 py-2 mb-2 sm:mb-0 hover:bg-gray-100 transition"
                >
                    <FiFilter className="text-lg" />
                    <span className="font-medium text-base">
                        Tên ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                    </span>
                </button>

                <select className="border border-gray-300 flex items-center px-3 py-2 rounded-lg shadow-sm font-medium text-base"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option className="text-lg font-medium" value="" disabled>
                        Loại Dịch Vụ
                    </option>
                    {categoryServices.map(categoryService => (
                        <option key={categoryService.categoryServiceId} value={categoryService.categoryServiceName}>
                            {categoryService.categoryServiceName}
                        </option>
                    ))}
                </select>
                {/* <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                >
                    <p className="font-bold text-xl">Giá</p>
                    <FaChevronDown className='ml-2 mt-1' />
                </button> */}
                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Tìm kiếm theo tiêu đề hoặc địa chỉ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Icon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" name="search" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 text-center font-semibold text-black">#</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tên</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Tiêu Đề</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Giá</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Địa Chỉ</th>
                            <th className="py-2 px-4 text-left font-semibold text-black">Mô Tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicePosts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-2 text-center text-gray-500">Không tìm thấy kết quả</td>
                            </tr>
                        ) : (
                            servicePosts.map((servicePost, index) => (
                                <tr
                                    key={servicePost.userId}
                                    onClick={() => handleRowClick(servicePost.servicePostId)}
                                    className="hover:bg-gray-200 border-collapse border border-gray-300"
                                >
                                    <td className="py-2 px-4 text-center text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.name}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b truncate max-w-[250px]">{servicePost.title}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.price.toLocaleString('vi-VN')} đ</td>
                                    <td className="py-2 px-4 text-gray-700 border-b truncate max-w-[250px]">{servicePost.location}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b truncate max-w-[250px]">{servicePost.description}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default ServicePostList;
