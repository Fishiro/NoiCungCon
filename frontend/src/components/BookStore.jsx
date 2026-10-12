import { useState } from "react";

export default function BookStore() {
    const [filter, setFilter] = useState("all");
    const [showAlert, setShowAlert] = useState(false); // State quản lý việc ẩn/hiện bảng thông báo

    const products = [
        {
            id: "combo",
            type: "combo",
            title: "Trọn Bộ 5 Quyển Thẻ Từ Vựng Cốt Lõi",
            price: "2.200.000đ",
            oldPrice: "2.250.000đ",
            images: [
                "/images/bia_sach/quyen1.jpg",
                "/images/bia_sach/quyen2.jpg",
                "/images/bia_sach/quyen3.jpg",
                "/images/bia_sach/quyen4.jpg",
                "/images/bia_sach/quyen5.jpg",
            ],
            tag: "Tiết kiệm nhất",
            desc: "Giải pháp toàn diện gồm 5 chủ đề, giúp trẻ phát triển ngôn ngữ qua sơ đồ tư duy 6 nhánh. Phù hợp cho gia đình và phòng can thiệp.",
        },
        {
            id: 1,
            type: "single",
            title: "Quyển 1: Gia đình & Bản thân",
            price: "450.000đ",
            img: "/images/bia_sach/quyen1.jpg",
            desc: "Chủ đề gần gũi giúp bé nhận biết các thành viên trong gia đình và các bộ phận trên cơ thể.",
        },
        {
            id: 2,
            type: "single",
            title: "Quyển 2: Động vật quanh em",
            price: "450.000đ",
            img: "/images/bia_sach/quyen2.jpg",
            desc: "Khám phá thế giới động vật sinh động qua hình ảnh 3D hoạt hình AI, kích thích sự tò mò của trẻ.",
        },
        {
            id: 3,
            type: "single",
            title: "Quyển 3: Đồ ăn & Thức uống",
            price: "450.000đ",
            img: "/images/bia_sach/quyen3.jpg",
            desc: "Nhận biết các món ăn, đồ uống hàng ngày, giúp trẻ dễ dàng gọi tên các món ăn yêu thích.",
        },
        {
            id: 4,
            type: "single",
            title: "Quyển 4: Đồ dùng cá nhân",
            price: "450.000đ",
            img: "/images/bia_sach/quyen4.jpg",
            desc: "Làm quen và tập phát âm tên gọi của các vật dụng sinh hoạt quen thuộc xung quanh bé.",
        },
        {
            id: 5,
            type: "single",
            title: "Quyển 5: Phương tiện giao thông",
            price: "450.000đ",
            img: "/images/bia_sach/quyen5.jpg",
            desc: "Mở rộng vốn từ về các loại xe cộ, máy bay, tàu thuyền và các địa điểm công cộng.",
        },
    ];

    const filteredProducts =
        filter === "all" ? products : products.filter((p) => p.type === filter);

    return (
        <div className="max-w-4xl mx-auto pb-8 relative">
            {/* POPUP THÔNG BÁO: Chỉ hiện khi bấm nút Mua */}
            {showAlert && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-200 text-center max-w-sm w-full relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowAlert(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors p-1"
                        >
                            ✕
                        </button>
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                            <svg
                                className="w-7 h-7 text-slate-800"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-[18px] font-black text-slate-900 mb-2">
                            Dự án Demo
                        </h3>
                        <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
                            Nền tảng này hiện chỉ tập trung thử nghiệm tính năng
                            AI Tư vấn và Sàng lọc M-CHAT-R. <br />
                            <b className="text-slate-900">
                                Sản phẩm học liệu chưa được mở bán.
                            </b>
                        </p>
                        <button
                            onClick={() => setShowAlert(false)}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}

            {/* Thanh Tabs Bộ Lọc */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 md:px-6 py-2 rounded-full text-[13px] md:text-[14px] font-bold transition-all ${filter === "all" ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-900 hover:text-slate-900"}`}
                >
                    Tất cả sản phẩm
                </button>
                <button
                    onClick={() => setFilter("combo")}
                    className={`px-4 md:px-6 py-2 rounded-full text-[13px] md:text-[14px] font-bold transition-all ${filter === "combo" ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-900 hover:text-slate-900"}`}
                >
                    Trọn bộ (Ưu đãi)
                </button>
                <button
                    onClick={() => setFilter("single")}
                    className={`px-4 md:px-6 py-2 rounded-full text-[13px] md:text-[14px] font-bold transition-all ${filter === "single" ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-900 hover:text-slate-900"}`}
                >
                    Mua lẻ quyển
                </button>
            </div>

            <p className="text-center text-[13px] text-slate-500 mb-4">
                Đang hiển thị{" "}
                <span className="font-bold text-slate-900">
                    {filteredProducts.length}
                </span>{" "}
                sản phẩm
            </p>

            {/* Grid Sản phẩm */}
            <div className="flex flex-col gap-5">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow group"
                    >
                        <div
                            className={`relative w-full sm:w-55 md:w-65 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50 overflow-hidden ${product.id === "combo" ? "" : "flex items-center justify-center p-4"}`}
                        >
                            {product.id === "combo" && product.images ? (
                                <div className="w-full aspect-4/3 sm:h-full flex group/combo cursor-pointer bg-slate-200">
                                    {product.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-1 h-full bg-cover bg-center transition-all duration-300 ease-out border-r border-white/30 last:border-r-0 hover:flex-[2.5]"
                                            style={{
                                                backgroundImage: `url(${img})`,
                                            }}
                                        >
                                            <div className="w-full h-full bg-black/10 hover:bg-transparent transition-colors"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <img
                                    src={product.img}
                                    alt={product.title}
                                    className="w-full aspect-4/3 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                                />
                            )}

                            {product.tag && (
                                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-md shadow-sm z-10">
                                    {product.tag}
                                </span>
                            )}
                        </div>

                        <div className="p-4 md:p-6 flex flex-col flex-1 justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-[16px] md:text-[18px] leading-snug mb-2 line-clamp-2">
                                    {product.title}
                                </h3>
                                <p className="text-[13px] md:text-[14px] text-slate-600 line-clamp-2 md:line-clamp-3 mb-4">
                                    {product.desc}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-auto">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-900 text-[20px] md:text-[24px] leading-none">
                                        {product.price}
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-[13px] md:text-[14px] text-slate-400 line-through">
                                            {product.oldPrice}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowAlert(true)}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold text-[14px] rounded-xl hover:bg-slate-800 transition-colors active:scale-95 whitespace-nowrap"
                                >
                                    Mua
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
