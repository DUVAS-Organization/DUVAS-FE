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
    {
        src: carousel1,
        title: "Phòng trọ sạch đẹp tại Đà Nẵng",
        btnText: "Xem phòng trọ",
        link: "/Rooms?tab=Phòng%20trọ"
    },
    {
        src: carousel2,
        title: "Căn hộ tiện nghi đầy đủ dịch vụ",
        btnText: "Xem căn hộ",
        link: "/Rooms?tab=Căn%20hộ"
    },
    {
        src: carousel3,
        title: "Dịch vụ sinh viên giá rẻ",
        btnText: "Khám phá ngay",
        link: "/ServicePosts?tab=Vệ%20sinh"
    },
];

const Home = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => setOffsetY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const prevSlide = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

    return (
        <div className="bg-white dark:bg-gray-800 dark:text-white">
            {/* Carousel */}
            <div className="relative w-full overflow-hidden">
                <img
                    className="w-full max-h-[200px] md:max-h-[380px] object-cover brightness-90 transition-all duration-700"
                    src={images[currentIndex].src}
                    alt="carousel"
                    style={{
                        transform: `translateY(${offsetY * 0.3}px) scale(1.05)`,
                        transition: "transform 0.2s ease-out",
                    }}
                />

                {/* Overlay text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white px-2 md:px-4">
                    <h2 className="text-xl md:text-3xl font-bold drop-shadow-lg animate-fade-in">
                        {images[currentIndex].title}
                    </h2>
                    <Link
                        to={images[currentIndex].link}
                        className="mt-2 md:mt-4 inline-block bg-red-600 text-white px-3 py-1 md:px-6 md:py-2 rounded-lg font-semibold shadow-md hover:bg-red-700 transition duration-200 text-sm md:text-base"
                    >
                        {images[currentIndex].btnText}
                    </Link>
                </div>

                {/* Navigation buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-1 md:left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 md:p-2 rounded-full hover:scale-110 transition"
                >
                    <FaChevronLeft />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-1 md:right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 md:p-2 rounded-full hover:scale-110 transition"
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* Searchbar */}
            <div className="bg-white w-full mx-auto py-2 px-4 dark:bg-gray-800">
                <Searchbar />
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto mt-4 md:mt-8 px-4">
                {/* Service posts */}
                <div className="flex flex-col md:flex-row justify-between p-4">
                    <h2 className="text-lg md:text-xl text-gray-800 font-bold dark:text-white">Tin dịch vụ</h2>
                    <Link
                        to="/ServicePosts?tab=Dịch%20vụ%20sửa%20chữa"
                        className="text-red-600 font-semibold flex items-center hover:scale-105 transition duration-100 mt-2 md:mt-0"
                    >
                        Xem thêm <FaArrowRight className="ml-1 text-sm mt-1" />
                    </Link>
                </div>
                <ServicePostsHome />
            </div>

            {/* Room listings */}
            <div className="container mx-auto max-w-6xl py-4 md:py-8 mt-4 md:mt-8 px-4">
                <RoomsHome />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;
