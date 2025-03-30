import { useState, useEffect, useRef } from "react";
import {
  FaUpload,
  FaPaperPlane,
  FaSearch,
  FaPhoneAlt,
  FaVideo,
  FaUser,
  FaBell,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../../Context/AuthProvider";
import { useLocation } from "react-router-dom";
import UserService from "../../Services/User/UserService";
import Loading from "../../Components/Loading";

// Hàm hiển thị avatar
const renderAvatar = (avatar, name, size = 40) => {
  if (avatar) {
    return (
      <img
        alt={`Avatar of ${name}`}
        className="rounded-full"
        height={size}
        width={size}
        src={avatar}
      />
    );
  } else {
    const initial = name ? name.charAt(0).toUpperCase() : "U";
    return (
      <div
        className="rounded-full bg-gray-300 flex items-center justify-center"
        style={{ height: size, width: size }}
      >
        <span className="text-xl font-semibold text-gray-800">{initial}</span>
      </div>
    );
  }
};

const MessageAdmin = () => {
  const { user } = useAuth();
  const currentUserId = user ? user.userId : null;

  // State tin nhắn, hội thoại
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState("");
  const [selectedPartnerAvatar, setSelectedPartnerAvatar] = useState("");
  const [selectedPartnerIsActive, setSelectedPartnerIsActive] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Tìm kiếm, mute, loading
  const [isMuted, setIsMuted] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [conversationSearchTerm, setConversationSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Upload ảnh
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedPreviews, setAttachedPreviews] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Refs
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Lọc tin nhắn theo searchTerm
  const displayedMessages = searchTerm
    ? conversationMessages.filter((msg) =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : conversationMessages;

  // Lọc hội thoại theo conversationSearchTerm
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.partnerName || `User ${conv.userGetID}`;
    return name.toLowerCase().includes(conversationSearchTerm.toLowerCase());
  });

  // Toggle mute
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    // Gọi API nếu cần
  };

  // Toggle search box
  const handleToggleSearch = () => {
    setShowSearchBox((prev) => !prev);
    setSearchTerm("");
  };

  // Upload file
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://apiduvas1.runasp.net/api/Upload/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setAttachedPreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachedPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fetch hội thoại
  useEffect(() => {
    if (!currentUserId) return;
    setIsLoading(true);
    fetch(`https://apiduvas1.runasp.net/api/Message/conversations/${currentUserId}`)
      .then((res) => res.json())
      .then(async (data) => {
        const newConversations = await Promise.all(
          data.map(async (conv) => {
            try {
              const userInfo = await UserService.getUserById(conv.userGetID);
              conv.partnerName = userInfo.name;
              conv.partnerPicture = userInfo.profilePicture;
              conv.partnerIsActive = userInfo.isActive || false;
            } catch (error) {
              console.error("Error fetching user info:", error);
              conv.partnerName = `User ${conv.userGetID}`;
              conv.partnerPicture = "";
              conv.partnerIsActive = false;
            }
            return conv;
          })
        );
        setConversations(newConversations);
      })
      .catch((err) => console.error("Error fetching conversations:", err))
      .finally(() => setIsLoading(false));
  }, [currentUserId]);

  // Fetch tin nhắn
  const fetchConversationMessages = (partnerId) => {
    if (!currentUserId) return;
    setIsLoading(true);
    fetch(`https://apiduvas1.runasp.net/api/Message/user/${currentUserId}/${partnerId}`)
      .then((res) => res.json())
      .then((data) => {
        setConversationMessages(data);
      })
      .catch((err) => console.error("Error fetching messages:", err))
      .finally(() => setIsLoading(false));
  };

  // Chọn hội thoại
  const handleSelectConversation = (
    partnerId,
    partnerName = "",
    partnerAvatar = "",
    partnerIsActive = false
  ) => {
    setSelectedConversation(partnerId);
    setSelectedPartnerName(partnerName);
    setSelectedPartnerAvatar(partnerAvatar);
    setSelectedPartnerIsActive(partnerIsActive);
    setAttachedFiles([]);
    setAttachedPreviews([]);
    fetchConversationMessages(partnerId);

    if (pollingInterval) clearInterval(pollingInterval);
    const intervalId = setInterval(() => {
      fetchConversationMessages(partnerId);
    }, 3000);
    setPollingInterval(intervalId);
  };

  // Lấy partnerId từ state (nếu có)
  const locationState = useLocation();
  useEffect(() => {
    if (locationState.state?.partnerId) {
      handleSelectConversation(
        locationState.state.partnerId,
        locationState.state.partnerName || "Chủ phòng",
        locationState.state.partnerAvatar || "",
        locationState.state.partnerIsActive || false
      );
    }
    // eslint-disable-next-line
  }, [locationState.state]);

  // Clear polling
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  // Auto-scroll
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceFromBottom < 50) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [displayedMessages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (isSending) return;
    if (!message.trim() && attachedFiles.length === 0) return;
    if (!selectedConversation || !currentUserId) return;

    setIsSending(true);

    let uploadedImageUrls = [];
    if (attachedFiles.length > 0) {
      try {
        uploadedImageUrls = await Promise.all(
          attachedFiles.map((file) => uploadFile(file))
        );
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }

    const newMsg = {
      userSendID: currentUserId,
      userGetID: selectedConversation,
      content: message,
      image: uploadedImageUrls.length > 0 ? JSON.stringify(uploadedImageUrls) : null,
      dateTime: new Date().toISOString(),
      status: 1,
    };

    setMessage("");
    setAttachedFiles([]);
    setAttachedPreviews([]);

    fetch("https://apiduvas1.runasp.net/api/Message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsg),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gửi tin nhắn thất bại");
        return res.json();
      })
      .catch((err) => console.error("Error sending message:", err))
      .finally(() => setIsSending(false));
  };

  // Xử lý Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR TRÁI */}
      <div className="w-1/4 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">
            Admin Messenger
          </h2>
          <div className="relative">
            <input
              className="w-full p-2 bg-gray-200 rounded-full pl-10 pr-10 text-black focus:outline-none"
              placeholder="Tìm kiếm trên Messenger"
              type="text"
              value={conversationSearchTerm}
              onChange={(e) => setConversationSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>

        {/* Danh sách hội thoại */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && (
            <Loading />
          )}
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  handleSelectConversation(
                    conv.userGetID,
                    conv.partnerName || `User ${conv.userGetID}`,
                    conv.partnerPicture || "",
                    conv.partnerIsActive || false
                  )
                }
              >
                {renderAvatar(
                  conv.partnerPicture,
                  conv.partnerName || `User ${conv.userGetID}`,
                  40
                )}
                <div className="ml-3">
                  <div className="font-semibold">
                    {conv.partnerName
                      ? conv.partnerName
                      : `User ${conv.userGetID}`}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-[160px]">
                    {conv.latestMessageContent}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center mt-4">
              Không có cuộc trò chuyện nào
            </div>
          )}
        </div>
      </div>

      {/* CỘT GIỮA: Khu vực chat */}
      <div className="flex-1 flex flex-col">
        {/* Header chat */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            {renderAvatar(selectedPartnerAvatar, selectedPartnerName, 40)}
            <div>
              <div className="font-bold text-gray-700">
                {selectedPartnerName || "Chọn cuộc trò chuyện"}
              </div>
              <div className="text-sm text-gray-500">
                {selectedPartnerIsActive ? "Đang hoạt động" : "Không hoạt động"}
              </div>
            </div>
          </div>
          {/* <div className="flex items-center space-x-4 text-xl text-blue-600">
            <button className="hover:text-red-600 transition">
              <FaPhoneAlt />
            </button>
            <button className="hover:text-red-600 transition">
              <FaVideo />
            </button>
          </div> */}
        </div>

        {/* Nội dung chat */}
        <div
          ref={messagesContainerRef}
          className="flex-1 p-4 overflow-y-auto bg-white"
        >
          {selectedConversation ? (
            displayedMessages.length > 0 ? (
              displayedMessages.map((msg, index) => {
                const isCurrentUser = msg.userSendID === Number(currentUserId);
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"
                      } mb-3`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[70%] ${isCurrentUser
                        ? "bg-blue-100 text-gray-700"
                        : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(msg.dateTime).toLocaleString("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                      {msg.image && (() => {
                        let images = [];
                        try {
                          images = JSON.parse(msg.image);
                        } catch (e) {
                          images = [msg.image];
                        }
                        return (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {images.map((imgUrl, idx2) => (
                              <img
                                key={idx2}
                                src={imgUrl}
                                alt="Attached"
                                className="w-full h-32 object-cover rounded-md cursor-pointer"
                                onClick={() => setPreviewImage(imgUrl)}
                              />
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 mt-4">
                Chưa có tin nhắn.
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 mt-4">
              Chọn một cuộc trò chuyện để xem tin nhắn
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Thanh nhập tin nhắn */}
        <div className="border-t p-3 bg-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUploadClick}
              className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-500 transition"
            >
              <FaUpload />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            <input
              className="w-full p-2 bg-gray-100 rounded-full text-black focus:outline-none"
              placeholder="Aa"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-500 transition"
              onClick={handleSendMessage}
              disabled={isSending}
            >
              <FaPaperPlane />
            </button>
          </div>

          {/* Preview ảnh đính kèm */}
          {attachedPreviews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {attachedPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-24 h-24 object-cover rounded-md cursor-pointer"
                    onClick={() => setPreviewImage(preview)}
                  />
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR PHẢI: Admin Controls */}
      <div className="w-1/4 border-l bg-white flex flex-col">
        {/* Thông tin đối phương */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3 mb-3">
            {renderAvatar(selectedPartnerAvatar, selectedPartnerName, 50)}
            <div>
              <div className="font-bold text-base text-gray-700">
                {selectedPartnerName || "Người lạ"}
              </div>
              <div className="text-sm text-gray-500">
                {selectedPartnerIsActive ? "Đang hoạt động" : "Không hoạt động"}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              className="flex items-center px-3 py-2 w-full rounded-full border text-gray-600 hover:bg-gray-100 transition"
              onClick={handleToggleMute}
            >
              <FaBell className="mr-2" />
              <span className="text-base">
                {isMuted ? "Bật thông báo" : "Tắt thông báo"}
              </span>
            </button>
            <button
              className="flex items-center px-3 py-2 w-full rounded-full border text-gray-600 hover:bg-gray-100 transition"
              onClick={handleToggleSearch}
            >
              <FaSearch className="mr-2" />
              <span className="text-base">Tìm kiếm</span>
            </button>
            {showSearchBox && (
              <div className="flex flex-col px-3">
                <input
                  className="mt-2 p-2 border rounded-md"
                  placeholder="Nhập từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Admin Tools */}
        {/* <div className="flex-1 p-4">
          <h3 className="font-bold text-gray-700 mb-3">Admin Tools</h3>
          <div className="flex flex-col space-y-3">
            <button className="flex items-center px-3 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
              <FaUser className="mr-2" />
              <span className="text-base">Quản lý người dùng</span>
            </button>
            <button className="flex items-center px-3 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
              <FaBell className="mr-2" />
              <span className="text-base">Báo cáo tin nhắn</span>
            </button>
            <button className="flex items-center px-3 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
              <FaSearch className="mr-2" />
              <span className="text-base">Thống kê tin nhắn</span>
            </button>
          </div>
        </div> */}
      </div>

      {/* Modal Preview Ảnh */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Enlarged Preview"
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default MessageAdmin;