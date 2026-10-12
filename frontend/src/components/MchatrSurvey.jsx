import { useState } from "react";
import { MCHATR_QUESTIONS, REVERSE_SCORED_INDEXES } from "../data/mchatr";

export default function MchatrSurvey() {
    const [step, setStep] = useState("info");

    const [userInfo, setUserInfo] = useState({
        childName: "",
        gender: "Nam",
        dob: "",
        age: "",
        address: "",
        evaluator: "Mẹ",
        evaluatorOther: "",
    });

    const [dob, setDob] = useState({ day: "", month: "", year: "" });
    const [dobError, setDobError] = useState("");

    const [answers, setAnswers] = useState(Array(20).fill(null));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const [isTransitioning, setIsTransitioning] = useState(false);

    // ==========================================
    // KHỞI TẠO STATE LƯU LỊCH SỬ TRÊN TRÌNH DUYỆT
    // ==========================================
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem("mchatr_history");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // ==========================================
    // LOGIC XỬ LÝ NHẬP NGÀY SINH
    // ==========================================
    const handleDobChange = (field, value) => {
        const numericValue = value.replace(/\D/g, "");
        const maxLength = field === "year" ? 4 : 2;
        let truncatedValue = numericValue.slice(0, maxLength);

        if (field === "day" && parseInt(truncatedValue, 10) > 31)
            truncatedValue = "31";
        if (field === "month" && parseInt(truncatedValue, 10) > 12)
            truncatedValue = "12";

        const newDob = { ...dob, [field]: truncatedValue };
        setDob(newDob);

        if (field === "day" && truncatedValue.length === 2) {
            document.getElementById("dob-month")?.focus();
        } else if (field === "month" && truncatedValue.length === 2) {
            document.getElementById("dob-year")?.focus();
        }

        validateDateObj(newDob);
    };

    const validateDateObj = ({ day, month, year }) => {
        setUserInfo((prev) => ({ ...prev, dob: "", age: "" }));

        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        if (day && (d < 1 || d > 31)) {
            setDobError("Ngày không hợp lệ.");
            return;
        }
        if (month && (m < 1 || m > 12)) {
            setDobError("Tháng không hợp lệ.");
            return;
        }

        const today = new Date();
        const minValidDate = new Date(
            today.getFullYear(),
            today.getMonth() - 30,
            today.getDate(),
        );
        const maxValidDate = new Date(
            today.getFullYear(),
            today.getMonth() - 16,
            today.getDate(),
        );
        const minYear = minValidDate.getFullYear();
        const maxYear = maxValidDate.getFullYear();

        if (year.length === 4) {
            if (y < minYear || y > maxYear) {
                setDobError(
                    `Phần mềm chỉ áp dụng cho trẻ 16-30 tháng tuổi (tương đương sinh năm ${minYear} đến ${maxYear}).`,
                );
                return;
            }
        }

        if (day && month) {
            const checkYear = year.length === 4 ? y : 2024;
            const daysInMonth = new Date(checkYear, m, 0).getDate();

            if (d > daysInMonth) {
                if (year.length === 4) {
                    setDobError(
                        `Tháng ${m} năm ${y} chỉ có ${daysInMonth} ngày.`,
                    );
                } else {
                    setDobError(
                        `Tháng ${m} chỉ có tối đa ${daysInMonth} ngày.`,
                    );
                }
                return;
            }
        }

        if (!day || !month || year.length < 4) {
            setDobError("");
            return;
        }

        const inputDate = new Date(y, m - 1, d);
        if (inputDate > today) {
            setDobError("Ngày sinh không được lớn hơn thời gian hiện tại.");
            return;
        }

        let months = (today.getFullYear() - y) * 12;
        months -= m - 1;
        months += today.getMonth();

        if (today.getDate() < d) {
            months--;
        }

        const isoDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        if (months < 16 || months > 30) {
            setDobError(
                `Bé đang ${months} tháng tuổi. Bài Test này chỉ áp dụng đúng chuẩn cho trẻ từ 16 - 30 tháng.`,
            );
            setUserInfo((prev) => ({ ...prev, dob: isoDate, age: months }));
            return;
        }

        setDobError("");
        setUserInfo((prev) => ({ ...prev, dob: isoDate, age: months }));
    };

    // ==========================================
    // LOGIC CÁC NÚT ĐIỀU HƯỚNG
    // ==========================================
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const startSurvey = (e) => {
        e.preventDefault();

        if (!userInfo.childName.trim()) {
            alert("Vui lòng nhập họ tên trẻ!");
            return;
        }
        if (!userInfo.dob || userInfo.age === "") {
            setDobError("Vui lòng nhập đầy đủ Ngày/Tháng/Năm sinh.");
            return;
        }
        if (dobError) return;
        if (userInfo.evaluator === "Khác" && !userInfo.evaluatorOther.trim()) {
            alert(
                "Vui lòng nhập rõ người đánh giá là ai (Ví dụ: Ông, Bà, Cô giáo...)!",
            );
            return;
        }

        setStep("survey");
    };

    const handleAnswer = (value) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        const newAnswers = [...answers];
        newAnswers[currentIndex] = value;
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentIndex < 19) {
                setCurrentIndex(currentIndex + 1);
            } else {
                finishTest(newAnswers);
            }
            setIsTransitioning(false);
        }, 300);
    };

    const goBack = () => {
        if (isTransitioning) return;

        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setAnswers(Array(20).fill(null));
            setStep("info");
        }
    };

    const finishTest = (finalAnswers) => {
        let score = 0;
        finalAnswers.forEach((ans, index) => {
            const isReverse = REVERSE_SCORED_INDEXES.includes(index);
            if (isReverse) {
                if (ans === true) score += 1;
            } else {
                if (ans === false) score += 1;
            }
        });

        let interpretation;
        let riskLevel;
        if (score <= 2) {
            interpretation =
                "Khả năng thấp. Tiếp tục theo dõi phát triển. Nếu trẻ dưới 24 tháng, sàng lọc lại sau sinh nhật 2 tuổi.";
            riskLevel = "low";
        } else if (score <= 7) {
            interpretation =
                "Khả năng trung bình. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm.";
            riskLevel = "medium";
        } else {
            interpretation =
                "Khả năng cao. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm.";
            riskLevel = "high";
        }

        const newResult = { score, interpretation, riskLevel };

        // Lưu bản ghi vào LocalStorage
        const record = {
            id: Date.now(),
            date: new Date().toLocaleDateString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            userInfo: { ...userInfo },
            answers: finalAnswers,
            result: newResult,
        };

        const updatedHistory = [record, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("mchatr_history", JSON.stringify(updatedHistory));

        setResult(newResult);
        setStep("result");
    };

    const resetSurvey = () => {
        setAnswers(Array(20).fill(null));
        setCurrentIndex(0);
        setResult(null);
        setStep("info");
    };

    // ==========================================
    // XỬ LÝ XUẤT FILE Ở CLIENT-SIDE
    // ==========================================
    const exportDocx = () => {
        setIsExporting(true);
        try {
            const currentDateVN = new Date().toLocaleDateString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
            });

            const evaluatorText =
                userInfo.evaluator === "Khác"
                    ? userInfo.evaluatorOther
                    : userInfo.evaluator;

            let questionsHtml = "";
            MCHATR_QUESTIONS.forEach((q, index) => {
                const isYes = answers[index] === true ? "X" : "";
                const isNo = answers[index] === false ? "X" : "";
                const exampleText = q.example ? `<br/><i>${q.example}</i>` : "";

                questionsHtml += `
                    <tr>
                        <td style="border: 1px solid black; padding: 6px; font-size: 14pt;">${index + 1}. ${q.question}${exampleText}</td>
                        <td style="border: 1px solid black; padding: 6px; text-align: center; font-size: 14pt;">${isYes}</td>
                        <td style="border: 1px solid black; padding: 6px; text-align: center; font-size: 14pt;">${isNo}</td>
                    </tr>
                `;
            });

            // Xác định mức độ nguy cơ để in ra file
            let riskTitleFile = "";
            if (result.riskLevel === "low") {
                riskTitleFile = "Nguy cơ thấp";
            } else if (result.riskLevel === "medium") {
                riskTitleFile = "Nguy cơ trung bình";
            } else {
                riskTitleFile = "Nguy cơ cao";
            }

            const htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body, table, p, h2, h3, h4, th, td, span, b, i { font-family: 'Times New Roman', serif !important; font-size: 14pt; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                        h2, h3 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h2 style="text-align: center; font-size: 16pt;">KIỂM SÀNG LỌC RỐI LOẠN PHỔ TỰ KỶ Ở TRẺ NHỎ<br/>(KHUNG ĐÁNH GIÁ M-CHAT-R)<br/><span style="font-size: 14pt; font-weight: normal;">(Dành cho trẻ từ 16 đến 30 tháng tuổi)</span></h2>
                    
                    <p><b>Họ tên trẻ:</b> ${userInfo.childName} &nbsp;&nbsp;&nbsp;&nbsp; <b>Nam/Nữ:</b> ${userInfo.gender}</p>
                    <p><b>Ngày sinh:</b> ${userInfo.dob} &nbsp;&nbsp;&nbsp;&nbsp; <b>Tuổi:</b> ${userInfo.age} tháng</p>
                    <p><b>Địa chỉ:</b> ${userInfo.address || "................................................................"}</p>
                    <p><b>Ngày đánh giá:</b> ${currentDateVN}</p>
                    <p><b>Người đánh giá:</b> ${evaluatorText}</p>
                    
                    <hr/>
                    <h3 style="text-align: left; font-size: 15pt; text-transform: uppercase;">KẾT QUẢ ĐÁNH GIÁ SƠ BỘ</h3>
                    <p><b>Tổng điểm M-CHAT-R:</b> ${result.score} / 20 điểm</p>
                    <p><b>Mức độ:</b> <span style="font-weight: bold; text-transform: uppercase;">${riskTitleFile}</span></p>
                    <p><b>Kết luận sơ bộ:</b> ${result.interpretation}</p>
                    <p><i>(Vui lòng lướt xuống để xem chi tiết từng câu trả lời và bảng hướng dẫn chấm điểm bên dưới)</i></p>
                    <hr/>
                    <br/>

                    <p><i>Bạn hãy trả lời các câu hỏi dưới đây về những hành vi có thể gặp ở con mình. Nếu hành vi nào xảy ra rất ít khi (chỉ thấy 1-2 lần) thì coi như không có.</i></p>

                    <table>
                        <tr>
                            <th style="width: 70%; font-size: 14pt;">Câu hỏi</th>
                            <th style="width: 15%; text-align: center; font-size: 14pt;">Có</th>
                            <th style="width: 15%; text-align: center; font-size: 14pt;">Không</th>
                        </tr>
                        ${questionsHtml}
                    </table>

                    <br/>
                    <h3 style="text-align: left; font-size: 14pt; text-transform: uppercase;">HƯỚNG DẪN CHẤM ĐIỂM VÀ DIỄN GIẢI KẾT QUẢ</h3>
                    <p><b>Lưu ý quan trọng:</b> M-CHAT-R là công cụ sàng lọc, không phải công cụ chẩn đoán rối loạn phổ tự kỷ. Kết quả cần được xem cùng với quá trình theo dõi phát triển và các lo ngại của gia đình/người chăm sóc.</p>
                    
                    <p><b>BƯỚC 1. Xác định câu trả lời có dấu hiệu nguy cơ</b></p>
                    <table>
                        <tr>
                            <th style="font-size: 14pt;">Nhóm câu</th>
                            <th style="text-align: center; font-size: 14pt;">Tính 1 điểm</th>
                            <th style="text-align: center; font-size: 14pt;">Tính 0 điểm</th>
                        </tr>
                        <tr>
                            <td style="font-size: 14pt;">Câu 1, 3, 4, 6–11, 13–20</td>
                            <td style="text-align: center; font-size: 14pt;">KHÔNG</td>
                            <td style="text-align: center; font-size: 14pt;">CÓ</td>
                        </tr>
                        <tr>
                            <td style="font-size: 14pt;">Câu 2, 5, 12</td>
                            <td style="text-align: center; font-size: 14pt;">CÓ</td>
                            <td style="text-align: center; font-size: 14pt;">KHÔNG</td>
                        </tr>
                    </table>

                    <p><b>BƯỚC 2. Đối chiếu kết quả</b></p>
                    <table>
                        <tr>
                            <th style="width: 20%; font-size: 14pt;">Tổng điểm</th>
                            <th style="font-size: 14pt;">Hiển thị câu trả lời</th>
                        </tr>
                        <tr>
                            <td style="text-align: center; font-weight: bold; font-size: 14pt;">0–2</td>
                            <td style="font-size: 14pt;">Khả năng thấp. Tiếp tục theo dõi phát triển. Nếu trẻ dưới 24 tháng, sàng lọc lại sau sinh nhật 2 tuổi. Nếu vẫn có lo ngại về phát triển, nên trao đổi với nhân viên y tế</td>
                        </tr>
                        <tr>
                            <td style="text-align: center; font-weight: bold; font-size: 14pt;">3–7</td>
                            <td style="font-size: 14pt;">Khả năng trung bình. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm.</td>
                        </tr>
                        <tr>
                            <td style="text-align: center; font-weight: bold; font-size: 14pt;">8–20</td>
                            <td style="font-size: 14pt;">Khả năng cao. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm.</td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

            const formatFileName = (str) => {
                return str
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d")
                    .replace(/Đ/g, "D")
                    .replace(/\s+/g, "");
            };

            const safeName = formatFileName(userInfo.childName);
            const fileName = `Ketquadanhgiacuachau${safeName}.doc`;

            const blob = new Blob(["\ufeff", htmlContent], {
                type: "application/msword",
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Lỗi xuất file:", error);
            alert("Đã có lỗi xảy ra trong quá trình xuất file nội bộ.");
        } finally {
            setIsExporting(false);
        }
    };

    // ==========================================
    // MÀN HÌNH 1: ĐIỀN THÔNG TIN VÀ LỊCH SỬ
    // ==========================================
    if (step === "info") {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white px-6 py-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-center mb-6">
                        <h2 className="text-[20px] md:text-sub font-black text-slate-900">
                            Thông Tin Đánh Giá
                        </h2>
                        <p className="text-[13px] text-slate-600 font-semibold mt-1">
                            Dành cho trẻ từ 16 đến 30 tháng tuổi
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-[13px] md:text-[14px] text-slate-700 leading-relaxed text-justify md:text-left">
                        <span className="font-bold text-slate-900">
                            M-CHAT-R (Modified Checklist for Autism in Toddlers
                            – Revised)
                        </span>{" "}
                        là công cụ sàng lọc nguy cơ rối loạn phổ tự kỷ (ASD)
                        dành cho trẻ từ 16 đến 30 tháng tuổi. Công cụ này bao
                        gồm{" "}
                        <span className="font-bold text-slate-900">
                            20 câu hỏi đơn giản
                        </span>
                        , giúp cha mẹ và người chăm sóc nhận diện các dấu hiệu
                        tự kỷ. M-CHAT-R được phát triển bởi Tiến sĩ Diana Robins
                        và cộng sự, và hiện được sử dụng rộng rãi trên toàn thế
                        giới. Mục đích của M-CHAT-R là phát hiện sớm nguy cơ rối
                        loạn tự kỷ để có thể can thiệp kịp thời và hiệu quả.
                    </div>

                    <form onSubmit={startSurvey} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-bold text-slate-900 mb-1">
                                    Họ tên trẻ (*)
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="childName"
                                    value={userInfo.childName}
                                    onChange={handleInfoChange}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:border-slate-900 outline-none"
                                    placeholder="Nhập tên bé..."
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-slate-900 mb-1">
                                    Giới tính
                                </label>
                                <select
                                    name="gender"
                                    value={userInfo.gender}
                                    onChange={handleInfoChange}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:border-slate-900 outline-none bg-white"
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-slate-900 mb-1">
                                    Ngày sinh (*)
                                </label>
                                <div
                                    className={`flex items-center gap-2 p-1 bg-white border rounded-lg transition-colors ${dobError ? "border-red-500 focus-within:border-red-600" : "border-slate-300 focus-within:border-slate-900"}`}
                                >
                                    <input
                                        id="dob-day"
                                        type="text"
                                        value={dob.day}
                                        onChange={(e) =>
                                            handleDobChange(
                                                "day",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full min-w-[40px] p-1.5 text-center text-slate-900 outline-none bg-transparent placeholder-slate-400 font-medium"
                                        placeholder="Ngày"
                                    />
                                    <span className="text-slate-400 font-light text-[18px]">
                                        /
                                    </span>
                                    <input
                                        id="dob-month"
                                        type="text"
                                        value={dob.month}
                                        onChange={(e) =>
                                            handleDobChange(
                                                "month",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full min-w-[40px] p-1.5 text-center text-slate-900 outline-none bg-transparent placeholder-slate-400 font-medium"
                                        placeholder="Tháng"
                                    />
                                    <span className="text-slate-400 font-light text-[18px]">
                                        /
                                    </span>
                                    <input
                                        id="dob-year"
                                        type="text"
                                        value={dob.year}
                                        onChange={(e) =>
                                            handleDobChange(
                                                "year",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full min-w-[60px] p-1.5 text-center text-slate-900 outline-none bg-transparent placeholder-slate-400 font-medium"
                                        placeholder="Năm"
                                    />
                                </div>
                                {dobError && (
                                    <p className="text-red-600 text-[12px] font-bold mt-1.5 leading-snug">
                                        {dobError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-slate-900 mb-1">
                                    Tuổi (Tháng)
                                </label>
                                <div
                                    className={`w-full p-2.5 border rounded-lg flex items-center ${dobError ? "bg-red-50 border-red-200 text-red-600 font-bold" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                                >
                                    {userInfo.age !== ""
                                        ? `${userInfo.age} tháng tuổi`
                                        : "Tự động tính toán"}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-slate-900 mb-1">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={userInfo.address}
                                onChange={handleInfoChange}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:border-slate-900 outline-none"
                                placeholder="Nhập địa chỉ... (Không bắt buộc)"
                            />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-[13px] font-bold text-slate-900 mb-3">
                                Người đánh giá (*)
                            </label>
                            <div className="flex flex-wrap gap-4 mb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="evaluator"
                                        value="Mẹ"
                                        checked={userInfo.evaluator === "Mẹ"}
                                        onChange={handleInfoChange}
                                        className="w-4 h-4 text-slate-900 accent-slate-900"
                                    />
                                    <span className="text-[14px] font-medium text-slate-900">
                                        Mẹ
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="evaluator"
                                        value="Bố"
                                        checked={userInfo.evaluator === "Bố"}
                                        onChange={handleInfoChange}
                                        className="w-4 h-4 text-slate-900 accent-slate-900"
                                    />
                                    <span className="text-[14px] font-medium text-slate-900">
                                        Bố
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="evaluator"
                                        value="Khác"
                                        checked={userInfo.evaluator === "Khác"}
                                        onChange={handleInfoChange}
                                        className="w-4 h-4 text-slate-900 accent-slate-900"
                                    />
                                    <span className="text-[14px] font-medium text-slate-900">
                                        Khác (Nhập riêng)
                                    </span>
                                </label>
                            </div>
                            {userInfo.evaluator === "Khác" && (
                                <input
                                    type="text"
                                    name="evaluatorOther"
                                    value={userInfo.evaluatorOther}
                                    onChange={handleInfoChange}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:border-slate-900 outline-none bg-white"
                                    placeholder="Nhập rõ người đánh giá là ai (Ông, Bà, Cô giáo...)"
                                />
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                !!dobError ||
                                !dob.day ||
                                !dob.month ||
                                dob.year.length < 4
                            }
                            className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl mt-4 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Bắt đầu làm Test
                        </button>
                    </form>
                </div>

                {/* KHU VỰC LỊCH SỬ ĐÁNH GIÁ (Render khi có dữ liệu) */}
                {history.length > 0 && (
                    <div className="mt-8 pt-8">
                        <div className="flex justify-between items-center mb-5 px-2">
                            <h3 className="text-[16px] md:text-[18px] font-bold text-slate-900">
                                Lịch sử đánh giá
                            </h3>
                            <button
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            "Bạn có chắc muốn xóa toàn bộ lịch sử?",
                                        )
                                    ) {
                                        setHistory([]);
                                        localStorage.removeItem(
                                            "mchatr_history",
                                        );
                                    }
                                }}
                                className="text-[13px] font-medium text-slate-500 hover:text-red-600 transition-colors"
                            >
                                Xóa tất cả
                            </button>
                        </div>

                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-4 md:px-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                                >
                                    <div>
                                        <p className="font-bold text-[15px] text-slate-900 mb-0.5">
                                            Bé: {item.userInfo.childName}
                                        </p>
                                        <p className="text-[12px] text-slate-500">
                                            {item.date} • {item.userInfo.age}{" "}
                                            tháng tuổi
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                                        <div className="text-left sm:text-right">
                                            <p className="font-bold text-[16px] text-slate-900">
                                                {item.result.score} / 20 điểm
                                            </p>
                                            <p className="text-[12px] text-slate-600 font-medium">
                                                {item.result.riskLevel === "low"
                                                    ? "Nguy cơ thấp"
                                                    : item.result.riskLevel ===
                                                        "medium"
                                                      ? "Nguy cơ trung bình"
                                                      : "Nguy cơ cao"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setUserInfo(item.userInfo);
                                                    if (item.userInfo.dob) {
                                                        const [y, m, d] =
                                                            item.userInfo.dob.split(
                                                                "-",
                                                            );
                                                        setDob({
                                                            day: d,
                                                            month: m,
                                                            year: y,
                                                        });
                                                    }
                                                    setAnswers(item.answers);
                                                    setResult(item.result);
                                                    setStep("result");
                                                }}
                                                className="px-4 py-2 bg-slate-100 text-slate-800 border border-slate-200 text-[13px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                            >
                                                Xem
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newHistory =
                                                        history.filter(
                                                            (h) =>
                                                                h.id !==
                                                                item.id,
                                                        );
                                                    setHistory(newHistory);
                                                    localStorage.setItem(
                                                        "mchatr_history",
                                                        JSON.stringify(
                                                            newHistory,
                                                        ),
                                                    );
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Xóa bài test này"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // MÀN HÌNH 2: LÀM TEST M-CHAT-R
    // ==========================================
    if (step === "survey") {
        const progressPercentage = (currentIndex / 20) * 100;
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[480px] md:h-[520px]">
                <div className="bg-slate-50 border-b border-slate-200 px-5 md:px-6 py-4 shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-[13px] md:text-[14px] font-bold text-slate-600">
                            Câu hỏi {currentIndex + 1} / 20
                        </h2>
                        <span className="text-[11px] md:text-[12px] font-medium text-slate-800 bg-slate-200 px-2 py-1 rounded">
                            Bé: {userInfo.childName}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                        <div
                            className="bg-slate-800 h-1.5 md:h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div
                    key={currentIndex}
                    className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center overflow-y-auto"
                >
                    <p className="text-[18px] md:text-[22px] font-bold text-slate-900 leading-snug">
                        {MCHATR_QUESTIONS[currentIndex].question}
                    </p>
                    {MCHATR_QUESTIONS[currentIndex].example && (
                        <p className="text-[14px] md:text-[15px] text-slate-600 italic mt-4 max-w-[90%] leading-relaxed">
                            {MCHATR_QUESTIONS[currentIndex].example}
                        </p>
                    )}
                </div>

                <div className="p-5 md:p-8 flex flex-col gap-4 shrink-0 bg-white border-t border-slate-100">
                    <div className="flex gap-3 md:gap-4">
                        <button
                            disabled={isTransitioning}
                            onClick={() => handleAnswer(true)}
                            className={`flex-1 py-4 md:py-5 rounded-xl text-[15px] md:text-[18px] font-bold transition-all border-2 disabled:opacity-80 disabled:cursor-wait ${answers[currentIndex] === true ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:bg-slate-50"}`}
                        >
                            Có
                        </button>
                        <button
                            disabled={isTransitioning}
                            onClick={() => handleAnswer(false)}
                            className={`flex-1 py-4 md:py-5 rounded-xl text-[15px] md:text-[18px] font-bold transition-all border-2 disabled:opacity-80 disabled:cursor-wait ${answers[currentIndex] === false ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:bg-slate-50"}`}
                        >
                            Không
                        </button>
                    </div>

                    <div className="h-6 md:h-8 flex justify-center items-center mt-1">
                        <button
                            disabled={isTransitioning}
                            onClick={goBack}
                            className="text-[13px] md:text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
                        >
                            <span>←</span>{" "}
                            {currentIndex > 0
                                ? "Quay lại câu trước"
                                : "Quay lại sửa thông tin bé"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // MÀN HÌNH 3: KẾT QUẢ VÀ KHUNG ĐIỂM
    // ==========================================
    if (step === "result" && result) {
        let riskTitle = "";
        let riskColorClass = "";

        if (result.riskLevel === "low") {
            riskTitle = "Nguy cơ thấp";
            riskColorClass = "bg-white border-slate-300 text-slate-900";
        } else if (result.riskLevel === "medium") {
            riskTitle = "Nguy cơ trung bình";
            riskColorClass = "bg-white border-slate-300 text-slate-900";
        } else {
            riskTitle = "Nguy cơ cao";
            // Highlight riêng khối kết quả nguy cơ cao (nếu muốn nhấn mạnh cảnh báo)
            riskColorClass = "bg-white border-slate-300 text-slate-900";
        }

        return (
            <div className="max-w-3xl mx-auto space-y-6 pb-6">
                <div className="bg-white px-6 py-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="text-center mb-6">
                        <h2 className="text-[20px] md:text-sub font-black text-slate-900 mb-4">
                            Kết quả sàng lọc của bé {userInfo.childName}
                        </h2>
                        <div className="inline-flex flex-col items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full border-8 border-slate-200 bg-slate-50 shrink-0">
                            <span className="text-[36px] md:text-[56px] font-black text-slate-900 leading-none">
                                {result.score}
                            </span>
                            <span className="text-[12px] md:text-body font-bold text-slate-500">
                                / 20 điểm
                            </span>
                        </div>
                    </div>

                    <div
                        className={`p-5 rounded-xl border text-center shadow-sm mb-6 ${riskColorClass}`}
                    >
                        <h3 className="font-bold text-[18px] md:text-[20px] mb-2">
                            {riskTitle}
                        </h3>
                        <p className="text-[14px] md:text-[15px] leading-relaxed">
                            {result.interpretation}
                        </p>
                    </div>

                    {/* Lưu ý quan trọng - Thêm màu đỏ cảnh báo */}
                    <div className="bg-red-50 p-4 md:p-5 rounded-xl border border-red-200 mb-8 text-left">
                        <p className="text-[13px] md:text-[14px] text-red-800 leading-relaxed">
                            <span className="font-bold">Lưu ý quan trọng:</span>{" "}
                            M-CHAT-R là công cụ sàng lọc, không phải công cụ
                            chẩn đoán rối loạn phổ tự kỷ. Kết quả cần được xem
                            cùng với quá trình theo dõi phát triển và các lo
                            ngại của gia đình/người chăm sóc.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row w-full gap-3 pt-4 border-t border-slate-200">
                        <button
                            onClick={resetSurvey}
                            className="flex-1 py-3.5 md:py-4 bg-white border border-slate-300 text-slate-800 text-[15px] md:text-[16px] font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            Khảo sát lại
                        </button>
                        <button
                            onClick={exportDocx}
                            disabled={isExporting}
                            className="flex-1 py-3.5 md:py-4 bg-slate-900 text-white text-[15px] md:text-[16px] font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isExporting ? "Đang xuất..." : "Xuất tệp DOCX"}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-6 md:p-8 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-[16px] md:text-[18px] text-slate-900 border-b border-slate-300 pb-3 mb-5">
                        Phần tham khảo: Chi tiết cách tính điểm M-CHAT-R
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <p className="font-bold text-[14px] md:text-[15px] text-slate-900 mb-2">
                                BƯỚC 1. Xác định câu trả lời có dấu hiệu nguy cơ
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-[13px] md:text-[14px] text-slate-700">
                                <li>
                                    <span className="font-semibold text-slate-900">
                                        Câu 1, 3, 4, 6–11, 13–20:
                                    </span>{" "}
                                    Tính{" "}
                                    <span className="font-bold text-slate-900">
                                        1 điểm
                                    </span>{" "}
                                    nếu trả lời KHÔNG.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-900">
                                        Câu 2, 5, 12:
                                    </span>{" "}
                                    Tính{" "}
                                    <span className="font-bold text-slate-900">
                                        1 điểm
                                    </span>{" "}
                                    nếu trả lời CÓ.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold text-[14px] md:text-[15px] text-slate-900 mb-3">
                                BƯỚC 2. Phân loại mức độ theo tổng điểm
                            </p>
                            <div className="space-y-2.5 text-[13px] md:text-[14px]">
                                <div className="p-4 rounded-xl border bg-white border-slate-200">
                                    <p className="font-bold text-slate-900 mb-1">
                                        0–2 điểm: Khả năng thấp
                                    </p>
                                    <p className="text-slate-600">
                                        Tiếp tục theo dõi phát triển. Nếu trẻ
                                        dưới 24 tháng, sàng lọc lại sau sinh
                                        nhật 2 tuổi.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border bg-white border-slate-200">
                                    <p className="font-bold text-slate-900 mb-1">
                                        3–7 điểm: Khả năng trung bình
                                    </p>
                                    <p className="text-slate-600">
                                        Cần đánh giá chẩn đoán chuyên sâu, đồng
                                        thời đánh giá nhu cầu can thiệp sớm.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border bg-white border-slate-200">
                                    <p className="font-bold text-slate-900 mb-1">
                                        8–20 điểm: Khả năng cao
                                    </p>
                                    <p className="text-slate-600">
                                        Cần đánh giá chẩn đoán chuyên sâu, đồng
                                        thời đánh giá nhu cầu can thiệp sớm.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
