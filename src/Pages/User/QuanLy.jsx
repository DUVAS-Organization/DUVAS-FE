import React from "react";

const CustomerManagement = () => {
    return (
        <div className="bg-gray-100 font-sans">
            <div className="container mx-auto mt-4 flex">
                <aside className="w-1/4 bg-white p-4 shadow">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700">
                            U
                        </div>
                        <div>
                            <p className="text-gray-700">user4037654</p>
                            <p className="text-gray-500 text-sm">0 điểm</p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-gray-700 font-semibold">Số dư tài khoản</p>
                        <div className="flex justify-between text-gray-700">
                            <span>TK Chính</span>
                            <span>0</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>TK Khuyến mãi</span>
                            <span>0</span>
                        </div>
                        <div className="flex justify-between text-gray-700 mt-2">
                            <span>Mã chuyển khoản</span>
                            <span>BDS40376543</span>
                        </div>
                        <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded">
                            Nạp tiền
                        </button>
                    </div>
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <a className="flex items-center text-gray-700 hover:text-red-600" href="#">
                                    <i className="fas fa-home mr-2"></i>
                                    Tổng quan
                                </a>
                            </li>
                            <li>
                                <a className="flex items-center text-gray-700 hover:text-red-600" href="#">
                                    <i className="fas fa-users mr-2"></i>
                                    Quản lý khách hàng
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <main className="w-3/4 bg-white p-4 shadow ml-4">
                    <h1 className="text-xl font-semibold text-gray-700 mb-4">Quản lý khách hàng</h1>
                    <div className="flex items-center mb-4">
                        <input
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Tìm theo tên khách hàng, SDT hoặc email"
                            type="text"
                        />
                        <button className="ml-2 bg-gray-200 text-gray-700 px-4 py-2 rounded">Chỉ chưa đọc</button>
                        <button className="ml-2 bg-gray-200 text-gray-700 px-4 py-2 rounded">
                            <i className="fas fa-filter"></i> Lọc theo nhãn
                        </button>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-1/2 flex flex-col items-center justify-center text-center text-gray-500">
                            <img
                                alt="No customers illustration"
                                className="mb-4"
                                height="100"
                                src="https://storage.googleapis.com/a1aa/image/qvKuiHTuItBP9WvFEFpBVrXN4-nW_sueQJtQulEIV5Q.jpg"
                                width="100"
                            />
                            <p>Chưa có khách hàng nào</p>
                            <p>Hiện tại bạn chưa có khách hàng nào</p>
                        </div>
                        <div className="w-1/2 flex flex-col items-center justify-center text-center text-gray-500">
                            <img
                                alt="No selected customers illustration"
                                className="mb-4"
                                height="100"
                                src="https://storage.googleapis.com/a1aa/image/A53DlBiQ8mrYv6URt4Ot_YHzUx6UQw1NNh9sMMHDCG0.jpg"
                                width="100"
                            />
                            <p>Không có khách hàng nào được chọn</p>
                            <p>Chọn một khách hàng để xem chi tiết</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerManagement;