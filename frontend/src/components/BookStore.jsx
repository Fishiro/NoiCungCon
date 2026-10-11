import { useState } from "react";

export default function BookStore() {
    const [filter, setFilter] = useState("all");

    const products = [
        {
            id: "combo",
            type: "combo",
            title: "Trọn Bộ 5 Quyển Thẻ Từ Vựng Cốt Lõi",
            price: "499.000đ",
            oldPrice: "850.000đ",
            img: "/images/bia_sach/quyen1.jpg",
            tag: "Tiết kiệm nhất",
            desc: "Giải pháp toàn diện gồm 5 chủ đề, giúp trẻ phát triển ngôn ngữ qua sơ đồ tư duy 6 nhánh. Phù hợp cho gia đình và phòng can thiệp.",
        },
        {
            id: 1,
            type: "single",
            title: "Quyển 1: Gia đình & Bản thân",
            price: "120.000đ",
            img: "/images/bia_sach/quyen1.jpg",
            desc: "Chủ đề gần gũi giúp bé nhận biết các thành viên trong gia đình và các bộ phận trên cơ thể.",
        },
        {
            id: 2,
            type: "single",
            title: "Quyển 2: Động vật quanh em",
            price: "120.000đ",
            img: "/images/bia_sach/quyen2.jpg",
            desc: "Khám phá thế giới động vật sinh động qua hình ảnh 3D hoạt hình AI, kích thích sự tò mò của trẻ.",
        },
        {
            id: 3,
            type: "single",
            title: "Quyển 3: Đồ ăn & Thức uống",
            price: "120.000đ",
            img: "/images/bia_sach/quyen3.jpg",
            desc: "Nhận biết các món ăn, đồ uống hàng ngày, giúp trẻ dễ dàng gọi tên các món ăn yêu thích.",
        },
        {
            id: 4,
            type: "single",
            title: "Quyển 4: Đồ dùng cá nhân",
            price: "120.000đ",
            img: "/images/bia_sach/quyen4.jpg",
            desc: "Làm quen và tập phát âm tên gọi của các vật dụng sinh hoạt quen thuộc xung quanh bé.",
        },
        {
            id: 5,
            type: "single",
            title: "Quyển 5: Phương tiện giao thông",
            price: "120.000đ",
            img: "/images/bia_sach/quyen5.jpg",
            desc: "Mở rộng vốn từ về các loại xe cộ, máy bay, tàu thuyền và các địa điểm công cộng.",
        },
    ];

    const filteredProducts =
        filter === "all" ? products : products.filter((p) => p.type === filter);

    return (
        <div className="max-w-4xl mx-auto pb-8">
            {/* Thanh Tabs Bộ Lọc Nằm Ngang */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 md:px-6 py-2 rounded-full text-[13px] md:text-[14px] font-bold transition-all ${filter === "all" ? "bg-primary text-surface shadow-md" : "bg-surface text-muted border border-slate-200 hover:border-primary hover:text-primary"}`}
                >
                    Tất cả sản phẩm
                </button>
                <button
                    onClick={() => setFilter("combo")}
                    className={`px-4 md:px-6 py-2 rounded-full text-[13px] md:text-[14px] font-bold transition-all ${filter === "combo" ? "bg-primary text-surface shadow-md" : "bg-surface text-muted border border-slate-200 hover:border-primary hover:text-primary"}`}
                >
                    Trọn bộ (Ưu đãi)
                </button>
                <button
                    onClick={() => setFilter("single")}
                    className={`px-4 md:px-6 py-2 rounded-full text-[13px] md:text-[14px] font-bold transition-all ${filter === "single" ? "bg-primary text-surface shadow-md" : "bg-surface text-muted border border-slate-200 hover:border-primary hover:text-primary"}`}
                >
                    Mua lẻ quyển
                </button>
            </div>

            {/* Thông báo số lượng */}
            <p className="text-center text-[13px] text-muted mb-4">
                Đang hiển thị{" "}
                <span className="font-bold text-dark">
                    {filteredProducts.length}
                </span>{" "}
                sản phẩm
            </p>

            {/* Grid Sản phẩm - Căn giữa, thẻ ngang */}
            <div className="flex flex-col gap-5">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-surface flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow group"
                    >
                        {/* Khu vực ảnh */}
                        <div className="relative w-full sm:w-[220px] md:w-[260px] shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50 flex items-center justify-center p-4">
                            <img
                                src={product.img}
                                alt={product.title}
                                className="w-full aspect-[4/3] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                            />
                            {product.tag && (
                                <span className="absolute top-3 left-3 px-2.5 py-1 bg-accent text-surface text-[11px] font-bold rounded-md shadow-sm z-10">
                                    {product.tag}
                                </span>
                            )}
                        </div>

                        {/* Khu vực thông tin */}
                        <div className="p-4 md:p-6 flex flex-col flex-1 justify-between">
                            <div>
                                <h3 className="font-bold text-dark text-[16px] md:text-[18px] leading-snug mb-2 line-clamp-2">
                                    {product.title}
                                </h3>
                                <p className="text-[13px] md:text-[14px] text-muted line-clamp-2 md:line-clamp-3 mb-4">
                                    {product.desc}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-auto">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-accent text-[20px] md:text-[24px] leading-none">
                                        {product.price}
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-[13px] md:text-[14px] text-muted line-through">
                                            {product.oldPrice}
                                        </span>
                                    )}
                                </div>

                                <button className="w-full sm:w-auto px-6 py-2.5 bg-primary/10 text-primary font-bold text-[14px] rounded-xl hover:bg-primary hover:text-surface transition-colors active:scale-95 whitespace-nowrap">
                                    Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
