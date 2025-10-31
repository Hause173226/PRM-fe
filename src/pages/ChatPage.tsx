import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  createChat,
  getChatMessages,
  sendChatMessage,
  ChatMessage,
  getChats,
} from "../services/chatservice";
import { getProductById } from "../services/productService";
import { getUserById } from "../services/userService";

// Giả sử lấy userId từ context hoặc localStorage
const currentUserId = "69018208e1519300ed63251e"; // Thay bằng logic lấy user thực tế

const ChatPage: React.FC = () => {
  const { productId, sellerId } = useParams<{
    productId: string;
    sellerId: string;
  }>();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [productName, setProductName] = useState<string>("");
  const [sellerName, setSellerName] = useState<string>("");
  const [sellerInitials, setSellerInitials] = useState<string>("NB");

  // Fetch thông tin sản phẩm và người bán
  useEffect(() => {
    const fetchProductAndSeller = async () => {
      // Fetch thông tin sản phẩm
      if (productId) {
        try {
          const product = await getProductById(productId);
          setProductName(product.name || "Sản phẩm");
        } catch (err) {
          console.error("Error fetching product:", err);
          setProductName("Sản phẩm");
        }
      }

      // Fetch thông tin người bán
      if (sellerId) {
        try {
          const seller = await getUserById(sellerId);
          const name = seller.fullName || seller.displayName || "Người bán";
          setSellerName(name);
          
          // Tạo initials từ tên
          const nameParts = name.trim().split(" ");
          if (nameParts.length >= 2) {
            setSellerInitials(
              (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            );
          } else {
            setSellerInitials(name.substring(0, 2).toUpperCase());
          }
        } catch (err) {
          console.error("Error fetching seller:", err);
          setSellerName("Người bán");
          setSellerInitials("NB");
        }
      }
    };

    fetchProductAndSeller();
  }, [productId, sellerId]);

  // Tìm hoặc tạo chat khi vào trang
  useEffect(() => {
    const initChat = async () => {
      if (productId && sellerId) {
        setLoading(true);
        try {
          // Lấy tất cả chat
          const res = await getChats();
          const allChats = Array.isArray(res.data.data) ? res.data.data : [];
          // Tìm chat đúng buyerId, sellerId, listingId
          let chat = allChats.find(
            (c: any) =>
              c.listingId === productId &&
              c.sellerId === sellerId &&
              c.buyerId === currentUserId
          );
          // Nếu chưa có thì tạo mới
          if (!chat) {
            chat = await createChat({
              listingId: productId,
              sellerId: sellerId,
            });
          }
          setChatId(chat.id);
          setError(null);
        } catch (err) {
          setError("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    initChat();
  }, [productId, sellerId]);

  // Lấy tin nhắn khi có chatId
  useEffect(() => {
    if (!chatId) return;
    const fetchMessages = async () => {
      try {
        const msgs = await getChatMessages(chatId);
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (err) {
        setError("Không thể tải tin nhắn.");
        setMessages([]);
        console.error(err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // Tự động scroll xuống cuối khi có tin nhắn mới - BỎ COMMENT NẾU MUỐN TẮT AUTO SCROLL
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !input.trim() || loading) return;
    const messageContent = input.trim();
    setInput("");
    setLoading(true);
    try {
      await sendChatMessage(chatId, { content: messageContent });
      const msgs = await getChatMessages(chatId);
      setMessages(msgs);
      setError(null);
    } catch (err) {
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
      setInput(messageContent);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error && !chatId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Đã có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">
                {sellerName || "Chat với người bán"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {productName || `Sản phẩm #${productId}`}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {sellerInitials}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white overflow-y-auto p-6 space-y-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải tin nhắn...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">
                  Chưa có tin nhắn nào
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Gửi tin nhắn đầu tiên của bạn
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Phân biệt tin nhắn của mình và đối phương
              const isCurrentUser = msg.senderId === currentUserId;
              const showAvatar =
                index === 0 || messages[index - 1]?.senderId !== msg.senderId;

              return (
                <div
                  key={msg.id || index}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } items-end gap-2`}
                >
                  {!isCurrentUser && showAvatar && (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {sellerInitials}
                    </div>
                  )}
                  {!isCurrentUser && !showAvatar && <div className="w-8" />}

                  <div
                    className={`max-w-[70%] ${
                      isCurrentUser
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    } rounded-2xl px-4 py-3 shadow-sm`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>

                  {isCurrentUser && showAvatar && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      B
                    </div>
                  )}
                  {isCurrentUser && !showAvatar && <div className="w-8" />}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && chatId && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 border-t">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={loading || !chatId}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              disabled={loading || !chatId || !input.trim()}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Gửi
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
