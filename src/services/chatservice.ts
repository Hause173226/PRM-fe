import axiosInstance from "./axiosInstance";

// Interface cho message và chat
export interface Chat {
  id: string;
  listingId?: string;
  sellerId?: string;
  // Thêm các trường khác nếu cần
}

export interface ChatMessage {
  id?: string;
  chatId: string;
  content: string;
  attachments?: Attachment[];
  createdAt?: string;
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
  const res = await axiosInstance.get<Chat[]>("/api/chats");
  return res.data;
};

// Lấy thông tin một chat theo id
export const getChatById = async (id: string) => {
  const res = await axiosInstance.get<Chat>(`/api/chats/${id}`);
  return res.data;
};

// Tạo mới một chat
export const createChat = async (data: {
  listingId: string;
  sellerId: string;
}) => {
  const res = await axiosInstance.post<Chat>("/api/chats", data);
  return res.data;
};

// Đánh dấu đã đọc chat
export const readChat = async (chatId: string) => {
  const res = await axiosInstance.post(`/api/chats/${chatId}/read`);
  return res.data;
};

// Lấy danh sách tin nhắn của một chat
export const getChatMessages = async (
  chatId: string,
  page: number = 1,
  pageSize: number = 50
) => {
  const res = await axiosInstance.get<ChatMessage[]>(
    `/api/chats/${chatId}/messages`,
    {
      params: { page, pageSize },
    }
  );
  return res.data;
};

// Gửi tin nhắn vào một chat
export const sendChatMessage = async (
  chatId: string,
  data: { content: string; attachments?: Attachment[] }
) => {
  const res = await axiosInstance.post<ChatMessage>(
    `/api/chats/${chatId}/messages`,
    data
  );
  return res.data;
};
