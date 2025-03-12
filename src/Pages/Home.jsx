import Footer from "../Components/Layout/Footer";
import RoomsHome from "../Components/ComponentPage/RoomsHome";
import Searchbar from "../Components/Searchbar";

const Home = () => {


    return (
        <div className="bg-white">
            <Searchbar />
            <div className="max-w-6xl mx-auto mt-8">
                <div className="flex justify-between items-center pb-2">
                    <div className="flex space-x-4 text-xl">
                        <div className="text-gray-800 font-bold">Tin dịch vụ</div>
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
                                Công nghệ xanh và bền vững: Tương lai của xây dựng thông minh
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
                                Khám phá xu hướng kiến trúc hiện đại tại các đô thị lớn
                            </div>
                        </div>
                    </div>
                </div>
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
