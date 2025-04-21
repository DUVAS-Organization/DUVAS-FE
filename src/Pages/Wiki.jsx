import Footer from "../Components/Layout/Footer";

const Wiki = () => {
    return (
        <div className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white">
            <div className=" max-w-6xl mx-auto px-4 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">
                            Hướng Dẫn Thuê Phòng Ở Trang Web Duvas.com.vn
                        </h1>
                        {/* <ul className="list-disc list-inside text-red-600 mb-8">
                            <li>Giới thiệu giao diện và cấu trúc trang web</li>
                            <li>Cách tìm kiếm thông tin và sản phẩm</li>
                            <li>Đăng ký, đăng nhập và quản lý tài khoản</li>
                            <li>Liên hệ và hỗ trợ khách hàng</li>
                            <li>Đánh giá và phản hồi trải nghiệm</li>
                        </ul> */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
                            Bước 1: Xác định ngân sách, địa điểm, nhu cầu
                        </h2>
                        <p className="mb-4">
                            Trước khi bắt đầu tìm kiếm, bạn cần xác định rõ các yếu tố quan trọng sau:</p>
                        <li>Ngân sách: Xác định mức chi tiêu hàng tháng cho tiền thuê nhà, điện nước và các chi phí khác.</li>
                        <li>Địa điểm: Lựa chọn khu vực phù hợp với công việc, học tập hoặc sinh hoạt của bạn.</li>
                        <li>Nhu cầu cụ thể: Xác định loại phòng (phòng riêng, ở ghép), diện tích mong muốn, nội thất, chỗ để xe, an ninh khu vực, giờ giấc tự do…</li>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Việc xác định rõ các tiêu chí này sẽ giúp bạn lọc được danh sách phòng trọ phù hợp và tiết kiệm thời gian tìm kiếm.</p>
                        {/* <div className="bg-gray-200 p-4 rounded-lg mb-8">
                            <a className="text-red-600 font-bold" href="#">
                                Xem Video Hướng Dẫn
                            </a>
                        </div> */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
                            Bước 2: Tìm kiếm phòng phù hợp với yêu cầu
                        </h2>
                        <p className="mb-4">
                            Sử dụng công cụ tìm kiếm trên trang web Duvas.com.vn để nhập các tiêu chí như:</p>
                        <li>Khu vực cần tìm phòng</li>
                        <li>Khoảng giá thuê mong muốn</li>
                        <li>Loại phòng (phòng riêng, phòng ghép, căn hộ mini…)</li>
                        <li>Các tiện ích đi kèm (wifi, nội thất đầy đủ, có chỗ để xe…)</li>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Ngoài ra, bạn có thể sử dụng các bộ lọc nâng cao để chọn phòng phù hợp với nhu cầu một cách nhanh chóng. Hệ thống sẽ hiển thị danh sách các phòng trọ đáp ứng tiêu chí tìm kiếm của bạn.</p>
                        {/* <div className="bg-gray-200 p-4 rounded-lg mb-8">
                            <a className="text-red-600 font-bold" href="#">
                                Xem Hướng Dẫn Tìm Kiếm
                            </a>
                        </div> */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
                            Bước 3: Gửi yêu cầu thuê và chờ chủ nhà chấp nhận
                        </h2>
                        <p className="mb-4">
                            Khi đã tìm được phòng phù hợp, bạn nhấn vào “Gửi yêu cầu thuê” trên trang thông tin phòng. Thông tin của bạn sẽ được gửi đến chủ nhà để xem xét. Chủ nhà có thể chấp nhận hoặc từ chối yêu cầu của bạn.</p>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Hãy đảm bảo điền đầy đủ thông tin cá nhân và lý do thuê để tăng khả năng được chủ nhà chấp thuận nhanh hơn.</p>
                        {/* <div className="bg-gray-200 p-4 rounded-lg mb-8">
                            <a className="text-red-600 font-bold" href="#">
                                Xem Hướng Dẫn Đăng Ký &amp; Đăng Nhập
                            </a>
                        </div> */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
                            Bước 4: Liên hệ với chủ nhà để ký hợp đồng thông qua tính năng nhắn tin
                        </h2>
                        <p className="mb-4">
                            Sau khi yêu cầu thuê được chấp nhận, bạn có thể trao đổi chi tiết hơn với chủ nhà thông qua hệ thống nhắn tin của Duvas.com.vn.</p>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Hãy hỏi kỹ về:</p>
                        <li>Điều kiện thuê (tiền cọc, chi phí phát sinh, thời gian thuê tối thiểu…)</li>
                        <li>Nội dung hợp đồng thuê phòng</li>
                        <li>Thống nhất thời gian ký hợp đồng khi đã thống nhất các điều khoản</li>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Bạn nên yêu cầu gặp trực tiếp chủ nhà để xem phòng trước khi ký hợp đồng.</p>
                        {/* <div className="bg-gray-200 p-4 rounded-lg mb-8">
                            <a className="text-red-600 font-bold" href="#">
                                Xem Hướng Dẫn Liên Hệ
                            </a>
                        </div> */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
                            Bước 5: Đọc kỹ hợp đồng và các điều khoản
                        </h2>
                        <p className="mb-4">
                            Trước khi ký hợp đồng, hãy đảm bảo bạn hiểu rõ tất cả các điều khoản trong hợp đồng, bao gồm:</p>
                        <li>Số tiền đặt cọc và điều kiện hoàn trả</li>
                        <li>Thời gian thuê tối thiểu và điều kiện chấm dứt hợp đồng</li>
                        <li>Các khoản phí phát sinh như điện, nước, internet</li>
                        <li>Trách nhiệm của chủ nhà và người thuê</li>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Nếu có bất kỳ điều khoản nào chưa rõ ràng, hãy trao đổi trực tiếp với chủ nhà để làm rõ trước khi ký kết.</p>
                        {/* <div className="bg-gray-200 p-4 rounded-lg mb-8">
                            <a className="text-red-600 font-bold" href="#">
                                Gửi Phản Hồi
                            </a>
                        </div> */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
                            Bước 6: Nạp tiền và nhấn xác nhận thuê phòng để hoàn tất mọi thủ tục
                        </h2>
                        <p className="mb-4">
                            Sau khi ký hợp đồng, bạn cần thực hiện các bước thanh toán:</p>
                        <li>Nạp tiền đặt cọc hoặc tiền thuê tháng đầu tiên theo hướng dẫn trên hệ thống.</li>
                        <li>Xác nhận thanh toán trên Duvas.com.vn.</li>
                        <li>Nhấn “Xác nhận thuê phòng” để hoàn tất quá trình thuê.</li>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Sau khi hoàn tất, phòng sẽ chính thức được đặt cho bạn, và bạn có thể chuyển vào ở theo thỏa thuận với chủ nhà.</p>
                        {/* <div className="bg-gray-200 p-4 rounded-lg mb-8">
                            <a className="text-red-600 font-bold" href="#">
                                Gửi Phản Hồi
                            </a>
                        </div> */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
                            Bước 7: Báo cáo với chủ nhà hoặc Admin nếu có vấn đề
                        </h2>
                        <p className="mb-4">
                            Trong quá trình thuê phòng, nếu gặp bất kỳ vấn đề gì, bạn có thể báo cáo để được hỗ trợ:</p>
                        <ul className="list-disc list-inside">
                            <li>
                                Liên hệ trực tiếp với chủ nhà nếu gặp sự cố nhỏ liên quan đến phòng ở.
                            </li>
                            <li>
                                Gửi phản hồi đến Admin <strong><span className="font-bold text-red-500">Duvas.com.vn</span></strong> nếu gặp các vấn đề lớn như:
                                <ul className="list-disc list-inside pl-6">
                                    <li>Phòng không đúng như mô tả.</li>
                                    <li>Chủ nhà vi phạm hợp đồng.</li>
                                    <li>Có tranh chấp hoặc vấn đề pháp lý liên quan.</li>
                                </ul>
                            </li>
                        </ul>

                        <li>Duvas.com.vn cam kết hỗ trợ người thuê và đảm bảo môi trường giao dịch an toàn, minh bạch.</li>
                        <p className="mb-4">    </p>
                        <p className="mb-4">
                            Việc xác định rõ các tiêu chí này sẽ giúp bạn lọc được danh sách phòng trọ phù hợp và tiết kiệm thời gian tìm kiếm.</p>
                        {/* <div className="bg-gray-200 p-4 rounded-lg mb-8">
                            <a className="text-red-600 font-bold" href="#">
                                Gửi Phản Hồi
                            </a>
                        </div> */}

                    </div>

                    {/* Sidebar */}
                    <div className="sticky top-0">
                        <div className="mb-8">
                            <div className="flex space-x-2 mb-4">
                                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-800 dark:text-white">
                                    Hướng dẫn sử dụng
                                </button>
                                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-800 dark:text-white">
                                    Tin tức mới
                                </button>
                            </div>
                            <div className="bg-white p-4 shadow rounded-lg dark:bg-gray-800 dark:text-white">
                                <h3 className="font-bold mb-4">Bài viết được xem nhiều nhất</h3>
                                <ul className="list-decimal list-inside">
                                    <li className="mb-2">
                                        Cập nhật giao diện mới của Duvas.com.vn
                                    </li>
                                    <li className="mb-2">
                                        Bí quyết tối ưu hóa trải nghiệm người dùng
                                    </li>
                                    <li className="mb-2">
                                        Các tính năng nổi bật trên Duvas.com.vn
                                    </li>
                                    <li className="mb-2">
                                        Hướng dẫn đăng ký và đăng nhập an toàn
                                    </li>
                                    <li className="mb-2">
                                        Chia sẻ kinh nghiệm sử dụng trang web
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};
export default Wiki;