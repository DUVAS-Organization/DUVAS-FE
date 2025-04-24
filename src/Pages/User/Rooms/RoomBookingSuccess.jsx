import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const RoomBookingSuccess = () => {
    return (
        <div className="min-h-96 flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 dark:text-white">
            {/* Icon thông báo thành công */}
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />

            {/* Tiêu đề */}
            <h1 className="text-2xl font-bold mb-2">
                Bạn đã đặt phòng thành công!
            </h1>

            {/* Thông báo */}
            <p className="text-gray-700 mb-6 text-center max-w-md dark:text-white">
                Vui lòng chờ chủ phòng xác nhận. <br />
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
            </p>

            {/* Nút điều hướng (ví dụ quay lại trang chủ) */}
            <Link
                to="/"
                className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
            >
                Quay lại trang chủ
            </Link>
        </div>
    );
};

export default RoomBookingSuccess;
