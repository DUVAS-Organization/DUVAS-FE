import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Footer from "../Components/Layout/Footer";
import RoomsHome from "../Components/ComponentPage/RoomsHome";
import ServicePostsHome from "../Components/ComponentPage/ServicePostsHome";
import Searchbar from "../Components/Searchbar";
import carousel1 from '../Assets/Images/carousel5.webp';
import carousel2 from '../Assets/Images/carousel4.webp';
import carousel3 from '../Assets/Images/carousel6.webp';

const images = [
    { src: carousel1, title: "Phòng trọ sạch đẹp tại Đà Nẵng", btnText: "Xem phòng trọ", link: "/Rooms?tab=Phòng%20trọ" },
    { src: carousel2, title: "Căn hộ tiện nghi đầy đủ dịch vụ", btnText: "Xem căn hộ", link: "/Rooms?tab=Căn%20hộ" },
    { src: carousel3, title: "Dịch vụ sinh viên giá rẻ", btnText: "Khám phá ngay", link: "/ServicePosts?tab=Dịch%20vụ%20vệ%20sinh" },
];

const Home = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const prevSlide = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

    return (
        <div>
            {/* Carousel */}
            <div className="relative w-full">
                <img className="w-full max-h-[380px] object-cover brightness-90 transition-all duration-700" src={images[currentIndex].src} alt="carousel" />

                {/* Overlay text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                    <h2 className="text-3xl font-bold drop-shadow-lg animate-fade-in">{images[currentIndex].title}</h2>
                    <Link to={images[currentIndex].link} className="mt-4 inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-red-700 transition duration-200">
                        {images[currentIndex].btnText}
                    </Link>
                </div>

                {/* Nút chuyển ảnh */}
                <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:scale-110 transition">
                    <FaChevronLeft />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:scale-110 transition">
                    <FaChevronRight />
                </button>
            </div>
            {/* Searchbar */}
            <div className="bg-white w-full mx-auto py-2">
                <Searchbar />
            </div>
            {/* Nội dung chính */}
            <div className="max-w-6xl mx-auto mt-8">
                {/* Tin dịch vụ */}
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl text-gray-800 font-bold">Tin dịch vụ</h2>
                    <Link to="/ServicePosts" className="text-red-600 font-semibold flex items-center hover:scale-105 transition duration-100">
                        Xem thêm <FaArrowRight className="ml-1 text-sm mt-1" />
                    </Link>
                </div>
                <ServicePostsHome />
            </div>

            {/* Danh sách phòng trọ */}
            <div className="container mx-auto max-w-6xl py-8 mt-8">
                <RoomsHome />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;