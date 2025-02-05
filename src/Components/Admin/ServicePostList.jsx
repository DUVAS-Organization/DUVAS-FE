import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Icon from '../Icon';
import ServicePost from "../../Services/Admin/ServicePost";
import CategoryServices from "../../Services/Admin/CategoryServices";
import Counts from './Counts'
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaChevronDown } from "react-icons/fa";

const ServicePostList = () => {
    const [servicePosts, setServicePosts] = useState([]);
    const [categoryServices, setCategoryServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [searchTerm, selectedCategory]);

    const fetchData = async () => {
        try {
            const servicePostsData = await ServicePost.getServicePosts(searchTerm);
            // Lọc theo selectedCategory nếu có
            const filteredServicePosts = selectedCategory
                ? servicePostsData.filter(servicePost => servicePost.categoryServiceName === selectedCategory)
                : servicePostsData;

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

    return (
        <div className="p-6">
            <Counts />
            <div className='font-bold text-6xl ml-3 my-8 text-blue-500 flex justify-between'>
                <h1 >Bài Đăng Dịch Vụ</h1>
                <button
                    onClick={handleCreate}
                    className='flex mr-2 items-center text-white bg-blue-500 rounded-3xl h-11 px-2'>
                    <FiPlus className="mr-2 text-xl" />
                    <p className="font-semibold text-lg">Tạo Bài Đăng</p>
                </button>
            </div>
            <div className="flex items-center mb-6">
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl">
                    <FiFilter className="mr-2 text-xl" />
                    <p className="font-bold text-xl">Name (A-Z)</p>
                </button>

                <select className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8 font-bold text-xl"
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
                <button className="border-2 border-gray-500 flex items-center p-2 rounded-xl ml-8"
                >
                    <p className="font-bold text-xl">Giá</p>
                    <FaChevronDown className='ml-2 mt-1' />
                </button>
                <div className="relative w-1/3 mx-2 ml-auto">
                    <input
                        className="border w-full h-11 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Search..."
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
                            <th className="py-2 px-4 text-left font-semibold text-black">#</th>
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
                                    className="hover:bg-gray-200 border-collapse border border-gray-300"
                                >
                                    <td className="py-2 px-4 text-gray-700 border-b">{index + 1}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.name}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.title}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.price}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.location}</td>
                                    <td className="py-2 px-4 text-gray-700 border-b">{servicePost.description}</td>
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
