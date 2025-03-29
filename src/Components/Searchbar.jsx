import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSearch, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import RangeSlider from "../Components/Layout/Range/RangeSlider";
import DropdownFilter from "../Components/Layout/DropdownFilter";
import RangeInput from '../Components/Layout/Range/RangeInput';
import CategoryRoomService from '../Services/User/CategoryRoomService';
import CategoryServiceService from '../Services/User/CategoryServices';

const Searchbar = () => {
    const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100);
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [priceLabel, setPriceLabel] = useState("Mức giá");

    const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
    const [minArea, setMinArea] = useState(0);
    const [maxArea, setMaxArea] = useState(1000);
    const [selectedArea, setSelectedArea] = useState("all");
    const [areaLabel, setAreaLabel] = useState("Diện tích");

    const [categoriesRoom, setCategoriesRoom] = useState([]);
    const [categoriesService, setCategoriesService] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [categoryLabel, setCategoryLabel] = useState("-- Chọn loại --");

    const [activeTab, setActiveTab] = useState("rooms");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (activeTab === "rooms") {
                    const roomData = await CategoryRoomService.getCategoryRooms();
                    setCategoriesRoom(roomData);
                    setCategoriesService([]);
                } else if (activeTab === "services") {
                    const serviceData = await CategoryServiceService.getCategoryServices();
                    setCategoriesService(serviceData);
                    setCategoriesRoom([]);
                }
                setSelectedCategoryId("");
                setCategoryLabel("-- Chọn loại --");
            } catch (error) {
                console.error(`Error fetching categories for ${activeTab}:`, error);
            }
        };
        fetchCategories();
    }, [activeTab]);

    const priceOptions = [
        { value: "all", label: "Tất cả mức giá", min: 0, max: 100 },
        { value: "under5", label: "Dưới 1 triệu", min: 0, max: 1 },
        { value: "1-3", label: "1 - 3 triệu", min: 1, max: 3 },
        { value: "3-5", label: "3 - 5 triệu", min: 3, max: 5 },
        { value: "5-10", label: "5 - 10 triệu", min: 5, max: 10 },
        { value: "10-20", label: "10 - 20 triệu", min: 10, max: 20 },
        { value: "20-40", label: "20 - 40 triệu", min: 20, max: 40 },
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
        setPriceDropdownOpen(false);
        setPriceLabel(selectedPrice === "all" ? "Mức giá" : `${minPrice} - ${maxPrice} triệu`);
    };

    const handleApplyArea = () => {
        setAreaDropdownOpen(false);
        setAreaLabel(selectedArea === "all" ? "Diện tích" : `${minArea} - ${maxArea} m²`);
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        const selectedCategory = (activeTab === "rooms" ? categoriesRoom : categoriesService)
            .find(cat => (cat.categoryRoomId || cat.categoryServiceId).toString() === categoryId);
        setSelectedCategoryId(categoryId);
        setCategoryLabel(
            selectedCategory
                ? (activeTab === "rooms" ? selectedCategory.categoryName : selectedCategory.categoryServiceName)
                : "-- Chọn loại --"
        );
    };

    const handleSearch = () => {
        // Tạo queryParams cho URL điều hướng
        const queryParams = {};

        if (activeTab === "rooms") {
            const selectedCategory = categoriesRoom.find(c => c.categoryRoomId.toString() === selectedCategoryId);
            queryParams.tab = selectedCategory ? selectedCategory.categoryName : "Phòng trọ";
            if (selectedCategoryId) queryParams.categoryRoomId = selectedCategoryId;
            if (minPrice !== 0) queryParams.minPrice = minPrice;
            if (maxPrice !== 100) queryParams.maxPrice = maxPrice;
            if (minArea !== 0) queryParams.minArea = minArea;
            if (maxArea !== 1000) queryParams.maxArea = maxArea;
            const queryString = new URLSearchParams(queryParams).toString();
            // console.log("Navigating to Rooms:", `/Rooms?${queryString}`);
            navigate(`/Rooms?${queryString}`);
        } else if (activeTab === "services") {
            const selectedCategory = categoriesService.find(c => c.categoryServiceId.toString() === selectedCategoryId);
            queryParams.tab = selectedCategory ? selectedCategory.categoryServiceName : "Vệ sinh";
            if (selectedCategoryId) queryParams.categoryServiceId = selectedCategoryId;
            if (minPrice !== 0) queryParams.minPrice = minPrice;
            if (maxPrice !== 100) queryParams.maxPrice = maxPrice;
            const queryString = new URLSearchParams(queryParams).toString();
            // console.log("Navigating to ServicePosts:", `/ServicePosts?${queryString}`);
            navigate(`/ServicePosts?${queryString}`);
        }
    };

    return (
        <div className="bg-red-500 p-4">
            <div className="mx-auto max-w-6xl">
                <div className="flex gap-0.5">
                    <div
                        className={`rounded-t-lg px-4 py-2 cursor-pointer ${activeTab === "rooms" ? "bg-red-800 text-white" : "bg-gray-100 text-black"}`}
                        onClick={() => setActiveTab("rooms")}
                    >
                        Phòng trọ - Căn hộ
                    </div>
                    <div
                        className={`rounded-t-lg px-4 py-2 cursor-pointer ${activeTab === "services" ? "bg-red-800 text-white" : "bg-gray-100 text-black"}`}
                        onClick={() => setActiveTab("services")}
                    >
                        Dịch vụ
                    </div>
                </div>

                <div className="shadow-lg rounded-b-lg p-4">
                    <div className="bg-white flex items-center space-x-2 rounded-lg">
                        <div className="flex items-center bg-gray-100 px-4 py-2 flex-shrink-0">
                            <FaMapMarkerAlt className="text-gray-500" />
                            <span className="mx-2">Đà Nẵng</span>
                        </div>
                        <h1 className="font-medium text-gray-500 flex-shrink-0">|</h1>
                        <div className="relative flex-1">
                            <input
                                className="w-full bg-gray-100 rounded-lg pl-10 pr-28 py-2"
                                placeholder="Nhập tối đa 3 địa điểm."
                                type="text"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 bg-red-600 text-white rounded-lg px-4 mx-2"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-2 mt-2">
                        <div className="w-1/3 relative">
                            <select
                                className="w-full bg-red-800 text-white text-left rounded-lg px-4 py-2 appearance-none cursor-pointer focus:outline-none"
                                value={selectedCategoryId}
                                onChange={handleCategoryChange}
                            >
                                <option value="">-- Chọn loại --</option>
                                {(activeTab === "rooms" ? categoriesRoom : categoriesService).map((cat) => (
                                    <option
                                        key={cat.categoryRoomId || cat.categoryServiceId}
                                        value={cat.categoryRoomId || cat.categoryServiceId}
                                        className="bg-white text-black"
                                    >
                                        {cat.categoryName || cat.categoryServiceName}
                                    </option>
                                ))}
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" />
                        </div>

                        <div className="w-1/3 relative">
                            <button
                                onClick={() => { setPriceDropdownOpen(prev => !prev); setAreaDropdownOpen(false); }}
                                className="w-full bg-red-800 text-white text-left rounded-lg px-4 py-2 select-none flex justify-between items-center"
                            >
                                <span>{priceLabel}</span>
                                {priceDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <DropdownFilter isOpen={priceDropdownOpen} onClose={() => setPriceDropdownOpen(false)} title="Mức giá">
                                <RangeInput
                                    fromValue={minPrice}
                                    toValue={maxPrice}
                                    onChangeFrom={setMinPrice}
                                    onChangeTo={setMaxPrice}
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
                                        onChange={(minVal, maxVal) => { setMinPrice(minVal); setMaxPrice(maxVal); }}
                                    />
                                </div>
                                <div className="mb-4 h-40 overflow-y-scroll">
                                    {priceOptions.map((item) => (
                                        <label
                                            key={item.value}
                                            className="flex items-center mb-2 cursor-pointer"
                                            onClick={() => { setSelectedPrice(item.value); setMinPrice(item.min); setMaxPrice(item.max); }}
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
                                        onClick={() => { setMinPrice(0); setMaxPrice(100); setSelectedPrice("all"); setPriceLabel("Mức giá"); }}
                                    >
                                        Đặt lại
                                    </button>
                                    <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleApplyPrice}>
                                        Áp dụng
                                    </button>
                                </div>
                            </DropdownFilter>
                        </div>

                        {activeTab === "rooms" && (
                            <div className="w-1/3 relative">
                                <button
                                    onClick={() => { setAreaDropdownOpen(prev => !prev); setPriceDropdownOpen(false); }}
                                    className="w-full bg-red-800 text-white text-left rounded-lg px-4 py-2 select-none flex justify-between items-center"
                                >
                                    <span>{areaLabel}</span>
                                    {areaDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                <DropdownFilter isOpen={areaDropdownOpen} onClose={() => setAreaDropdownOpen(false)} title="Diện tích">
                                    <RangeInput
                                        fromValue={minArea}
                                        toValue={maxArea}
                                        onChangeFrom={setMinArea}
                                        onChangeTo={setMaxArea}
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
                                            onChange={(minVal, maxVal) => { setMinArea(minVal); setMaxArea(maxVal); }}
                                        />
                                    </div>
                                    <div className="mb-4 h-40 overflow-y-scroll">
                                        {areaOptions.map((item) => (
                                            <label
                                                key={item.value}
                                                className="flex items-center mb-2 cursor-pointer"
                                                onClick={() => { setSelectedArea(item.value); setMinArea(item.min); setMaxArea(item.max); }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="area"
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
                                            onClick={() => { setMinArea(0); setMaxArea(1000); setSelectedArea("all"); setAreaLabel("Diện tích"); }}
                                        >
                                            Đặt lại
                                        </button>
                                        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleApplyArea}>
                                            Áp dụng
                                        </button>
                                    </div>
                                </DropdownFilter>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Searchbar;
