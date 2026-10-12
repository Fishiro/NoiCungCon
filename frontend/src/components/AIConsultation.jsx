import { useState } from "react";

// URL backend lấy từ biến môi trường Vite.
// Local: http://localhost:5000
// Render: URL Web Service backend do bạn cung cấp.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");

export default function AIConsultation() {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content:
                'Chào ba mẹ, tôi là chuyên gia trị liệu ngôn ngữ. Ba mẹ đang gặp khó khăn gì trong việc giao tiếp cùng con hay muốn tìm hiểu về "Bộ thẻ từ vựng cốt lõi cho trẻ chậm nói"?',
        },
    ]);

    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        const messageText = input.trim();

        if (!messageText || isSending) {
            return;
        }

        // Hiển thị tin nhắn người dùng ngay trên giao diện.
        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: messageText,
            },
        ]);

        setInput("");
        setIsSending(true);

        try {
            if (!API_BASE_URL) {
                throw new Error(
                    "Chưa cấu hình VITE_API_BASE_URL. " +
                        "Hãy kiểm tra biến môi trường frontend.",
                );
            }

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: messageText,
                }),
            });

            // Đọc JSON kể cả khi backend trả mã lỗi.
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.error || `Backend trả về HTTP ${response.status}.`,
                );
            }

            // Backend trả kết quả theo cấu trúc Chat Completions.
            const aiReply = data?.choices?.[0]?.message?.content;

            if (typeof aiReply !== "string" || !aiReply.trim()) {
                throw new Error("AI chưa trả về nội dung. Vui lòng thử lại.");
            }

            // Đây là phần bản cũ còn thiếu:
            // đưa câu trả lời AI vào danh sách tin nhắn.
            setMessages((previous) => [
                ...previous,
                {
                    role: "ai",
                    content: aiReply.trim(),
                },
            ]);
        } catch (error) {
            console.error("Lỗi tư vấn AI:", error);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Không thể kết nối hệ thống tư vấn.";

            setMessages((previous) => [
                ...previous,
                {
                    role: "ai",
                    content:
                        `Xin lỗi ba mẹ, hệ thống chưa thể trả lời lúc này. ` +
                        `${errorMessage} Vui lòng thử lại sau.`,
                },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey && !isSending) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-320px)] min-h-112.5 bg-surface border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Tiêu đề khung chat */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 text-center">
                <h2 className="text-[16px] font-bold text-dark">
                    Chuyên gia AI trị liệu ngôn ngữ
                </h2>

                <p className="text-[12px] text-muted">
                    {isSending
                        ? "Đang xử lý câu hỏi..."
                        : "Phản hồi ngay lập tức"}
                </p>
            </div>

            {/* Nội dung hội thoại */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
                aria-live="polite"
                aria-label="Nội dung hội thoại"
            >
                {messages.map((msg, index) => (
                    <div
                        key={`${index}-${msg.role}`}
                        className={`flex ${
                            msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`p-3 md:p-4 rounded-2xl max-w-[85%] md:max-w-[75%] text-[14px] md:text-body leading-relaxed shadow-sm whitespace-pre-wrap wrap-break-word ${
                                msg.role === "user"
                                    ? "bg-primary text-surface rounded-br-none"
                                    : "bg-white text-dark border border-slate-200 rounded-bl-none"
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isSending && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-2xl rounded-bl-none bg-white text-muted border border-slate-200 text-[13px] shadow-sm">
                            Đang soạn câu trả lời...
                        </div>
                    </div>
                )}
            </div>

            {/* Khu vực nhập tin nhắn */}
            <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-end">
                <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    className="flex-1 max-h-30 min-h-11 p-3 bg-slate-100 border border-transparent rounded-lg text-body focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none outline-none transition-all disabled:opacity-60"
                    placeholder="Nhập câu hỏi của ba mẹ..."
                    rows={1}
                    aria-label="Nhập câu hỏi tư vấn"
                />

                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    className="h-11 px-5 bg-accent text-surface font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center"
                >
                    {isSending ? "Đang gửi..." : "Gửi"}
                </button>
            </div>
        </div>
    );
}
