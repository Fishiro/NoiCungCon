import { useState } from "react";

export default function AIConsultation() {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content:
                'Chào ba mẹ, tôi là chuyên gia trị liệu ngôn ngữ. Ba mẹ đang gặp khó khăn gì trong việc giao tiếp cùng con hay muốn tìm hiểu về "Bộ thẻ từ vựng cốt lõi cho trẻ chậm nói"?',
        },
    ]);
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        try {
            const response = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    { role: "ai", content: data.choices[0].message.content },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "ai",
                        content:
                            "Bộ thẻ từ vựng cốt lõi gồm 5 quyển với 100 thẻ 3D sinh động. Ba mẹ có muốn xem chi tiết bộ sách không?",
                    },
                ]);
            }
        } catch (error) {
            console.error("API Error", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content:
                        "Hệ thống đang tải. Bộ thẻ từ vựng cốt lõi gồm 5 quyển với 100 thẻ 3D. Ba mẹ cần tư vấn thêm không?",
                },
            ]);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-320px)] min-h-[450px] bg-surface border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Vùng Header của khung Chat */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 text-center">
                <h2 className="text-[16px] font-bold text-dark">
                    Chuyên gia AI trị liệu ngôn ngữ
                </h2>
                <p className="text-[12px] text-muted">Phản hồi ngay lập tức</p>
            </div>

            {/* Khu vực nội dung Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`p-3 md:p-4 rounded-2xl max-w-[85%] md:max-w-[75%] text-[14px] md:text-body leading-relaxed shadow-sm ${
                                msg.role === "user"
                                    ? "bg-primary text-surface rounded-br-none"
                                    : "bg-white text-dark border border-slate-200 rounded-bl-none"
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Khu vực nhập Text */}
            <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-end">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className="flex-1 max-h-[120px] min-h-[44px] p-3 bg-slate-100 border border-transparent rounded-lg text-body focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none outline-none transition-all"
                    placeholder="Nhập câu hỏi của ba mẹ..."
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-[44px] px-5 bg-accent text-surface font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
}
