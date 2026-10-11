import { useState } from "react";
import { MCHATR_QUESTIONS, REVERSE_SCORED_INDEXES } from "../data/mchatr";

export default function MchatrSurvey() {
    const [answers, setAnswers] = useState(Array(20).fill(null));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [result, setResult] = useState(null);

    const handleAnswer = (value) => {
        const newAnswers = [...answers];
        newAnswers[currentIndex] = value;
        setAnswers(newAnswers);

        if (currentIndex < 19) {
            setCurrentIndex(currentIndex + 1);
        } else {
            calculateScore(newAnswers);
        }
    };

    const goBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const calculateScore = (finalAnswers) => {
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
        if (score <= 2)
            interpretation =
                "Khả năng thấp. Tiếp tục theo dõi phát triển. Nếu trẻ dưới 24 tháng, sàng lọc lại sau sinh nhật 2 tuổi.";
        else if (score <= 7)
            interpretation =
                "Khả năng trung bình. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm.";
        else
            interpretation =
                "Khả năng cao. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm.";

        setResult({ score, interpretation });
    };

    const resetSurvey = () => {
        setAnswers(Array(20).fill(null));
        setCurrentIndex(0);
        setResult(null);
    };

    // MÀN HÌNH KẾT QUẢ (Khóa cứng chiều cao tương đương màn hình câu hỏi)
    if (result) {
        return (
            <div className="max-w-2xl mx-auto bg-surface px-6 py-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 text-center h-[480px] md:h-[520px] flex flex-col justify-center items-center">
                <h2 className="text-[20px] md:text-sub font-black text-dark mb-4">
                    Kết quả sàng lọc M-CHAT-R
                </h2>

                <div className="inline-flex flex-col items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full border-8 border-primary/20 bg-sky-50 mb-6 shrink-0">
                    <span className="text-[36px] md:text-[56px] font-black text-primary leading-none">
                        {result.score}
                    </span>
                    <span className="text-[12px] md:text-body font-bold text-muted">
                        / 20 điểm
                    </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 w-full">
                    <p className="text-[15px] md:text-[18px] font-bold text-dark mb-1">
                        Đánh giá:
                    </p>
                    <p className="text-[13px] md:text-[16px] text-dark/80">
                        {result.interpretation}
                    </p>
                </div>

                <p className="text-[11px] md:text-[12px] text-muted italic mb-6 px-2">
                    * Lưu ý: M-CHAT-R là công cụ sàng lọc sơ bộ tại nhà, không
                    thay thế cho chẩn đoán y khoa.
                </p>

                <button
                    onClick={resetSurvey}
                    className="w-full md:w-auto px-10 py-3.5 md:py-4 mt-auto bg-accent text-surface text-[15px] md:text-[16px] font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition-all shadow-md shrink-0"
                >
                    Thực hiện lại bài Test
                </button>
            </div>
        );
    }

    // MÀN HÌNH CÂU HỎI (Khóa cứng chiều cao h-[480px] md:h-[520px])
    const progressPercentage = (currentIndex / 20) * 100;

    return (
        <div className="max-w-2xl mx-auto bg-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[480px] md:h-[520px]">
            {/* Header & Progress Bar (Cố định) */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 md:px-6 py-4 shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[13px] md:text-[14px] font-bold text-muted">
                        Câu hỏi {currentIndex + 1} / 20
                    </h2>
                    <span className="text-[11px] md:text-[12px] font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        M-CHAT-R
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                    <div
                        className="bg-primary h-1.5 md:h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Text (Khu vực co giãn tự động) */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 text-center overflow-y-auto">
                <p className="text-[18px] md:text-[22px] font-bold text-dark leading-snug">
                    {MCHATR_QUESTIONS[currentIndex]}
                </p>
            </div>

            {/* Action Buttons (Cố định ở đáy) */}
            <div className="p-5 md:p-8 flex flex-col gap-4 shrink-0 bg-surface border-t border-slate-50">
                <div className="flex gap-3 md:gap-4">
                    <button
                        onClick={() => handleAnswer(true)}
                        className={`flex-1 py-4 md:py-5 rounded-xl text-[15px] md:text-[18px] font-bold transition-all border-2 ${answers[currentIndex] === true ? "bg-primary text-surface border-primary shadow-md" : "bg-white text-primary border-primary/30 hover:border-primary hover:bg-primary/5"}`}
                    >
                        Có
                    </button>
                    <button
                        onClick={() => handleAnswer(false)}
                        className={`flex-1 py-4 md:py-5 rounded-xl text-[15px] md:text-[18px] font-bold transition-all border-2 ${answers[currentIndex] === false ? "bg-primary text-surface border-primary shadow-md" : "bg-white text-primary border-primary/30 hover:border-primary hover:bg-primary/5"}`}
                    >
                        Không
                    </button>
                </div>

                {/* Nút Quay Lại (Dùng thẻ trống để giữ bố cục khi ở câu 1) */}
                <div className="h-6 md:h-8 flex justify-center items-center mt-1">
                    {currentIndex > 0 ? (
                        <button
                            onClick={goBack}
                            className="text-[13px] md:text-[14px] font-medium text-muted hover:text-dark transition-colors flex items-center gap-1"
                        >
                            <span>←</span> Quay lại câu trước
                        </button>
                    ) : (
                        <div className="w-full h-full"></div>
                    )}
                </div>
            </div>
        </div>
    );
}
