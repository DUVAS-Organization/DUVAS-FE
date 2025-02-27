import { FaCamera, FaRegHeart, FaMapMarkerAlt, FaSearch, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { NavLink, } from 'react-router-dom'
import { useState } from 'react'
import RangeSlider from "../Components/RangeSlider";
import DropdownFilter from "../Components/DropdownFilter";
import RangeInput from '../Components/RangeInput'
const Home = () => {
    // State cho Mức giá
    const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100);
    const [selectedPrice, setSelectedPrice] = useState("all");

    // State cho Diện tích (ví dụ)
    const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
    const [minArea, setMinArea] = useState(0);
    const [maxArea, setMaxArea] = useState(1000);
    const [selectedArea, setSelectedArea] = useState("all");

    const priceOptions = [
        { value: "all", label: "Tất cả mức giá", min: 0, max: 100 },
        { value: "under5", label: "Dưới 1 triệu", min: 0, max: 1 },
        { value: "1-3", label: "1 - 3 triệu", min: 1, max: 3 },
        { value: "3-5", label: "3 - 5 triệu", min: 3, max: 5 },
        { value: "5-10", label: "5 - 10 triệu", min: 5, max: 10 },
        { value: "10-20", label: "10 - 20 triệu", min: 10, max: 20 },
        { value: "20-40", label: "20 - 40 triệu", min: 10, max: 40 },
        { value: "40-70", label: "40 - 70 triệu", min: 40, max: 70 },
        { value: "over70", label: "Trên 70 triệu", min: 70 }
    ];

    const areaOptions = [
        { value: "all", label: "Tất cả diện tích", min: 0, max: 1000 },
        { value: "under30", label: "Dưới 30 m²", min: 0, max: 30 },
        { value: "30-50", label: "30 - 50 m²", min: 30, max: 50 },
        { value: "50-80", label: "50 - 80 m²", min: 50, max: 80 },
        { value: "80-100", label: "80 - 100 m²", min: 80, max: 100 },
        { value: "100-150", label: "100 - 150 m²", min: 100, max: 150 },
        { value: "150-200", label: "150 - 200 m²", min: 150, max: 200 },
        { value: "200-250", label: "200 - 250 m²", min: 200, max: 250 },
        { value: "250-300", label: "250 - 300 m²", min: 250, max: 300 },
        { value: "300-500", label: "300 - 500 m²", min: 300, max: 500 },
        { value: "over500", label: "Trên 500 m²", min: 500 }
    ];

    const handleApplyPrice = () => {
        console.log("Giá:", minPrice, maxPrice, selectedPrice);
    };

    const handleApplyArea = () => {
        console.log("Diện tích:", minArea, maxArea, selectedArea);
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
                            <div className="w-1/3 relative">
                                <button
                                    onClick={() => {
                                        setPriceDropdownOpen(prev => !prev);
                                        setAreaDropdownOpen(false);
                                    }}
                                    className="w-full bg-red-800 text-white text-left rounded-lg px-4 py-2 select-none flex justify-between items-center"
                                >
                                    <span>Mức giá</span>
                                    {priceDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                <DropdownFilter
                                    isOpen={priceDropdownOpen}
                                    onClose={() => setPriceDropdownOpen(false)}
                                    title="Mức giá"
                                >
                                    {/* Nội dung cho dropdown Mức giá */}
                                    <RangeInput
                                        fromValue={minPrice}
                                        toValue={maxPrice}
                                        onChangeFrom={(val) => setMinPrice(val)}
                                        onChangeTo={(val) => setMaxPrice(val)}
                                        unit="triệu"
                                        minAllowed={0}
                                        maxAllowed={100}
                                    />
                                    <div className="my-5">
                                        <RangeSlider
                                            min={0}
                                            max={100}
                                            minValue={minPrice}
                                            maxValue={maxPrice}
                                            onChange={(minVal, maxVal) => {
                                                setMinPrice(minVal);
                                                setMaxPrice(maxVal);
                                            }}
                                        />
                                    </div>
                                    <div className="mb-4 h-40 overflow-y-scroll">
                                        {priceOptions.map((item) => (
                                            <label
                                                key={item.value}
                                                className="flex items-center mb-2 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedPrice(item.value);
                                                    if (item.value === "over70") {
                                                        setMinPrice(item.min);
                                                        setMaxPrice("");
                                                    } else {
                                                        setMinPrice(item.min);
                                                        setMaxPrice(item.max);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="price"
                                                    className="form-radio text-red-500"
                                                    checked={selectedPrice === item.value}
                                                    onChange={() => { }}
                                                />
                                                <span className="ml-2 text-gray-700">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
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
                                            onClick={handleApplyPrice}
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </DropdownFilter>
                            </div>

                            <div className="w-1/3 relative">
                                <button
                                    onClick={() => {
                                        setAreaDropdownOpen(prev => !prev);
                                        setPriceDropdownOpen(false);
                                    }}
                                    className="w-full bg-red-800 text-white text-left rounded-lg px-4 py-2 select-none flex justify-between items-center"
                                >
                                    <span>Diện tích</span>
                                    {areaDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                <DropdownFilter
                                    isOpen={areaDropdownOpen}
                                    onClose={() => setAreaDropdownOpen(false)}
                                    title="Diện tích"
                                >
                                    {/* Nội dung cho dropdown Diện tích – tương tự như Mức giá */}
                                    <RangeInput
                                        fromValue={minArea}
                                        toValue={maxArea}
                                        onChangeFrom={(val) => setMinArea(val)}
                                        onChangeTo={(val) => setMaxArea(val)}
                                        unit="m²"
                                        minAllowed={0}
                                        maxAllowed={1000}
                                    />
                                    <div className="my-5">
                                        <RangeSlider
                                            min={0}
                                            max={1000}
                                            minValue={minArea}
                                            maxValue={maxArea}
                                            onChange={(minVal, maxVal) => {
                                                setMinArea(minVal);
                                                setMaxArea(maxVal);
                                            }}
                                        />
                                    </div>
                                    <div className="mb-4 h-40 overflow-y-scroll">
                                        {areaOptions.map((item) => (
                                            <label
                                                key={item.value}
                                                className="flex items-center mb-2 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedArea(item.value);
                                                    if (item.value === "over500") {
                                                        setMinArea(item.min);
                                                        setMaxArea("");
                                                    } else {
                                                        setMinArea(item.min);
                                                        setMaxArea(item.max);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="price"
                                                    className="form-radio text-red-500"
                                                    checked={selectedArea === item.value}
                                                    onChange={() => { }}
                                                />
                                                <span className="ml-2 text-gray-700">{item.label}</span>
                                            </label>
                                        ))}

                                    </div>
                                    <div className="flex justify-between">
                                        <button
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                                            onClick={() => {
                                                setMinArea(0);
                                                setMaxArea(1000);
                                                setSelectedArea("all");
                                            }}
                                        >
                                            Đặt lại
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded"
                                            onClick={handleApplyArea}
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </DropdownFilter>
                            </div>

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
