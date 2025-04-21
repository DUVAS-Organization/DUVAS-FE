import { useState, useEffect, useRef } from "react";
import {
  FaUpload,
  FaPaperPlane,
  FaSearch,
  FaBell,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../../../Context/AuthProvider";
import { useLocation } from "react-router-dom";
import UserService from "../../../Services/User/UserService";
import Loading from "../../../Components/Loading";
import { useRealtime } from "../../../Context/RealtimeProvider";
import OtherService from "../../../Services/User/OtherService";

// Hàm hiển thị avatar: nếu có ảnh thì hiển thị, nếu không thì hiển thị chữ cái đầu
const renderAvatar = (avatar, name, size = 40) => {
  if (avatar) {
    return (
      <img
        alt={`${name}`}
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

// Hàm format thời gian: dưới 1 phút -> "vừa gửi", trên 1 phút -> "x phút"
const formatTime = (dateString) => {
  const messageTime = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - messageTime) / 1000);
  if (diffInSeconds < 60) {
    return "vừa gửi";
  } else {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút`;
  }
};

const Message = () => {
  const { user } = useAuth();
  const currentUserId = user ? user.userId : null;
  const locationState = useLocation();
  const { connectSocket, onEvent, offEvent, emitEvent, isChatConnected } = useRealtime();

  // Các state cơ bản
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState("");
  const [selectedPartnerAvatar, setSelectedPartnerAvatar] = useState("");
  const [selectedPartnerIsActive, setSelectedPartnerIsActive] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);

  // Các state phụ khác
  const [isMuted, setIsMuted] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [conversationSearchTerm, setConversationSearchTerm] = useState("");
  const displayedMessages = searchTerm
    ? conversationMessages.filter((msg) =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : conversationMessages;

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // State cho upload file ảnh
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedPreviews, setAttachedPreviews] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Mute
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Search
  const handleToggleSearch = () => {
    setShowSearchBox((prev) => !prev);
    setSearchTerm("");
  };

  // Upload file
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await OtherService.uploadImage(formData);
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

  // Lấy danh sách hội thoại
  const fetchConversations = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const data = await OtherService.getConversations(currentUserId);
      const newConversations = await Promise.all(
        data.map(async (conv) => {
          try {
            const userInfo = await UserService.getUserById(conv.userGetID);
            conv.partnerName = userInfo.name;
            conv.partnerPicture = userInfo.profilePicture;
            conv.partnerIsActive = userInfo.isActive || false;
          } catch (error) {
            console.error("Error fetching user info for", conv.userGetID, error);
            conv.partnerName = `User ${conv.userGetID}`;
            conv.partnerPicture = "";
            conv.partnerIsActive = false;
          }
          return conv;
        })
      );
      setConversations(newConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy danh sách tin nhắn của 1 cuộc trò chuyện cụ thể
  const fetchConversationMessages = async (partnerId) => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const data = await OtherService.getMessages(currentUserId, partnerId);
      setConversationMessages(data);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (
    partnerId,
    partnerName = "",
    partnerAvatar = "",
    partnerIsActive = false
  ) => {
    const pid = Number(partnerId);
    setSelectedConversation(pid);
    setSelectedPartnerName(partnerName);
    setSelectedPartnerAvatar(partnerAvatar);
    setSelectedPartnerIsActive(partnerIsActive);
    setAttachedFiles([]);
    setAttachedPreviews([]);
    fetchConversationMessages(pid);
  };

  // --- PHẦN NHẬN THÔNG TIN NGƯỜI NHẮN --- 
  useEffect(() => {
    if (locationState.state?.partnerId) {
      handleSelectConversation(
        locationState.state.partnerId,
        locationState.state.partnerName || "Chủ phòng",
        locationState.state.partnerAvatar || "",
        locationState.state.partnerIsActive || false
      );
    }
  }, [locationState.state]);
  // -------------------------------------

  // Xử lý sự kiện tin nhắn realtime từ ChatHub
  useEffect(() => {
    if (currentUserId) {
      // Kết nối tới ChatHub
      connectSocket(currentUserId, "chat");

      // Đăng ký các sự kiện realtime
      const handleReceiveMessage = (msg) => {
        const sendId = Number(msg.userSendID);
        const getId = Number(msg.userGetID);
        // Nếu tin nhắn thuộc cuộc trò chuyện đang mở thì hiển thị ngay
        if (
          (sendId === selectedConversation && getId === Number(currentUserId)) ||
          (sendId === Number(currentUserId) && getId === selectedConversation)
        ) {
          setConversationMessages((prev) => [...prev, msg]);
        }
      };

      const handleUpdateConversations = (updatedConversations) => {
        setConversations(updatedConversations);
      };

      const handleUserOnline = (userId) => {
        if (Number(userId) === selectedConversation) {
          setSelectedPartnerIsActive(true);
        }
        setConversations((prev) =>
          prev.map((conv) =>
            Number(conv.userGetID) === Number(userId)
              ? { ...conv, partnerIsActive: true }
              : conv
          )
        );
      };

      const handleUserOffline = (userId) => {
        if (Number(userId) === selectedConversation) {
          setSelectedPartnerIsActive(false);
        }
        setConversations((prev) =>
          prev.map((conv) =>
            Number(conv.userGetID) === Number(userId)
              ? { ...conv, partnerIsActive: false }
              : conv
          )
        );
      };

      onEvent("ReceiveMessage", handleReceiveMessage, "chat");
      onEvent("UpdateConversations", handleUpdateConversations, "chat");
      onEvent("UserOnline", handleUserOnline, "chat");
      onEvent("UserOffline", handleUserOffline, "chat");

      return () => {
        offEvent("ReceiveMessage", handleReceiveMessage, "chat");
        offEvent("UpdateConversations", handleUpdateConversations, "chat");
        offEvent("UserOnline", handleUserOnline, "chat");
        offEvent("UserOffline", handleUserOffline, "chat");
      };
    }
  }, [currentUserId, selectedConversation]);

  // Gọi fetchConversations mỗi 1 giây
  useEffect(() => {
    if (currentUserId) {
      const interval = setInterval(() => {
        fetchConversations();
      }, 1000); // Gọi API mỗi 1 giây

      return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
    }
  }, [currentUserId]);

  // Auto scroll xuống cuối danh sách tin nhắn khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedMessages]);

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
      userSendID: Number(currentUserId),
      userGetID: Number(selectedConversation),
      content: message,
      image: uploadedImageUrls.length > 0 ? JSON.stringify(uploadedImageUrls) : null,
      dateTime: new Date().toISOString(),
      status: 1,
    };

    setMessage("");
    setAttachedFiles([]);
    setAttachedPreviews([]);

    try {
      await OtherService.sendMessage(newMsg);
      // Cập nhật ngay trên client
      setConversationMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render avatar
  const renderAvatarDisplay = (avatar, name, size = 40) => {
    return renderAvatar(avatar, name, size);
  };

  // Lọc danh sách hội thoại cho sidebar
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.partnerName || `User ${conv.userGetID}`;
    return name.toLowerCase().includes(conversationSearchTerm.toLowerCase());
  });

  return (
    <div className="flex h-[90vh] bg-white text-black dark:bg-gray-800 dark:text-white">
      {/* SIDEBAR bên trái: Danh sách hội thoại */}
      <div className="w-1/4 border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b">
          <div className="text-xl font-bold mb-4">Đoạn chat</div>
          <div className="relative">
            <input
              className="w-full p-2 bg-gray-200 rounded-full pl-10 pr-10 text-black"
              placeholder="Tìm kiếm trên Messenger"
              type="text"
              value={conversationSearchTerm}
              onChange={(e) => setConversationSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* {isLoading && <Loading />} */}
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-500 dark:hover:text-black p-2 rounded cursor-pointer"
                onClick={() =>
                  handleSelectConversation(
                    conv.userGetID,
                    conv.partnerName || `User ${conv.userGetID}`,
                    conv.partnerPicture || "",
                    conv.partnerIsActive || false
                  )
                }
              >
                {renderAvatarDisplay(conv.partnerPicture, conv.partnerName, 40)}
                <div>
                  <div className="font-bold">
                    {conv.partnerName || `User ${conv.userGetID}`}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-white truncate max-w-[300px]">
                    {conv.latestMessageContent || ""}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">Không có cuộc trò chuyện nào.</div>
          )}
        </div>
      </div>

      {/* PHẦN GIỮA: Danh sách tin nhắn của cuộc trò chuyện được chọn */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {renderAvatarDisplay(selectedPartnerAvatar, selectedPartnerName, 40)}
            <div>
              <div className="font-bold">
                {selectedPartnerName || "Chọn cuộc trò chuyện"}
              </div>
              <div className="text-sm text-gray-500 dark:text-white">
                {selectedPartnerIsActive ? "Đang hoạt động" : "Không hoạt động"}
              </div>
            </div>
          </div>
        </div>
        <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto">
          {selectedConversation ? (
            displayedMessages.length > 0 ? (
              displayedMessages.map((msg, index) => {
                const isMine = Number(msg.userSendID) === Number(currentUserId);
                return (
                  <div
                    key={index}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-[400px] p-3 rounded-lg break-words whitespace-pre-wrap ${isMine ? "bg-blue-200 dark:bg-gray-500 dark:text-white" : "bg-gray-200 "
                        }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {formatTime(msg.dateTime)}
                      </div>
                      <div>{msg.content}</div>
                      {msg.image &&
                        (() => {
                          let images = [];
                          try {
                            images = JSON.parse(msg.image);
                          } catch (e) {
                            images = [msg.image];
                          }
                          return (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {images.map((imgUrl, idx) => (
                                <img
                                  key={idx}
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
              <div className="text-gray-500">Chưa có tin nhắn.</div>
            )
          ) : (
            <div className="text-gray-500">Chọn một cuộc trò chuyện để xem tin nhắn</div>
          )}
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              {/* <Loading /> */}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4 flex flex-col">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors"
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
              className="w-full p-2 bg-gray-200 rounded-full text-black"
              placeholder="Aa"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors"
              onClick={handleSendMessage}
            >
              <FaPaperPlane />
            </button>
          </div>
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
                    onClick={() => {
                      setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
                      setAttachedPreviews((prev) => prev.filter((_, i) => i !== index));
                    }}
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

      {/* SIDEBAR bên phải: Thông tin người đối thoại */}
      <div className="w-1/4 border-l p-4 flex flex-col">
        <div className="flex items-center space-x-3 mb-3">
          {renderAvatarDisplay(selectedPartnerAvatar, selectedPartnerName, 50)}
          <div>
            <div className="font-bold text-base">
              {selectedPartnerName || "Người lạ"}
            </div>
            <div className="text-sm text-gray-500 dark:text-white">
              {selectedPartnerIsActive ? "Đang hoạt động" : "Không hoạt động"}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 mb-4">
          {/* <button
            className="flex items-center px-3 py-2 w-full rounded-full border text-gray-600 hover:bg-gray-100 transition"
            onClick={handleToggleMute}
          >
            <FaBell className="mr-2" />
            <span className="text-base">
              {isMuted ? "Bật thông báo" : "Tắt thông báo"}
            </span>
          </button> */}
          <button
            className="flex items-center dark:bg-gray-800 dark:text-white px-3 py-2 w-full rounded-full border text-gray-600 hover:bg-gray-100 transition"
            onClick={handleToggleSearch}
          >
            <FaSearch className="mr-2" />
            <span className="text-base">Tìm kiếm</span>
          </button>
          {showSearchBox && (
            <div className="flex flex-col px-3">
              <input
                className="mt-2 p-2 dark:bg-gray-800 dark:text-white border rounded-md"
                placeholder="Nhập từ khóa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
        <hr className="mb-4" />
        <div className="flex flex-col space-y-2 text-sm text-gray-700 dark:text-white">
          <button className="text-left py-2 px-2 hover:bg-gray-100 rounded dark:hover:text-black">
            Xem tin nhắn đã ghim
          </button>
          <button className="text-left py-2 px-2 hover:bg-gray-100 rounded dark:hover:text-black">
            Đổi chủ đề
          </button>
          <button className="text-left py-2 px-2 hover:bg-gray-100 rounded dark:hover:text-black">
            File phương tiện & file
          </button>
        </div>
      </div>

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

export default Message;