import React from "react";

const RealEstatePage = () => {
    return (
        <>
            <div className="bg-black h-48">
                <img
                    alt="Header image"
                    className="w-full h-full object-cover opacity-50"
                    height="200"
                    src="https://storage.googleapis.com/a1aa/image/cnqMyM2r_XJrI_v4QjrwyeCSQaaUX097eOC6wnvQEPM.jpg"
                    width="1920"
                />
            </div>
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow">
                        <div className="flex flex-col items-center">
                            <img
                                alt="User avatar"
                                className="rounded-full mb-4"
                                height="100"
                                src="https://storage.googleapis.com/a1aa/image/-hx9vDPAjFd7G8shB879a6fDPCjl3t1aAUQ9Q-bz1Uk.jpg"
                                width="100"
                            />
                            <h2 className="text-xl font-semibold mb-4">Phan Tuấn</h2>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4 flex items-center">
                                <i className="fab fa-facebook-messenger mr-2"></i>
                                Chat Zalo
                            </button>
                            <button className="bg-teal-500 text-white px-4 py-2 rounded mb-4 flex items-center">
                                <i className="fas fa-phone-alt mr-2"></i>
                                098500****
                            </button>
                            <div className="text-center">
                                <p className="text-gray-600 mb-2">Chia sẻ trang cá nhân:</p>
                                <div className="flex justify-center space-x-4">
                                    <a className="text-blue-600" href="#">
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                    <a className="text-blue-400" href="#">
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-3/4 lg:ml-8 mt-8 lg:mt-0">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex border-b border-gray-200 mb-4">
                                <button className="text-red-600 border-b-2 border-red-600 px-4 py-2">
                                    Tin đăng bán (31)
                                </button>
                                <button className="text-gray-600 px-4 py-2">
                                    Tin đăng cho thuê (0)
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-4">
                                    <img
                                        alt="Property image 1"
                                        className="rounded mb-4"
                                        height="200"
                                        src="https://storage.googleapis.com/a1aa/image/ahm-qvAj_LkUaNTMdW9DlrWXr1S-VvyWTrQPHtlkPlo.jpg"
                                        width="300"
                                    />
                                    <h3 className="text-lg font-semibold mb-2">
                                        HOT hiếm căn Hoàng Gia Tỉnh Hoa-2 mặt tiền view công...
                                    </h3>
                                    <p className="text-red-600 font-semibold mb-2">
                                        Giá thỏa thuận - 75 m²
                                    </p>
                                    <p className="text-gray-600 mb-2">Đông Anh, Hà Nội</p>
                                    <p className="text-gray-400 text-sm">3 ngày trước</p>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4">
                                    <img
                                        alt="Property image 2"
                                        className="rounded mb-4"
                                        height="200"
                                        src="https://storage.googleapis.com/a1aa/image/mcHimp3Urat_PM2NsLv_xui2Dweiqp6Uct1iA99xhmQ.jpg"
                                        width="300"
                                    />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Tháng 3 ra mắt quỹ căn mới 75-80m2 Vip gần công viên, tiện ich...
                                    </h3>
                                    <p className="text-red-600 font-semibold mb-2">
                                        16 tỷ - 63 m²
                                    </p>
                                    <p className="text-gray-600 mb-2">Đông Anh, Hà Nội</p>
                                    <p className="text-gray-400 text-sm">3 ngày trước</p>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4">
                                    <img
                                        alt="Property image 3"
                                        className="rounded mb-4"
                                        height="200"
                                        src="https://storage.googleapis.com/a1aa/image/ZQNsgnJH32NY1o_XPgpVk1D2eeTlNRsLoBl-2osVYEs.jpg"
                                        width="300"
                                    />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Trực tiếp CDT bán BT Ciputra có hầm đã có sổ, nhận nhà...
                                    </h3>
                                    <p className="text-red-600 font-semibold mb-2">
                                        Giá thỏa thuận - 75 m²
                                    </p>
                                    <p className="text-gray-600 mb-2">Đông Anh, Hà Nội</p>
                                    <p className="text-gray-400 text-sm">Hôm qua</p>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4">
                                    <img
                                        alt="Property image 4"
                                        className="rounded mb-4"
                                        height="200"
                                        src="https://storage.googleapis.com/a1aa/image/4ojlXRJtM-t-irWxskHLkSCtvRrMWe2O53C4dKWLonM.jpg"
                                        width="300"
                                    />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Tháng 3 mở bán phân khu mới Ciputra có hầm, 6.75% giá...
                                    </h3>
                                    <p className="text-red-600 font-semibold mb-2">
                                        Giá thỏa thuận - 75 m²
                                    </p>
                                    <p className="text-gray-600 mb-2">Đông Anh, Hà Nội</p>
                                    <p className="text-gray-400 text-sm">Hôm qua</p>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4">
                                    <img
                                        alt="Property image 5"
                                        className="rounded mb-4"
                                        height="200"
                                        src="https://storage.googleapis.com/a1aa/image/7yQeu1fF0xZU7eRVpNdUMTJhT_QbSR9QZGP5LsMXe6I.jpg"
                                        width="300"
                                    />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Chính chủ MP An Dương Vương, MT 6,2m 5T...
                                    </h3>
                                    <p className="text-red-600 font-semibold mb-2">
                                        Giá thỏa thuận - 75 m²
                                    </p>
                                    <p className="text-gray-600 mb-2">Đông Anh, Hà Nội</p>
                                    <p className="text-gray-400 text-sm">Hôm qua</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default RealEstatePage;