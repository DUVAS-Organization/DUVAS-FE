import { useState, useEffect } from "react";
import { FaUpload, FaPaperPlane, FaSearch } from "react-icons/fa";
import { useAuth } from "../../../Context/AuthProvider"; // Điều chỉnh đường dẫn nếu cần

const Message = () => {
  // Lấy thông tin user từ AuthProvider
  const { user } = useAuth();
  // Nếu user có giá trị, lấy userId; nếu không, gán là null
  const currentUserId = user ? user.userId : null;
  console.log("currentUserId:", currentUserId); // Debug: kiểm tra currentUserId

  // State cho tin nhắn nhập, danh sách tin nhắn gửi (nếu cần) và các tin nhắn của cuộc trò chuyện
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Dùng nếu cần lưu tin nhắn gửi tạm (không bắt buộc)

  // State cho danh sách cuộc trò chuyện và tin nhắn của cuộc trò chuyện được chọn
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState(""); // Lưu tên đối phương
  const [conversationMessages, setConversationMessages] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Lấy danh sách cuộc trò chuyện cho currentUserId khi component load
  useEffect(() => {
    if (!currentUserId) return;
    fetch(`https://localhost:8000/api/Message/conversations/${currentUserId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Conversations:", data); // Debug: kiểm tra danh sách cuộc trò chuyện
        setConversations(data);
      })
      .catch((error) => console.error("Error fetching conversations:", error));
  }, [currentUserId]);

  // Hàm lấy danh sách tin nhắn của cuộc trò chuyện được chọn
  const fetchConversationMessages = (partnerId) => {
    if (!currentUserId) return;
    fetch(`https://localhost:8000/api/Message/user/${currentUserId}/${partnerId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Conversation messages:", data); // Debug: kiểm tra tin nhắn của cuộc trò chuyện
        setConversationMessages(data);
      })
      .catch((error) =>
        console.error("Error fetching conversation messages:", error)
      );
  };

  // Khi chọn một cuộc trò chuyện, lưu ID và tên đối phương, lấy tin nhắn ngay và bắt đầu polling (mỗi 3 giây)
  const handleSelectConversation = (partnerId, partnerName) => {
    setSelectedConversation(partnerId);
    setSelectedPartnerName(partnerName);
    fetchConversationMessages(partnerId);
    if (pollingInterval) clearInterval(pollingInterval);
    const intervalId = setInterval(() => {
      fetchConversationMessages(partnerId);
    }, 3000);
    setPollingInterval(intervalId);
  };

  // Dọn dẹp polling khi component unmount hoặc khi pollingInterval thay đổi
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  // Hàm gửi tin nhắn qua API POST và clear ô nhập sau khi gửi thành công
  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation || !currentUserId) return;
    const newMsg = {
      userSendID: currentUserId,
      userGetID: selectedConversation,
      content: message,
      image: null,
      dateTime: new Date().toISOString(),
      status: 1,
    };

    fetch("https://localhost:8000/api/Message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMsg),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gửi tin nhắn thất bại");
        }
        return response.json();
      })
      .then(() => {
        setMessage(""); // Clear ô nhập sau khi gửi thành công
      })
      .catch((error) => console.error("Error sending message:", error));
  };

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Left Sidebar - Danh sách cuộc trò chuyện */}
      <div className="w-1/4 h-full bg-white border-r p-4 flex flex-col">
        <div className="text-xl font-bold mb-4">Đoạn chat</div>
        <div className="relative mb-4">
          <input
            className="w-full p-2 bg-gray-200 rounded-full pl-10 pr-10 text-black"
            placeholder="Tìm kiếm trên Messenger"
            type="text"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
          <FaSearch className="absolute right-3 top-3 text-gray-500" />
        </div>
        <div className="flex flex-col space-y-4 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded cursor-pointer"
                onClick={() =>
                  handleSelectConversation(
                    conv.userGetID,
                    conv.partnerName ? conv.partnerName : `User ${conv.userGetID}`
                  )
                }
              >
                <img
                  alt={`Profile picture của User ${conv.userGetID}`}
                  className="rounded-full"
                  height="40"
                  src="https://via.placeholder.com/40"
                  width="40"
                />
                <div>
                  <div className="font-bold">
                    {conv.partnerName ? conv.partnerName : `User ${conv.userGetID}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {conv.latestMessageContent}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">Không có cuộc trò chuyện nào.</div>
          )}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col relative">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-3">
            <img
              alt="Profile picture"
              className="rounded-full"
              height="40"
              src="https://via.placeholder.com/40"
              width="40"
            />
            <div>
              {/* Hiển thị tên đối phương thay vì "Tú" */}
              <div className="font-bold">
                {selectedPartnerName || "Tú"}
              </div>
              <div className="text-sm text-gray-500">Hoạt động 6 phút trước</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
              <i className="fas fa-phone"></i>
            </button>
            <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
              <i className="fas fa-video"></i>
            </button>
          </div>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto pb-24">
          {selectedConversation ? (
            conversationMessages.length > 0 ? (
              conversationMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.userSendID === Number(currentUserId)
                      ? "justify-end"
                      : "justify-start"
                    } mb-2`}
                >
                  <div
                    className={`max-w-[60%] p-3 rounded-lg ${msg.userSendID === Number(currentUserId)
                        ? "bg-blue-200"
                        : "bg-gray-200"
                      }`}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {new Date(msg.dateTime).toLocaleTimeString()}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">Chưa có tin nhắn.</div>
            )
          ) : (
            <div className="text-gray-500">Chọn một cuộc trò chuyện để xem tin nhắn</div>
          )}
        </div>
        {/* Chat Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center space-x-3">
          <button className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors">
            <FaUpload />
          </button>
          <input
            className="w-full p-2 bg-gray-200 rounded-full text-black"
            placeholder="Aa"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors"
            onClick={handleSendMessage}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-1/4 bg-white border-l p-4 flex flex-col" style={{ height: "94%" }}>
        <div className="flex items-center space-x-3 mb-4 hover:bg-gray-100 p-2 rounded cursor-pointer">
          <img
            alt="Profile picture"
            className="rounded-full"
            height="40"
            src="https://via.placeholder.com/40"
            width="40"
          />
          <div>
            {/* Thay đổi "Tú" thành tên đối phương nếu đã chọn */}
            <div className="font-bold">
              {selectedPartnerName || "Tú"}
            </div>
            <div className="text-sm text-gray-500">Hoạt động 6 phút trước</div>
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
