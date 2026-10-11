import { useState } from "react";
import AIConsultation from "./components/AIConsultation";
import BookStore from "./components/BookStore";
import MchatrSurvey from "./components/MchatrSurvey";

export default function App() {
    const [activeTab, setActiveTab] = useState("ai");

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-[70px] md:pb-0 flex flex-col">
            {/* Navigation */}
            <nav className="bg-surface shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-[60px] md:h-[70px]">
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

            {/* Banner Responsive Thu Nhỏ - Tối ưu hóa không gian */}
            <div
                className="w-full relative flex items-center justify-center overflow-hidden bg-cover bg-center py-4 md:py-6 border-b border-slate-200"
                style={{
                    backgroundImage: "url('/images/hinh_trang_web/1.jpg')",
                }}
            >
                {/* Lớp nền mờ trắng giúp tăng độ tương phản đọc chữ */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>

                {/* Nội dung Banner */}
                <div className="text-center z-10 px-4 max-w-3xl mx-auto">
                    <h1 className="text-[15px] md:text-[22px] font-bold text-dark mb-0.5 tracking-tight drop-shadow-sm">
                        Đồng Hành Cùng Trẻ Chậm Nói
                    </h1>
                    <p className="text-[11px] md:text-[14px] text-muted font-medium">
                        Giải pháp đánh giá và can thiệp sớm tại nhà
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl w-full mx-auto px-4 py-6 md:py-10 flex-1">
                {activeTab === "ai" && <AIConsultation />}
                {activeTab === "books" && <BookStore />}
                {activeTab === "survey" && <MchatrSurvey />}
            </main>

            {/* Footer Cải Thiện - Làm rõ thông tin pháp lý & Nhãn hiệu */}
            <footer className="bg-dark text-slate-400 py-8 md:py-10 mt-auto border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
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
                            Thông tin pháp lý
                        </h3>
                        <ul className="text-[13px] space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-surface transition-colors"
                                >
                                    Về chúng tôi & Kiểm duyệt
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-surface transition-colors"
                                >
                                    Chính sách bảo vệ sở hữu trí tuệ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-surface transition-colors"
                                >
                                    Điều khoản bảo mật thông tin
                                </a>
                            </li>
                        </ul>
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

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-muted/20 z-50 flex justify-around items-center h-[70px] px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => setActiveTab("ai")}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === "ai" ? "text-primary" : "text-muted"}`}
                >
                    <span className="text-[18px] leading-none">💬</span>
                    <span className="text-[11px] font-bold">AI Tư vấn</span>
                </button>
                <button
                    onClick={() => setActiveTab("books")}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === "books" ? "text-primary" : "text-muted"}`}
                >
                    <span className="text-[18px] leading-none">📚</span>
                    <span className="text-[11px] font-bold">Thẻ Học</span>
                </button>
                <button
                    onClick={() => setActiveTab("survey")}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === "survey" ? "text-accent" : "text-muted"}`}
                >
                    <span className="text-[18px] leading-none">📝</span>
                    <span className="text-[11px] font-bold">M-CHAT-R</span>
                </button>
            </nav>
        </div>
    );
}
