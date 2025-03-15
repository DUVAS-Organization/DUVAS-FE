import React from "react";
import {
    FaPaperPlane,
    FaPhoneAlt,
    FaUserCheck,
} from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import logo from "../../Assets/Images/logo2.png";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-gray-100 shadow-md ">
            <div className="container mx-auto max-w-6xl px-6 py-8 ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b pb-8 items-stretch">
                    <Link
                        to='/'
                    >
                        <div className="flex flex-col justify-evenly">
                            <div className="flex justify-center md:justify-start">
                                <img
                                    src={logo}
                                    alt="Company Logo"
                                    className="h-48 w-96 border rounded-lg border-gray-200 shadow-lg p-2"
                                />
                            </div>
                        </div>
                    </Link>
                    {/* Cột 2: Giới thiệu DUVAS */}
                    <div className="flex flex-col  justify-center text-center md:text-left">
                        <h2 className="text-lg font-medium text-gray-800 mb-2">
                            Giới thiệu DUVAS
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            DUVAS là website quản lý căn hộ và cung cấp các dịch vụ đi kèm dành cho
                            sinh viên tại Làng Đại học Đà Nẵng, giúp cải thiện chất lượng cuộc sống sinh
                            viên thông qua các giải pháp quản lý tiện ích, thanh toán trực tuyến và hỗ
                            trợ bảo trì.
                        </p>
                    </div>

                    {/* Cột 3: Liên hệ */}
                    <div className="flex flex-col mt-5 text-center md:text-left">
                        <h2 className="text-lg font-medium text-gray-800 mb-2">Liên hệ</h2>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center justify-center md:justify-start">
                                <FaPhoneAlt className="mr-2" />
                                Hotline: 0385 884 912
                            </li>
                            <li className="flex items-center justify-center md:justify-start">
                                <IoMdMail className="mr-2" />
                                Email: phongtrolangdaihoc.duvas@gmail.com
                            </li>
                            <li className="flex items-center justify-center md:justify-start">
                                <FaUserCheck className="mr-2" />
                                Hỗ trợ trực tuyến
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Phần dưới: Copyright */}
                <div className="flex justify-center pt-8">
                    <p className="text-sm text-gray-500">
                        Copyright ©2025 DUVAS.com.vn. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
