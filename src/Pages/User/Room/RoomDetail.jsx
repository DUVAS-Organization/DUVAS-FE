import React, { useState } from "react";
import { FaCamera, FaRegHeart, FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { FaGlobe, FaBook, FaUserTie, FaLock } from "react-icons/fa";
import { FaSignOutAlt, FaHandHoldingDollar } from "react-icons/fa6";
import RangeSlider from "../../../Components/RangeSlider";
import { FaDollarSign, FaRulerCombined, FaBed, FaBath, FaBuilding, FaCompass, FaHome, FaArrowsAltH, FaRoad, FaFileAlt, FaCouch } from "react-icons/fa";

const RoomDetail = () => {
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const onApply = (filterData) => {
        console.log("Bộ lọc được áp dụng:", filterData);
        // Thực hiện xử lý dữ liệu ở đây (gọi API, cập nhật state, v.v.)
    };

    const handleApply = () => {
        onApply({ minPrice, maxPrice, selectedPrice });
    };

    const handleClickEnter = () => {
        setDropdownOpen(true);
    };

    return (
        <main className="container mx-auto mt-6 px-6">
            <div className="flex flex-col lg:flex-row">
                <div className="lg:w-2/3">
                    <div className="bg-white shadow rounded-lg p-4">
                        <div className="relative">
                            <img
                                alt="Property image"
                                className="w-full h-auto rounded-lg"
                                src="https://storage.googleapis.com/a1aa/image/ror8b3rNqiTvlPSJEKsmyKtRRExnReYfk3niX3Cjl-c.jpg"
                            />
                            <button className="absolute top-2 left-2 bg-white p-2 rounded-full shadow">
                                <FaCamera />
                            </button>
                            <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded">
                                1 / 11
                            </div>
                        </div>
                        <div className="flex mt-4 space-x-2">
                            {[...Array(5)].map((_, index) => (
                                <img
                                    key={index}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-24 h-16 rounded-lg"
                                    src={`https://storage.googleapis.com/a1aa/image/sample${index + 1}.jpg`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-4 mt-4">
                        <h1 className="text-2xl font-bold">
                            Bán căn BT5B-16 diện tích 140m2 tại Ciputra Tây Hồ sát CV 65HA và sân Golf giá 48 tỷ. LH 0969 524 ***
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Dự án Kita Capital Ciputra, Đường Võ Chí Công, Phường Phú Thượng, Tây Hồ, Hà Nội
                        </p>
                        <div className="flex items-center mt-4">
                            <div className="text-2xl font-bold text-green-600">48 tỷ</div>
                            <div className="text-gray-600 ml-4">~342,86 triệu/m²</div>
                        </div>
                        <div className="flex items-center mt-2">
                            <div className="text-gray-600">Diện tích</div>
                            <div className="text-gray-900 ml-2">140 m²</div>
                            <div className="text-gray-600 ml-4">Phòng ngủ</div>
                            <div className="text-gray-900 ml-2">4 PN</div>
                        </div>
                        <div className="mt-4">
                            <button className="bg-green-100 text-green-600 px-4 py-2 rounded">
                                +14% Giá tại dự án này đã tăng trong vòng 1 năm qua.
                            </button>
                            <button className="text-blue-600 ml-4">Xem lịch sử giá</button>
                        </div>
                        <div className="bg-white text-gray-800 max-w-4xl mx-auto p-4">
                            <h1 className="text-xl font-semibold mb-4">Đặc điểm bất động sản</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <PropertyDetail icon={<FaDollarSign />} label="Mức giá" value="48 tỷ" />
                                    <PropertyDetail icon={<FaRulerCombined />} label="Diện tích" value="140 m²" />
                                    <PropertyDetail icon={<FaBed />} label="Số phòng ngủ" value="4 phòng" />
                                    <PropertyDetail icon={<FaBath />} label="Số phòng tắm, vệ sinh" value="5 phòng" />
                                    <PropertyDetail icon={<FaBuilding />} label="Số tầng" value="4 tầng" />
                                    <PropertyDetail icon={<FaCompass />} label="Hướng nhà" value="Nam" />
                                </div>
                                <div>
                                    <PropertyDetail icon={<FaHome />} label="Hướng ban công" value="Nam" />
                                    <PropertyDetail icon={<FaArrowsAltH />} label="Mặt tiền" value="7 m" />
                                    <PropertyDetail icon={<FaRoad />} label="Đường vào" value="23,5 m" />
                                    <PropertyDetail icon={<FaFileAlt />} label="Pháp lý" value="Sổ đỏ/ Sổ hồng" />
                                    <PropertyDetail icon={<FaCouch />} label="Nội thất" value="Không nội thất" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/3 lg:pl-6 mt-6 lg:mt-0">
                    <div className="bg-white shadow rounded-lg p-4">
                        <div className="flex items-center">
                            <img
                                alt="Agent profile"
                                className="w-12 h-12 rounded-full"
                                src="https://storage.googleapis.com/a1aa/image/sample-agent.jpg"
                            />
                            <div className="ml-4">
                                <div className="font-bold">Nguyễn Bình Gđkd</div>
                                <div className="text-gray-600">Xem thêm 11 tin khác</div>
                            </div>
                        </div>
                        <button className="bg-blue-500 text-white w-full mt-4 py-2 rounded">Chat qua Zalo</button>
                        <button className="bg-teal-500 text-white w-full mt-2 py-2 rounded">0969 524 *** - Hiện số</button>
                    </div>
                </div>
            </div>
        </main>
    );
};
const PropertyDetail = ({ icon, label, value }) => {
    return (
      <div className="flex items-center mb-2">
        <span className="mr-2 text-gray-600">{icon}</span>
        <span className="font-medium">{label}</span>
        <span className="ml-auto">{value}</span>
      </div>
    );
  };
export default RoomDetail;
