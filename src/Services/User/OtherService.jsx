import axios from 'axios';

const API_URL = 'https://localhost:8000/api';
const HUB_BASE_URL = 'https://localhost:8000';

// Tạo instance axios để dễ dàng cấu hình chung
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Xử lý lỗi chung
const handleError = (error) => {
  if (error.response) {
    // Server trả về response với status code ngoài 2xx
    const message = error.response.data?.Message || 
                    error.response.data?.message || 
                    'Lỗi không xác định từ server';
    const status = error.response.status;
    
    return Promise.reject({
      message,
      status,
      data: error.response.data,
      isAxiosError: true,
    });
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    return Promise.reject({
      message: 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.',
      isNetworkError: true,
    });
  } else {
    // Lỗi khi thiết lập request
    return Promise.reject({
      message: error.message || 'Lỗi khi thiết lập yêu cầu',
      isRequestError: true,
    });
  }
};

const OtherService = {
  // JWT Login
  login: async (username, password) => {
    const payload = {
      username: username.trim(),
      password: password.trim(),
    };
    return apiClient.post('/Auth/login', payload)
      .then(res => res.data)
      .catch(handleError);
  },

  // Login Google
  googleLogin: () => {
    window.location.href = `${API_URL}/Auth/google`;
  },

  // Exchange Google Token
  exchangeGoogleToken: async (code) => {
    return apiClient.get('/Auth/token-exchange', { params: { code } })
      .then(res => res.data)
      .catch(error => {
        // Xử lý đặc biệt cho lỗi từ login-google
        if (error.response?.status === 400 && 
            error.response.data?.Message === "Tài khoản không có quyền đăng nhập.") {
          return Promise.reject({
            redirectToLogin: true,
            message: error.response.data.Message,
            status: 403, // Forbidden
          });
        }
        return handleError(error);
      });
  },

  // Save Post
  getSavedPosts: async (userId) => {
    return apiClient.get(`/SavedPosts/${userId}`)
      .then(res => res.data)
      .catch(handleError);
  },

  // Toggle save service post
  toggleSaveServicePost: async (userId, servicePostId) => {
    const payload = { userId, servicePostId: parseInt(servicePostId) };
    return apiClient.post('/SavedPosts/', payload)
      .then(res => res.data)
      .catch(handleError);
  },

  // Toggle save post
  toggleSavePost: async (userId, roomId) => {
    const payload = {
      userId: userId,
      roomId: parseInt(roomId),
    };
    return apiClient.post('/SavedPosts/', payload)
      .then(res => res.data)
      .catch(handleError);
  },

  // Send OTP for password reset
  sendOtp: async (emailOrPhone) => {
    return apiClient.get('/Auth/forgot-password', { 
      params: { emailOrPhone } 
    })
    .then(res => res.data)
    .catch(handleError);
  },

  // Reset password
  resetPassword: async (otp, password, rePassword, email) => {
    const payload = {
      otp,
      password,
      rePassword,
      email,
    };
    return apiClient.post('/Auth/reset-password', payload)
      .then(res => res.data)
      .catch(handleError);
  },

  // Send OTP for verification
  sendOtpVerify: async (emailOrPhone) => {
    const payload = { emailOrPhone };
    return apiClient.post('/Auth/verify', payload)
      .then(res => res.data)
      .catch(handleError);
  },

  // Register new account
  register: async (otp, userName, name, password, rePassword, address, sex, email) => {
    const payload = {
      otp,
      userName,
      name,
      password,
      rePassword,
      address,
      sex,
      email,
    };
    return apiClient.post('/Auth/register', payload)
      .then(res => res.data)
      .catch(handleError);
  },

  // Remove saved post
  toggleSavePostRemove: async (userId, roomId, servicePostId) => {
    const payload = { userId };
    if (roomId) payload.roomId = roomId;
    if (servicePostId) payload.servicePostId = servicePostId;
    return apiClient.post('/SavedPosts', payload)
      .then(res => res.data)
      .catch(handleError);
  },

  // Get messages between users
  getMessages: async (userId, adminUserId) => {
    return apiClient.get(`/Message/user/${userId}/${adminUserId}`)
      .then(res => res.data)
      .catch(handleError);
  },

  // Send message
  sendMessage: async (message) => {
    return apiClient.post('/Message', message)
      .then(res => res.data)
      .catch(handleError);
  },

  // Upload image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/Upload/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(res => res.data)
    .catch(handleError);
  },

  // Rent room
  rentRoom: async (rentPayload, token) => {
    return apiClient.post('/RoomManagement/rent-room', rentPayload, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.data)
    .catch(handleError);
  },

  // Send email notification
  sendMail: async (sendMailPayload, token) => {
    return apiClient.post('/RoomManagement/send-mail', sendMailPayload, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.data)
    .catch(handleError);
  },

  // Get conversations
  getConversations: async (userId) => {
    return apiClient.get(`/Message/conversations/${userId}`)
      .then(res => res.data)
      .catch(handleError);
  },

  // Remove saved post
  removeSavedPost: async (payload) => {
    return apiClient.delete('/SavedPosts', {
      headers: { "Content-Type": "application/json" },
      data: payload,
    })
    .then(res => res.data)
    .catch(handleError);
  },

  // Rent service
  rentService: async (requestPayload) => {
    return apiClient.post('/ServiceManagement/rent-service', requestPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(res => res.data)
    .catch(handleError);
  },

  // AI Check CCCD
  AICCCD: async (file) => {
    const formData = new FormData();
    formData.append('File', file);

    return apiClient.post('/fptai/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(res => res.data)
    .catch(error => {
      console.error('Error uploading image:', error);
      return handleError(error);
    });
  },

  // Hub URLs
  savedPostHub: `${HUB_BASE_URL}/savedPostHub`,
  chatHub: `${HUB_BASE_URL}/chathub`,
};

export default OtherService;