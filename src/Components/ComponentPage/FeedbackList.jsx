import { useEffect, useState } from "react";
import UserRentRoomService from "../../Services/User/UserRentRoomService";
import { FaStar } from "react-icons/fa";

const FeedbackList = ({ roomId }) => {
    const [feedbacks, setFeedbacks] = useState([]);  // Always an array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalImage, setModalImage] = useState(null); // State to hold the image URL for the modal

    const handleImageClick = (image) => {
        setModalImage(image); // Set the image to show in the modal
    };

    const closeModal = () => {
        setModalImage(null); // Close the modal
    };

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const feedbackData = await UserRentRoomService.getUserFeedbackByRoomId(roomId);

                console.log("Received feedbackData:", feedbackData);  // Log the data to check

                if (Array.isArray(feedbackData)) {
                    setFeedbacks(feedbackData);  // Update state with the feedback data
                } else {
                    setFeedbacks([]);  // Fallback to empty array if the data is not an array
                    console.error("Received data is not an array:", feedbackData);
                }
            } catch (err) {
                setFeedbacks([]);  // On error, reset to empty array
                setError("Không thể tải đánh giá.");
                console.error("❌ Error fetching feedbacks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
        console.log(feedbacks);
    }, [roomId]);

    useEffect(() => {
        console.log("Current feedbacks state:", feedbacks);
    }, [feedbacks]);

    if (loading) return <p>Đang tải đánh giá...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl w-full dark:bg-gray-800 dark:text-white">
            <h3 className="text-xl font-bold mb-4">Đánh Giá Phòng</h3>
            {loading ? (
                <p>Đang tải đánh giá...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : Array.isArray(feedbacks) && feedbacks.length === 0 ? (
                <p>Chưa có đánh giá nào.</p>
            ) : (
                <div className="space-y-4">
                    {Array.isArray(feedbacks) &&
                        feedbacks.map((feedback) => {
                            let images = [];

                            // Parse image if it's a string (stringified JSON array)
                            try {
                                if (typeof feedback.image === "string") {
                                    // Check if the string is actually a JSON string
                                    images = JSON.parse(feedback.image);
                                } else if (Array.isArray(feedback.image)) {
                                    // If already an array, use it directly
                                    images = feedback.image;
                                }
                            } catch (error) {
                                console.error("Error parsing image field:", error);
                                // If parsing fails, treat it as a single URL
                                images = [feedback.image];
                            }

                            return (
                                <div key={feedback.id} className="border-b pb-4 last:border-none">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={feedback.userAvatar}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-semibold">{feedback.userName}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(feedback.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={i < feedback.rating ? "text-yellow-500" : "text-gray-300"}
                                            />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-gray-700 dark:text-white">{feedback.comment}</p>

                                    {/* Image(s) */}
                                    {images.length > 0 && (
                                        <div className="flex space-x-2 mt-2">
                                            {images.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`Feedback Image ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                                                    onClick={() => handleImageClick(img)} // Set the image for the modal
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
            {/* Modal for viewing image */}
            {modalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 dark:bg-gray-800 dark:text-white"
                    onClick={closeModal}
                >
                    <img
                        src={modalImage}
                        alt="Enlarged Preview"
                        className="max-w-[75%] max-h-[85%] object-cover rounded-lg"
                    />
                </div>
            )}
        </div>
    );


};

export default FeedbackList;