import { FaMapMarkerAlt, FaSearch, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useState } from 'react'
import RangeSlider from "../Components/Layout/Range/RangeSlider";
import DropdownFilter from "../Components/DropdownFilter";
import RangeInput from '../Components/Layout/Range/RangeInput'

const Searchbar = () => {
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
        { value: "over70", label: "Trên 70 triệu", min: 70, max: 100 }
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
        { value: "over500", label: "Trên 500 m²", min: 500, max: 1000 }
    ];

    const handleApplyPrice = () => {
        console.log("Giá:", minPrice, maxPrice, selectedPrice);
    };

    const handleApplyArea = () => {
        console.log("Diện tích:", minArea, maxArea, selectedArea);
    };
    return (
        <div className="bg-red-500 p-4">
            <div className="mx-auto max-w-6xl">
                {/* Tab chọn */}
                <div className="flex gap-1">
                    {/* <div className="bg-red-800 text-white rounded-t-lg px-4 py-2">
                        Nhà đất bán
                    </div> */}
                    <div className="bg-red-800 text-white rounded-t-lg px-4 py-2">
                        Nhà trọ cho thuê
                    </div>
                    {/* <div className="bg-gray-200 text-gray-800 rounded-t-lg px-4 py-2">
                        Dự án
                    </div> */}
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
                            <option>Loại Nhà trọ cho thuê</option>
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
                                                setMinPrice(item.min);
                                                setMaxPrice(item.max);
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
                                                setMinArea(item.min);
                                                setMaxArea(item.max);
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
    );
}

export default Searchbar;