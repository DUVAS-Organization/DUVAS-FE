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

// Hàm hiển thị avatar: nếu có ảnh thì hiển thị, nếu không thì hiển thị chữ cái đầuaaa
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

const Message = () => {
  const { user } = useAuth();
  const currentUserId = user ? user.userId : null;

  // State tin nhắn, hội thoại, thông tin đối phương...
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedPartnerName, setSelectedPartnerName] = useState("");
  const [selectedPartnerAvatar, setSelectedPartnerAvatar] = useState("");
  const [selectedPartnerIsActive, setSelectedPartnerIsActive] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Các state phụ
  const [isMuted, setIsMuted] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [conversationSearchTerm, setConversationSearchTerm] = useState("");
  const displayedMessages = searchTerm
    ? conversationMessages.filter((msg) =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : conversationMessages;

  // Lọc hội thoại
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.partnerName || `User ${conv.userGetID}`;
    return name.toLowerCase().includes(conversationSearchTerm.toLowerCase());
  });

  // Loading và gửi tin nhắn
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // State cho upload nhiều ảnh
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
      const response = await fetch("https://localhost:8000/api/Upload/upload-image", {
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

  // Lấy danh sách hội thoại
  const fetchConversations = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://localhost:8000/api/Message/conversations/${currentUserId}`
      );
      const data = await response.json();
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

  // Lấy danh sách tin nhắn
  const fetchConversationMessages = async (partnerId) => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://localhost:8000/api/Message/user/${currentUserId}/${partnerId}`
      );
      const data = await response.json();
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

  useEffect(() => {
    if (pollingInterval) {
      return () => clearInterval(pollingInterval);
    }
  }, [pollingInterval]);

  // Auto-scroll xuống cuối
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

    try {
      const response = await fetch("https://localhost:8000/api/Message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
      if (!response.ok) throw new Error("Gửi tin nhắn thất bại");
      await response.json();
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

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  return (
    <div className="flex h-[90vh] bg-white text-black">
      {/* SIDEBAR TRÁI */}
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
          {isLoading && <Loading />}
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded cursor-pointer"
                onClick={() =>
                  handleSelectConversation(
                    conv.userGetID,
                    conv.partnerName || `User ${conv.userGetID}`,
                    conv.partnerPicture || "",
                    conv.partnerIsActive || false
                  )
                }
              >
                {renderAvatar(conv.partnerPicture, conv.partnerName, 40)}
                <div>
                  <div className="font-bold">
                    {conv.partnerName || `User ${conv.userGetID}`}
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

      {/* PHẦN GIỮA */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {renderAvatar(selectedPartnerAvatar, selectedPartnerName, 40)}
            <div>
              <div className="font-bold">{selectedPartnerName || "Chọn cuộc trò chuyện"}</div>
              <div className="text-sm text-gray-500">
                {selectedPartnerIsActive ? "Đang hoạt động" : "Không hoạt động"}
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách tin nhắn */}
        <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto">
          {selectedConversation ? (
            displayedMessages.length > 0 ? (
              displayedMessages.map((msg, index) => {
                const isMine = msg.userSendID === Number(currentUserId);
                return (
                  <div
                    key={index}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
                  >
                    {/* max-w cố định để không tràn, + break-words + whitespace-pre-wrap */}
                    <div
                      className={`max-w-[400px] p-3 rounded-lg break-words whitespace-pre-wrap ${isMine ? "bg-blue-200" : "bg-gray-200"
                        }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(msg.dateTime).toLocaleString()}
                      </div>
                      <div>{msg.content}</div>
                      {msg.image && (() => {
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
              <Loading />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Thanh nhập tin nhắn */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              type="submit"
              className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-colors"
              onClick={handleSendMessage}
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

      {/* SIDEBAR PHẢI */}
      <div className="w-1/4 border-l p-4 flex flex-col">
        <div className="flex items-center space-x-3 mb-3">
          {renderAvatar(selectedPartnerAvatar, selectedPartnerName, 50)}
          <div>
            <div className="font-bold text-base">
              {selectedPartnerName || "Người lạ"}
            </div>
            <div className="text-sm text-gray-500">
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

        <hr className="mb-4" />

        <div className="flex flex-col space-y-2 text-sm text-gray-700">
          <button className="text-left py-2 px-2 hover:bg-gray-100 rounded">
            Xem tin nhắn đã ghim
          </button>
          <button className="text-left py-2 px-2 hover:bg-gray-100 rounded">
            Đổi chủ đề
          </button>
          <button className="text-left py-2 px-2 hover:bg-gray-100 rounded">
            File phương tiện &amp; file
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
