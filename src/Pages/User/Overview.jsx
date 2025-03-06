import React from 'react';
import Layout from '../../Components/Layout/Layout';
import { FaRegBell, FaWallet, FaRegNewspaper } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Footer from '../../Components/Layout/Footer';

const Overview = () => {
    return (
        <Layout showFooter={false} showNavbar={false} showSidebar={true}>
            <div className="container mx-auto max-w-6xl p-6 bg-white">
                <div className="flex justify-between items-center mb-4 border-b-2 border-gray-300 pb-2">
                    <h1 className="text-4xl font-semibold mb-5">
                        Tổng quan
                    </h1>
                    {/* <div className="flex flex-col items-center space-y-1">
                        <div className="relative inline-block">
                            <FaRegBell className="text-2xl" />
                            <span className="
                                    absolute 
                                    -top-1  
                                    -right-1 
                                    text-xs font-bold
                                    bg-red-600 text-white
                                    rounded-full
                                    w-4 h-4
                                    flex items-center justify-center
                                    leading-none
                                ">
                                2
                            </span>
                        </div>
                        <span>Thông báo</span>
                    </div> */}
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                        Tổng quan tài khoản
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center mb-2 font-semibold">
                                <FaRegNewspaper className='text-2xl mr-2' />
                                <span className="font-semibold text-xl">
                                    Tin đăng
                                </span>
                            </div>
                            <p className="text-2xl font-bold">
                                0 tin
                            </p>
                            <p className="text-gray-500">
                                Đang hiển thị
                            </p>
                            <div className="flex">
                                <Link
                                    to="/ServicePost/Creates"
                                    className="text-red-600 font-medium underline underline-offset-2" href="#">
                                    Đăng tin
                                </Link>
                                <p className='text-red-600 font-medium ml-1'> &gt;</p>
                            </div>
                        </div>

                        <div className="bg-white px-4 py-2 rounded-lg shadow-md w-64 ml-10">
                            <h2 className="text-lg font-semibold ">Số dư tài khoản</h2>
                            <div className="flex justify-between mb-2">
                                <span>TK Chính</span>
                                <span>0</span>
                            </div>
                            <div className="flex justify-between mb-4">
                                <span>TK Khuyến mãi</span>
                                <span>0</span>
                            </div>
                            <div className="flex">
                                <Link
                                    to="/Moneys"
                                    className="text-red-600 font-medium underline underline-offset-2" href="#">
                                    Nạp tiền
                                </Link>
                                <p className='text-red-600 font-medium ml-1'> &gt;</p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <div className="bg-red-100 p-4 rounded-lg shadow flex items-center justify-between">
                                <div className="flex items-center">
                                    <i className="fas fa-users text-xl mr-2">
                                    </i>
                                    <div>
                                        <p className="font-semibold">
                                            Gói Hội Viên
                                        </p>
                                        <p className="text-red-600">
                                            Tiết kiệm đến 39%
                                        </p>
                                    </div>
                                </div>
                                <a className="bg-white text-red-600 px-4 py-2 rounded-lg border border-red-600" href="#">
                                    Tìm hiểu ngay
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        Thông tin dành riêng cho bạn
                    </h2>
                    <div className="flex mb-4">
                        <button className="bg-black text-white px-4 py-2 rounded-lg mr-2">
                            Tất cả
                        </button>
                        <button className="bg-gray-200 text-black px-4 py-2 rounded-lg">
                            Đã tạm ẩn
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center mb-2">
                                <i className="fas fa-fire text-xl text-red-600 mr-2">
                                </i>
                                <span className="font-semibold">
                                    Quan trọng
                                </span>
                                <span className="ml-auto text-red-600">
                                    0
                                </span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center mb-2">
                                <i className="fas fa-info-circle text-xl text-green-600 mr-2">
                                </i>
                                <span className="font-semibold">
                                    Thông tin
                                </span>
                                <span className="ml-auto text-red-600">
                                    0
                                </span>
                            </div>
                            <div className="flex items-center">
                                <img alt="Thumbs up icon" className="w-8 h-8 rounded-full mr-2" height="50" src="https://storage.googleapis.com/a1aa/image/ToU1umnFzhbDvzlTtdEF_RE32gVftw9b9yhcPmK12bs.jpg" width="50" />
                                <p>
                                    Bạn đã cập nhật tất cả thông tin của ngày hôm nay 👏
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center mb-2">
                                <i className="fas fa-heart text-xl text-blue-600 mr-2">
                                </i>
                                <span className="font-semibold">
                                    Gợi ý
                                </span>
                                <span className="ml-auto text-red-600">
                                    2
                                </span>
                            </div>
                            <div>
                                <p className="font-semibold mb-2">
                                    Làm quen với trang Tổng quan!
                                </p>
                                <p className="text-gray-500 mb-2">
                                    Hướng dẫn bạn làm quen và thao tác với một số nội dung chính, giúp bạn có trải nghiệm tốt hơn.
                                </p>
                                <ul className="list-disc list-inside text-gray-500">
                                    <li>
                                        Thông tin tổng quan về tài khoản của bạn
                                    </li>
                                    <li>
                                        Thông tin cá nhân hoá dành riêng cho bạn
                                    </li>
                                    <li>
                                        Ẩn những thông tin mà bạn thấy không hữu ích
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
};

export default Overview;
