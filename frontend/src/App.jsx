// src_code/frontend/src/App.jsx
import { useState } from "react";
import AIConsultation from "./components/AIConsultation";
import BookStore from "./components/BookStore";
import MchatrSurvey from "./components/MchatrSurvey";

export default function App() {
    const [activeTab, setActiveTab] = useState("ai");

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-17.5 md:pb-0 flex flex-col">
            {/* Navigation */}
            <nav className="bg-surface shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-15 md:h-17.5">
                    <div className="text-[20px] md:text-[24px] font-black text-primary tracking-tight">
                        Nói cùng con.
                    </div>
                    <div className="hidden md:flex gap-lg">
                        <button
                            onClick={() => setActiveTab("ai")}
                            className={`text-body font-bold py-2 border-b-2 transition-colors ${activeTab === "ai" ? "text-primary border-primary" : "text-muted border-transparent hover:text-dark"}`}
                        >
                            AI Tư vấn
                        </button>
                        <button
                            onClick={() => setActiveTab("books")}
                            className={`text-body font-bold py-2 border-b-2 transition-colors ${activeTab === "books" ? "text-primary border-primary" : "text-muted border-transparent hover:text-dark"}`}
                        >
                            Bộ Thẻ Học
                        </button>
                        <button
                            onClick={() => setActiveTab("survey")}
                            className={`text-body font-bold py-2 border-b-2 transition-colors ${activeTab === "survey" ? "text-accent border-accent" : "text-muted border-transparent hover:text-accent"}`}
                        >
                            Test M-CHAT-R
                        </button>
                    </div>
                </div>
            </nav>

            {/* Banner hiển thị ảnh (Có giới hạn max-width chống vỡ/phóng to trên màn siêu rộng) */}
            <div className="w-full bg-slate-100 flex justify-center border-b border-slate-200">
                <div
                    className="w-full max-w-480 relative bg-cover bg-center h-17.5 md:h-27.5 lg:h-35"
                    style={{
                        backgroundImage:
                            "url('/images/hinh_trang_web/BANNER.jpg')",
                    }}
                ></div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl w-full mx-auto px-4 py-6 md:py-10 flex-1">
                {activeTab === "ai" && <AIConsultation />}
                {activeTab === "books" && <BookStore />}
                {activeTab === "survey" && <MchatrSurvey />}
            </main>

            {/* Footer - Đã xóa phần "Thông tin pháp lý" */}
            <footer className="bg-dark text-slate-400 py-8 md:py-10 mt-auto border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-surface font-bold text-[18px] mb-3">
                            Nói cùng con.
                        </h3>
                        <p className="text-[13px] leading-relaxed mb-3">
                            Hệ thống hỗ trợ tư vấn và cung cấp học liệu chuyên
                            sâu, đồng hành cùng ba mẹ trên chặng đường phát
                            triển ngôn ngữ của trẻ.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-surface font-bold text-[16px] mb-3">
                            Miễn trừ trách nhiệm
                        </h3>
                        <p className="text-[13px] leading-relaxed italic">
                            Các kết quả khảo sát M-CHAT-R và nội dung tư vấn từ
                            hệ thống chỉ mang tính chất sàng lọc và tham khảo hỗ
                            trợ tại nhà. Vui lòng tham vấn trực tiếp chuyên gia
                            y tế để có chẩn đoán chính xác nhất.
                        </p>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-center text-[12px] text-slate-500">
                    © 2026 Nói cùng con. All rights reserved.
                </div>
            </footer>

            {/* Bottom Navigation (Mobile) - Sử dụng Solid SVG Icons */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-muted/20 z-50 flex justify-around items-center h-17.5 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => setActiveTab("ai")}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === "ai" ? "text-primary" : "text-muted"}`}
                >
                    <svg
                        className="w-5.5 h-5.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                    <span className="text-[11px] font-bold">AI Tư vấn</span>
                </button>
                <button
                    onClick={() => setActiveTab("books")}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === "books" ? "text-primary" : "text-muted"}`}
                >
                    <svg
                        className="w-5.5 h-5.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                    </svg>
                    <span className="text-[11px] font-bold">Thẻ Học</span>
                </button>
                <button
                    onClick={() => setActiveTab("survey")}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === "survey" ? "text-accent" : "text-muted"}`}
                >
                    <svg
                        className="w-5.5 h-5.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                    <span className="text-[11px] font-bold">M-CHAT-R</span>
                </button>
            </nav>
        </div>
    );
}
