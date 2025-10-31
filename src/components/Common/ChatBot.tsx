import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Msg = { role: "user" | "assistant"; text: string };

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const ChatBot: React.FC = () => {
  const apiKey = import.meta.env?.VITE_GEMINI_KEY as string | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "⚡ Xin chào! Tôi là trợ lý AI chuyên về **pin xe điện**. Hãy hỏi tôi bất cứ điều gì về tuổi thọ, hiệu suất, bảo dưỡng, hay công nghệ pin mới nhất nhé!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Xóa toàn bộ hội thoại
  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "⚡ Xin chào! Tôi là trợ lý AI chuyên về **pin xe điện**. Hãy hỏi tôi bất cứ điều gì về tuổi thọ, hiệu suất, bảo dưỡng, hay công nghệ pin mới nhất nhé!",
      },
    ]);
  };

  const send = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    // Nếu chưa có API key
    if (!apiKey) {
      setMessages((m) => [
        ...m,
        { role: "user", text },
        {
          role: "assistant",
          text: "❌ Không tìm thấy API key Gemini. Hãy thêm `VITE_GEMINI_KEY` vào file `.env` rồi khởi động lại dự án.",
        },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      // prompt hệ thống
      const systemPrompt = `
      Bạn là một chuyên gia về pin xe điện và xe điện.
      Trả lời ngắn gọn, dễ hiểu, rõ ràng.
      Dùng gạch đầu dòng hoặc xuống dòng để trình bày nếu cần.
      Không dùng ký tự Markdown **đậm** hoặc _nghiêng_.
      `;

      const fullPrompt = `${systemPrompt}\n\nNgười dùng hỏi: ${text}`;

      // Hiển thị khung trống của AI để stream dần
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", text: "" }]);

      const stream = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: 256,
          temperature: 0.4,
          topK: 32,
          topP: 0.9,
          responseMimeType: "text/plain",
        },
      });

      // Nhận dữ liệu từng phần
      for await (const chunk of stream.stream) {
        const piece = chunk?.text() ?? "";
        if (piece) {
          acc += piece;
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant") last.text = acc;
            return copy;
          });
        }
      }

      // Nếu không có phản hồi
      if (!acc.trim()) {
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            last.text = "⚠️ Không có phản hồi (có thể bị bộ lọc an toàn chặn).";
          }
          return copy;
        });
      }
    } catch (err: any) {
      console.error("ChatBot error:", err);
      const msg = err?.message || "Không xác định";
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant" && !last.text) {
          last.text = `⚠️ Lỗi gọi Gemini: ${msg}`;
          return copy;
        }
        return [...copy, { role: "assistant", text: `⚠️ Lỗi: ${msg}` }];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút bật/tắt chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-medium text-sm">Trợ lý AI về pin xe điện</h3>
            </div>
            <button
              onClick={clearChat}
              className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
            >
              Xóa
            </button>
          </div>

          {/* Nội dung tin nhắn */}
          <div
            ref={boxRef}
            className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 shadow-sm text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text ||
                    (loading && msg.role === "assistant" ? "Đang soạn..." : "")}
                </div>
              </div>
            ))}
          </div>

          {/* Ô nhập */}
          <form onSubmit={send} className="p-3 bg-white border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về pin xe điện..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
