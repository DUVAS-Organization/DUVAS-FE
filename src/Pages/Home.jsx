import Footer from "../Components/Layout/Footer";
import RoomsHome from "../Components/ComponentPage/RoomsHome";
import ServicePostsHome from "../Components/ComponentPage/ServicePostsHome";
import Searchbar from "../Components/Searchbar";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

const Home = () => {


    return (
        <div className="bg-white">
            <Searchbar />
            <div className="max-w-6xl mx-auto mt-8">
                <div className="flex justify-between items-center  p-4">
                    <div className="flex text-xl">
                        <div className="text-gray-800 font-bold ">Tin dịch vụ</div>
                    </div>
                    <Link
                        to="/ServicePosts?tab=Dịch%20vụ%20giặt%20ủi"
                        className="text-red-600 font-semibold flex items-center hover:scale-105 transition duration-100">
                        Xem thêm <FaArrowRight className="ml-1 text-sm mt-1" />
                    </Link>
                </div>
                <ServicePostsHome />
            </div>
            <div className="container mx-auto max-w-6xl py-8 mt-8">
                {/* <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-4 text-red-700 ">Phòng trọ</h1>
                    </div>
                    <div className="space-x-4">
                        <span>|</span>
                        <a className="text-black hover:text-gray-600" href="#">
                            Tin nhà cho thuê mới nhất
                        </a>
                        <span>|</span>
                    </div>
                </div> */}

                <RoomsHome className="text-red-800" />
            </div>
            <Footer />
        </div>

    );
};

export default Home;
