import axiosInstance from "./axiosInstance";

// Interface cho message và chat
export interface Chat {
  id: string;
  listingId?: string;
  sellerId?: string;
  buyerId?: string;
  // Thêm các trường khác nếu cần
  listingName?: string;
  sellerName?: string;
}

export interface ChatMessage {
  id?: string;
  chatId: string;
  content: string;
  attachments?: Attachment[];
  createdAt?: string;
  senderId?: string;
  // Thêm các trường khác nếu cần
}

export interface Attachment {
  type: string;
  url: string;
  fileName: string;
  fileSize: number;
}

// Lấy danh sách tất cả các chat
export const getChats = async () => {
  const res = await axiosInstance.get("/chats");
  return res;
};

// Lấy thông tin một chat theo id
export const getChatById = async (id: string) => {
  const res = await axiosInstance.get<Chat>(`/chats/${id}`);
  return res.data;
};

// Tạo mới một chat
export const createChat = async (data: {
  listingId: string;
  sellerId: string;
}) => {
  const res = await axiosInstance.post("/chats", data);
  return res.data.data; // Trả về object chat
};

// Đánh dấu đã đọc chat
export const readChat = async (chatId: string) => {
  const res = await axiosInstance.post(`/chats/${chatId}/read`);
  return res.data;
};

// Lấy danh sách tin nhắn của một chat
export const getChatMessages = async (
  chatId: string,
  page: number = 1,
  pageSize: number = 50
) => {
  const res = await axiosInstance.get(`/chats/${chatId}/messages`, {
    params: { page, pageSize },
  });
  // Nếu API trả về { data: [...] }
  return Array.isArray(res.data.data) ? res.data.data : [];
  // Nếu API trả về mảng trực tiếp
  // return Array.isArray(res.data) ? res.data : [];
};

// Gửi tin nhắn vào một chat
export const sendChatMessage = async (
  chatId: string,
  data: { content: string; attachments?: Attachment[] }
) => {
  const res = await axiosInstance.post<ChatMessage>(
    `/chats/${chatId}/messages`,
    data
  );
  return res.data;
};
