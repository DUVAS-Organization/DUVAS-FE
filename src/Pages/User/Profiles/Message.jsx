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

// Hàm format thời gian: định dạng dd-mm-yyyy HH:mm:ss
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
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
      console.error("Lỗi khi tải lên tệp:", error);
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

  // Hàm fetch cả hội thoại và tin nhắn
  const fetchAllData = async () => {
    if (!currentUserId) return;

    try {
      // Fetch danh sách hội thoại
      const convData = await OtherService.getConversations(currentUserId);
      const newConversations = await Promise.all(
        convData.map(async (conv) => {
          try {
            const userInfo = await UserService.getUserById(conv.userGetID);
            conv.partnerName = userInfo.name;
            conv.partnerPicture = userInfo.profilePicture;
            conv.partnerIsActive = userInfo.isActive || false;
          } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", conv.userGetID, error);
            conv.partnerName = `Người dùng ${conv.userGetID}`;
            conv.partnerPicture = "";
            conv.partnerIsActive = false;
          }
          return conv;
        })
      );
      setConversations(newConversations);

      // Fetch tin nhắn nếu có hội thoại được chọn
      if (selectedConversation) {
        const msgData = await OtherService.getMessages(currentUserId, selectedConversation);
        setConversationMessages(msgData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
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
    fetchAllData(); // Gọi ngay để lấy tin nhắn
  };

  // Nhận thông tin người nhắn từ location state
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

  // Xử lý sự kiện tin nhắn realtime từ ChatHub
  useEffect(() => {
    if (currentUserId) {
      connectSocket(currentUserId, "chat");

      const handleReceiveMessage = (msg) => {
        const sendId = Number(msg.userSendID);
        const getId = Number(msg.userGetID);
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

  // Gọi fetchAllData mỗi 1 giây
  useEffect(() => {
    if (currentUserId) {
      fetchAllData(); // Gọi ngay lần đầu
      const interval = setInterval(() => {
        fetchAllData();
      }, 1000); // Gọi mỗi 1 giây

      return () => clearInterval(interval);
    }
  }, [currentUserId, selectedConversation]);

  // Auto scroll xuống cuối danh sách tin nhắn
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [displayedMessages]);

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
        console.error("Lỗi khi tải lên tệp:", error);
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
      setConversationMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
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

  // Lọc danh sách hội thoại
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.partnerName || `Người dùng ${conv.userGetID}`;
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
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-500 dark:hover:text-black p-2 rounded cursor-pointer"
                onClick={() =>
                  handleSelectConversation(
                    conv.userGetID,
                    conv.partnerName || `Người dùng ${conv.userGetID}`,
                    conv.partnerPicture || "",
                    conv.partnerIsActive || false
                  )
                }
              >
                {renderAvatarDisplay(conv.partnerPicture, conv.partnerName, 40)}
                <div>
                  <div className="font-bold">
                    {conv.partnerName || `Người dùng ${conv.userGetID}`}
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

      {/* PHẦN GIỮA: Danh sách tin nhắn */}
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
                      className={`max-w-[400px] p-3 rounded-lg break-words whitespace-pre-wrap ${isMine ? "bg-blue-200 dark:bg-gray-500 dark:text-white" : "bg-gray-200"
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
                                  alt="Tệp đính kèm"
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
            <div className="text-gray-500">Chọn một cuộc trò chuyện để xem tin nhắn.</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4 flex flex-col">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUploadClick}
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
              placeholder="Nhập tin nhắn..."
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
                    alt={`Xem trước ${index}`}
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
            File phương tiện & tệp
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
            alt="Ảnh phóng to"
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Message;
