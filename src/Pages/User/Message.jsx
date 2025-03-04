import { FaCamera, FaRegHeart, FaMapMarkerAlt, FaSearch, FaTimes, FaUpload, FaPaperPlane } from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { FaGlobe, FaBook, FaUserTie, FaLock } from 'react-icons/fa';
import { FaSignOutAlt, FaHandHoldingDollar } from 'react-icons/fa6';
import { height } from "@fortawesome/free-solid-svg-icons/fa0";

const Message = () => {
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
        <div className="flex h-screen bg-white text-black">
          {/* Left Sidebar */}
          <div className="w-1/4 h-full bg-white border-r p-4 flex flex-col">
            <div className="text-xl font-bold mb-4">
              Đoạn chat
            </div>
            <div className="relative mb-4">
                <input
                    className="w-full p-2 bg-gray-200 rounded-full pl-10 pr-10 text-black"
                    placeholder="Tìm kiếm trên Messenger"
                    type="text"
                />
                {/* Icon tìm kiếm bên trái */}
                <i className="absolute left-3 top-3 text-gray-500 fas fa-search"></i>
                {/* Icon tìm kiếm bên phải */}
                <i className="absolute right-3 top-3 text-gray-500 fas fa-search"></i>
            </div>
            <div className="flex flex-col space-y-4 overflow-y-auto">
              <div className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded cursor-pointer">
                <img
                  alt="Profile picture of Tú"
                  className="rounded-full"
                  height="40"
                  src="https://storage.googleapis.com/a1aa/image/EYeLHPJkioGNEhV04ofmiKzhGOLI0_2vqrvkSIch5Ro.jpg"
                  width="40"
                />
                <div>
                  <div className="font-bold">Tú</div>
                  <div className="text-sm text-gray-500">
                    Đang ở chế độ tệp · 3 ngày
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded cursor-pointer">
                <img
                  alt="Profile picture of Anh Long"
                  className="rounded-full"
                  height="40"
                  src="https://storage.googleapis.com/a1aa/image/TFqrYQKkAqfQ9Nr9YLN9fENOOSSUyuf9lTbKbL-x1IE.jpg"
                  width="40"
                />
                <div>
                  <div className="font-bold">Anh Long</div>
                  <div className="text-sm text-gray-500">Có 3 ngày</div>
                </div>
              </div>
              {/* Các phần tử khác tương tự... */}
            </div>
          </div>
          {/* Main Chat Area */}
          <div className="flex-1 h-full flex flex-col relative">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <div className="flex items-center space-x-3">
                <img
                  alt="Profile picture of Tú"
                  className="rounded-full"
                  height="40"
                  src="https://storage.googleapis.com/a1aa/image/EYeLHPJkioGNEhV04ofmiKzhGOLI0_2vqrvkSIch5Ro.jpg"
                  width="40"
                />
                <div>
                  <div className="font-bold">Tú</div>
                  <div className="text-sm text-gray-500">
                    Hoạt động 6 phút trước
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
                  <i className="fas fa-phone"></i>
                </button>
                <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
                  <i className="fas fa-video"></i>
                </button>
                <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
                  E thử r
                </button>
              </div>
            </div>
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto pb-24">
              <div className="flex flex-col space-y-4">
                {/* Tin nhắn nhận (incoming) với timestamp */}
                <div className="flex items-start space-x-3">
                  <img
                    alt="Profile picture of Tú"
                    className="rounded-full"
                    height="40"
                    src="https://storage.googleapis.com/a1aa/image/EYeLHPJkioGNEhV04ofmiKzhGOLI0_2vqrvkSIch5Ro.jpg"
                    width="40"
                  />
                  <div className="flex flex-col max-w-[60%]">
                    <div className="text-xs text-gray-400 mb-1">12:30 PM - Jan 1, 2022</div>
                    <div className="bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition-colors">
                      <img
                        alt="Code snippet showing an async method for uploading an image to Cloudinary with error handling."
                        height="200"
                        src="https://storage.googleapis.com/a1aa/image/zYwefsTOi9LAYxBULyr54uKSl4gF1DA-p7TEd3ValwM.jpg"
                        width="300"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <img
                    alt="Profile picture of Tú"
                    className="rounded-full"
                    height="40"
                    src="https://storage.googleapis.com/a1aa/image/EYeLHPJkioGNEhV04ofmiKzhGOLI0_2vqrvkSIch5Ro.jpg"
                    width="40"
                  />
                  <div className="flex flex-col max-w-[60%]">
                    <div className="text-xs text-gray-400 mb-1">12:35 PM - Jan 1, 2022</div>
                    <div className="bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition-colors">
                      aaa aaa aaaaa aaaa aaaa aaa aaaaa aaaaa aaaaa aaaaaa aaaaa aaaaa aaaaa aaaa aaaaaa aaaaa aaaaaa aaa aaa aaa aaa aa aaa aaa aaa aa
                    </div>
                  </div>
                </div>
                {/* Tin nhắn gửi (outgoing) với timestamp */}
                <div className="flex items-end justify-end space-x-3">
                  <div className="flex flex-col items-end max-w-[60%]">
                    <div className="text-xs text-gray-400 mb-1">12:40 PM - Jan 1, 2022</div>
                    <div className="bg-red-600 p-3 rounded-lg text-sm text-white hover:bg-red-700 transition-colors">
                      asfd dsgag asgha dfhdfh ertyh fdah aha dfhb dfh gdfg aedh dfhb dfh dhdfh adfh df hdfh dfahdfa hadfh dfh dfh acg f
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-end space-x-3">
                  <div className="flex flex-col items-end max-w-[60%]">
                    <div className="text-xs text-gray-400 mb-1">12:42 PM - Jan 1, 2022</div>
                    <div className="bg-red-600 p-3 rounded-lg text-sm text-white hover:bg-red-700 transition-colors">
                      asfd dsgag asgha dfhdfh ertyh fdah aha dfhb dfh gdfg aedh dfhb dfh dhdfh adfh df hdfh dfahdfa hadfh dfh dfh acg f
                    </div>
                  </div>
                </div>
                {/* Các tin nhắn khác tương tự */}
              </div>
            </div>
            {/* Chat Input - Luôn hiển thị */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center space-x-3">
              <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
                <FaUpload />
              </button>
              <input
                className="w-full p-2 bg-gray-200 rounded-full text-black"
                placeholder="Aa"
                type="text"
              />
              <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
                <FaPaperPlane />
              </button>
            </div>
          </div>
          {/* Right Sidebar */}
          <div className="w-1/4 bg-white border-l p-4 flex flex-col" style={{ height: "94%" }}>
          <div className="flex items-center space-x-3 mb-4 hover:bg-gray-100 p-2 rounded cursor-pointer">
              <img
                alt="Profile picture of Tú"
                className="rounded-full"
                height="40"
                src="https://storage.googleapis.com/a1aa/image/EYeLHPJkioGNEhV04ofmiKzhGOLI0_2vqrvkSIch5Ro.jpg"
                width="40"
              />
              <div>
                <div className="font-bold">Tú</div>
                <div className="text-sm text-gray-500">
                  Hoạt động 6 phút trướcss
                </div>
              </div>
            </div>
            <button className="bg-red-600 p-2 rounded-full mb-4 text-white hover:bg-red-700 transition-colors">
              Xem trang cá nhân
            </button>
            <div className="flex flex-col space-y-4">
              <button className="flex items-center justify-between p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <span>Button</span>
                <i className="fas fa-chevron-right text-gray-500"></i>
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    export default Message;