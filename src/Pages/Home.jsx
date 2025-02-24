import { FaCamera, FaRegHeart, FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";
import { NavLink, } from 'react-router-dom'
import { useState } from 'react'
import { FaGlobe, FaBook, FaUserTie, FaLock } from 'react-icons/fa'
import { FaSignOutAlt, FaHandHoldingDollar } from 'react-icons/fa6'
import RangeSlider from "../Components/RangeSlider";

const Home = () => {
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
        <div className="bg-white">
            <div className="bg-red-500 p-4">
                <div className="mx-auto max-w-6xl">
                    {/* Tab chọn */}
                    <div className="flex gap-1">
                        <div className="bg-red-800 text-white rounded-t-lg px-4 py-2">
                            Nhà đất bán
                        </div>
                        <div className="bg-gray-200 text-gray-800 rounded-t-lg px-4 py-2">
                            Nhà cho thuê
                        </div>
                        <div className="bg-gray-200 text-gray-800 rounded-t-lg px-4 py-2">
                            Dự án
                        </div>
                    </div>

                    {/* Phần tìm kiếm */}
                    <div className="shadow-lg rounded-b-lg p-4">
                        <div className="bg-white flex items-center space-x-2 rounded-lg">
                            {/* Địa điểm */}
                            <div className="flex items-center bg-gray-100 px-4 py-2 flex-shrink-0">
                                <FaMapMarkerAlt className="text-gray-500" />
                                <span className="mx-2">Đà Nẵng</span>
                            </div>
                            <h1 className="font-medium text-gray-500 flex-shrink-0">|</h1>
                            {/* Container input */}
                            <div className="relative flex-1">
                                <input
                                    className="w-full bg-gray-100 rounded-lg pl-10 pr-28 py-2"
                                    placeholder="Nhập tối đa 3 địa điểm."
                                    type="text"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 bg-red-600 text-white rounded-lg px-4 mx-2">
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>

                        {/* Ba select */}
                        <div className="flex space-x-2 mt-2">
                            <select className="w-1/3 bg-red-800 text-white rounded-lg px-4 py-2">
                                <option>Loại Nhà cho thuê</option>
                            </select>
                            <button
                                onClick={handleClickEnter}
                                className="w-1/3 bg-red-800 text-white text-left rounded-lg px-4 py-2 select-none relative">
                                Mức giá
                                {/* Dropdown menu */}
                                {dropdownOpen && (
                                    <div className="bg-white rounded-lg shadow-lg p-4 w-80 absolute top-full left-0 z-10">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg text-gray-800 font-semibold">Mức giá</h2>
                                            <button className="text-gray-500" onClick={() => setDropdownOpen(false)}>
                                                <FaTimes />
                                            </button>
                                        </div>

                                        {/* Nhập giá */}
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex flex-col items-center">
                                                <label className="text-sm font-medium text-black mb-1">Giá thấp nhất</label>
                                                <input
                                                    type="number"
                                                    placeholder="Từ"
                                                    className="border rounded px-2 py-1 text-gray-800 text-center w-20"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(Number(e.target.value))}
                                                />
                                            </div>
                                            <span className="text-xl text-gray-600">→</span>
                                            <div className="flex flex-col items-center">
                                                <label className="text-sm font-medium text-black mb-1">Giá cao nhất</label>
                                                <input
                                                    type="number"
                                                    placeholder="Đến"
                                                    className="border rounded px-2 py-1 text-gray-800 text-center w-20"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        {/* Range slider */}
                                        <RangeSlider
                                            className="my-5"
                                            min={0}
                                            max={100}
                                            minValue={minPrice}
                                            maxValue={maxPrice}
                                            onChange={(minVal, maxVal) => {
                                                setMinPrice(minVal);
                                                setMaxPrice(maxVal);
                                            }}
                                        />

                                        {/* Chọn khoảng giá */}
                                        <div className="mb-4">
                                            {[
                                                { value: "all", label: "Tất cả mức giá" },
                                                { value: "under500", label: "Dưới 500 triệu" },
                                                { value: "500-800", label: "500 - 800 triệu" },
                                                { value: "800-1b", label: "800 triệu - 1 tỷ" },
                                                { value: "1-2b", label: "1 - 2 tỷ" }
                                            ].map((item) => (
                                                <div className="flex items-center mb-2" key={item.value}>
                                                    <input
                                                        type="radio"
                                                        name="price"
                                                        className="form-radio text-red-500"
                                                        checked={selectedPrice === item.value}
                                                        onChange={() => setSelectedPrice(item.value)}
                                                    />
                                                    <span className="ml-2 text-gray-700">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex justify-between">
                                            <button
                                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                                                onClick={() => {
                                                    setMinPrice(0);
                                                    setMaxPrice(100);
                                                    setSelectedPrice("all");
                                                }}
                                            >
                                                Đặt lại
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-4 py-2 rounded"
                                                onClick={handleApply}
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </button>
                            <select className="w-1/3 bg-red-800 text-white rounded-lg px-4 py-2">
                                <option>Diện tích</option>
                            </select>

                        </div>
                    </div>
                </div>
            </div>



            <div className="max-w-6xl mx-auto mt-8">
                <div className="flex justify-between items-center pb-2">
                    <div className="flex space-x-4 text-xl">
                        <div className="text-red-600 font-bold  border-b-2 border-red-600">Tin nổi bật</div>
                        <div className="text-gray-600">Tin tức</div>
                    </div>
                    <div className="text-red-600">Xem thêm →</div>
                </div>
                <div className="mt-4">
                    <div className="flex space-x-4">
                        <div className="w-1/3">
                            <img
                                className="rounded-lg shadow-md overflow-hidden"
                                alt="Image of a cityscape with buildings"
                                height="200"
                                src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                                width="w-full"
                            />
                            <div className="mt-2 text-gray-800 font-bold">
                                Nguồn Vốn Tiếp Tục Là Thách Thức Của Thị Trường Bất Động Sản Năm 2025
                            </div>
                        </div>
                        <div className="w-1/3">
                            <img
                                className="rounded-lg shadow-md overflow-hidden"
                                alt="Image of a cityscape with buildings"
                                height="200"
                                src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                                width="w-full"
                            />
                            <div className="mt-2 text-gray-800 font-bold">
                                Từ Nhật Nét Đến Tư Tìm Hành Trình Chinh Phục Thị Trường Bất Động Sản
                            </div>
                        </div>
                        <div className="w-1/3 ">
                            <img
                                className="rounded-lg shadow-md overflow-hidden"
                                alt="Image of a cityscape with buildings"
                                height="200"
                                src="https://storage.googleapis.com/a1aa/image/DEtIGStEO_sg24yKvGcjViznxp5GVEZmRfoqAcQ5GHI.jpg"
                                width="w-full"
                            />
                            <div className="mt-2 text-gray-800 font-bold">
                                Thị Trường Bất Động Sản Đang Trên Đà Phục Hồi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto max-w-6xl py-8 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-4">Phòng trọ dành cho bạn</h1>
                    </div>
                    <div className="space-x-4">
                        <a className="text-black hover:text-gray-600" href="#">
                            Tin nhà đất bán mới nhất
                        </a>
                        <span>|</span>
                        <a className="text-black hover:text-gray-600" href="#">
                            Tin nhà cho thuê mới nhất
                        </a>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="Street view of a residential area"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/VyDS9FTmcgBzTKoJr0vYxEqrnuzQpW40PzmwqRGpY_Y.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Cho thuê phòng trọ đường Tú Xương Phường Hiệp Phú, 68 m²
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">6,35 tỷ • 68 m²</p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Thủ Đức, Hồ Chí Minh
                            </p>
                            <p className="text-gray-500 text-sm">Đăng hôm nay</p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="Apartment building"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/oCod0DCamLlEJNBQdJjAfx4rUy-EL6GgxOxD2Sw-WYI.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Cho thuê phòng trọ sát ngã tư phố Ngụy Như Kon Tum Lê Văn Thiêm
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">17,3 tỷ • 56 m²</p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Thanh Xuân, Hà Nội
                            </p>
                            <p className="text-gray-500 text-sm">Đăng hôm nay</p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="Residential building"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/AyXpfGsauNHYv1YYW9es7cxDn60-m4I9IRsqnHHDnQE.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Giảm 7 tỷ!  Cho thuê phòng trọ 2 MT khu Phan Xích Long, P7, Phú Nhuận
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">
                                27 tỷ • 120,4 m²
                            </p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Phú Nhuận, Hồ Chí Minh
                            </p>
                            <p className="text-gray-500 text-sm">Đăng hôm nay</p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="High-rise apartment buildings"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/yzvup0Wk4UVq0AOl9kMt_13uZP1PoUMEW7zTlLlmt2E.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Căn hộ HQC Plaza(Bình Chánh) giá 1.2 tỷ có 2PN 63m2. DT 0909...
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">1 tỷ • 55 m²</p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Bình Chánh, Hồ Chí Minh
                            </p>
                            <p className="text-gray-500 text-sm">Đăng hôm nay</p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>

                    {/* Card 5 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="Warehouse interior"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/JU4Y6wc6h40iDMIFehBfEAFR38rJjoWEhw-BXRWQe1U.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Cho thuê phòng trọ 600m2 giá rẻ 22tr ở TP Thuận An, Bình Dương
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">
                                22 triệu/tháng • 600 m²
                            </p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Thuận An, Bình Dương
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>

                    {/* Card 6 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="Apartment with city view"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/gWpiknQi10f2hGP0ZftQ1Mw9y_VKOe76Y_MyAp1IAr8.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Cho thuê căn hộ 2PN 83M2 M3 căn 06 Vinhomes...
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">11,8 tỷ • 83 m²</p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Vinhomes
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>

                    {/* Card 7 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="Aerial view of a residential area"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/mTSv1iaFN1NZ3YoIM6rkXNH6goVDM62MgpB0R_Lc1Lk.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Cho thuê phòng trọ Lạc Hồng Phúc, Mỹ Hào, Hưng Yên
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">1 tỷ • 50 m²</p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Mỹ Hào, Hưng Yên
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>

                    {/* Card 8 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            alt="Warehouse interior"
                            className="w-full h-48 object-cover"
                            height="400"
                            src="https://storage.googleapis.com/a1aa/image/JU4Y6wc6h40iDMIFehBfEAFR38rJjoWEhw-BXRWQe1U.jpg"
                            width="600"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                                Cho thuê xưởng 300m2 giá 16tr/th phường Thuận Giao, TP...
                            </h2>
                            <p className="text-red-500 font-semibold mb-2">
                                16 triệu/tháng • 300 m²
                            </p>
                            <p className="text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt"></i> Thuận Giao
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">
                                <FaRegHeart />
                            </span>
                            <span className="text-gray-600 flex">
                                <FaCamera className="mt-1 mx-1" /> 3
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Home;
