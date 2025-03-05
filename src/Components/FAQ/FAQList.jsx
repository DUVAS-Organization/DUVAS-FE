import React, { useState } from "react";
import FAQItem from "./FAQItem";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQList = () => {
    const faqData = [
        {
            question: "Tìm phòng trọ tại Làng Đại học Đà Nẵng giá rẻ ở đâu?",
            answer: `Bạn có thể tìm phòng trọ giá rẻ trên các nền tảng như DUVAS, 
      sử dụng bộ lọc theo mức giá để tìm phòng phù hợp. Phòng trọ ở ghép 
      cũng là một lựa chọn tiết kiệm cho sinh viên và người lao động.`,
        },
        {
            question: "Các tiêu chí quan trọng khi chọn phòng trọ là gì?",
            answer: `Khi tìm phòng trọ, hãy xem xét các yếu tố như vị trí (gần trường học, nơi làm việc),
       giá cả, tiện ích (nước sạch, điện, internet), 
       an ninh (có bảo vệ, camera giám sát), và chất lượng phòng (khô ráo, thoáng mát, không ẩm mốc).`,
        },
        {
            question: "Cần lưu ý gì khi ký hợp đồng thuê phòng trọ?",
            answer: `Bạn cần đọc kỹ các điều khoản trong hợp đồng, bao gồm thời hạn thuê, 
      số tiền đặt cọc, cách thức thanh toán, và trách nhiệm bảo trì. 
      Đảm bảo các quy định về sửa chữa và trả phòng được ghi rõ để tránh tranh chấp sau này.`,
        },
        {
            question: "Tôi có thể thương lượng giá thuê không?",
            answer: `Có, bạn hoàn toàn có thể thương lượng giá thuê với chủ nhà, 
      đặc biệt nếu bạn thuê dài hạn, trả trước nhiều tháng, hoặc có lý do chính đáng như giảm tiện ích.`,
        },
        {
            question: "Có cần đặt cọc khi thuê phòng trọ không?",
            answer: `Thông thường, bạn sẽ cần đặt cọc từ 1-2 tháng tiền thuê nhà để đảm bảo hợp đồng.
       Khoản tiền này sẽ được hoàn trả nếu không có vi phạm hợp đồng.`,
        },
        {
            question: "Tôi nên kiểm tra gì khi thuê phòng trọ?",
            answer: `Hãy kiểm tra kỹ hệ thống điện, nước, nhà vệ sinh, cửa sổ, cửa chính, và mức độ thông thoáng của phòng.
       Đảm bảo các thiết bị như đèn, quạt, bếp hoạt động tốt trước khi ký hợp đồng.`,
        },
        {
            question: "Phòng trọ có thường bị mất điện, nước không?",
            answer: `Điều này phụ thuộc vào khu vực và chất lượng cơ sở hạ tầng. 
      Hãy hỏi rõ chủ nhà hoặc người thuê trước để biết thêm thông tin.`,
        },
        {
            question: "Phòng trọ có cho nuôi thú cưng không?",
            answer: `Điều này phụ thuộc vào quy định của từng chủ nhà hoặc khu trọ.
       Nhiều nơi không cho phép nuôi thú cưng, nhưng bạn có thể tìm hiểu và thỏa thuận trước khi thuê`,
        },
    ];

    // Khi chưa mở rộng hiển thị 3 câu, khi mở rộng hiển thị toàn bộ
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="max-w-6xl mx-auto my-6">
            <h2 className="text-xl font-bold mb-4">Các câu hỏi thường gặp ?</h2>

            <div className="border border-gray-300 rounded-md overflow-hidden relative">
                {isExpanded ? (
                    // Khi mở rộng, sử dụng AnimatePresence để hiệu ứng entry cho toàn bộ FAQ
                    <AnimatePresence>
                        {faqData.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                            >
                                <FAQItem question={item.question} answer={item.answer} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    // Khi chưa mở rộng, chỉ render 3 FAQItem mà không có exit animation
                    faqData.slice(0, 3).map((item, idx) => (
                        <FAQItem key={idx} question={item.question} answer={item.answer} />
                    ))
                )}

                {/* Nút Xem thêm / Ẩn bớt */}
                <div className="text-center mt-1">
                    {isExpanded ? (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="top-0 mb-2 px-3 py-1 text-red-600 font-semibold hover:bg-red-100 rounded-lg"

                        >
                            <div className="flex items-center justify-center gap-1">
                                <p>Thu gọn</p>
                                <FaChevronUp className="mt-1 text-red-600 font-semibold" />
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="top-0 mb-2 text-red-600 font-semibold px-3 py-1 hover:bg-red-100 rounded-lg"

                        >
                            <div className="flex items-center justify-center gap-1">
                                <p>Xem thêm</p>
                                <FaChevronDown className="mt-1 text-red-600 font-semibold " />
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FAQList;
