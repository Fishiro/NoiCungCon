import io
import os
import re
import requests

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

# =========================================================
# 1. KHOI TAO UNG DUNG
# =========================================================

load_dotenv()

app = Flask(__name__)

# Cho phep frontend goi backend.
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
    if origin.strip()
]

CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# --- Cau hinh AI: Khởi tạo cấu hình OpenRouter ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
AI_MODEL = os.getenv("AI_MODEL", "openrouter/free").strip()
SITE_URL = os.getenv("SITE_URL", "http://localhost:5173").strip()
SITE_NAME = os.getenv("SITE_NAME", "Noi Cung Con").strip()

SYSTEM_PROMPT = (
    "Bạn là một chuyên gia trị liệu ngôn ngữ trẻ em. Hãy xưng hô và tư vấn với phong thái "
    "như một bác sĩ: gần gũi, chia sẻ, ấm áp, ngắn gọn và dễ hiểu. "
    "Nhiệm vụ của bạn là tư vấn cho ba mẹ về vấn đề trẻ chậm nói, đưa ra gợi ý thực hành tại nhà "
    "và lồng ghép giới thiệu dự án của bạn: 'Bộ thẻ từ vựng cốt lõi cho trẻ chậm nói'.\n\n"

    "Thông tin về dự án: Đây là bộ học liệu tiếng Việt dành cho trẻ 2–6 tuổi, gồm 5 quyển, 100 thẻ "
    "về các chủ đề gần gũi (đồ dùng gia đình, động vật, đồ ăn và thức uống, đồ dùng cá nhân, phương tiện giao thông). "
    "Bộ thẻ sử dụng hình ảnh 3D hoạt hình AI, thiết kế theo cấu trúc bản đồ tư duy 6 nhánh "
    "(Phân loại, Hình dạng, Đặc tính, Chức năng, Câu ngắn, Câu mở rộng). Dự án giúp phụ huynh, giáo viên "
    "và chuyên viên dễ dàng hỗ trợ trẻ tập nói tại nhà, lớp học và phòng can thiệp.\n\n"

    "NGUYÊN TẮC BẮT BUỘC:\n"
    "1. Giới hạn phạm vi: Chỉ tư vấn các nội dung liên quan đến trẻ chậm nói và dự án học liệu trên. "
    "Tuyệt đối không trả lời các câu hỏi ngoài phạm vi này.\n"
    "2. Không chẩn đoán y khoa: Tuyệt đối không chẩn đoán bệnh. Khi có bất kỳ dấu hiệu nào đáng lo ngại, "
    "hãy khuyên ba mẹ đưa trẻ đi gặp bác sĩ hoặc chuyên gia trực tiếp.\n"
    "3. Giới hạn độ dài: Câu trả lời phải cực kỳ ngắn gọn, cô đọng (dưới 100 chữ). "
    "Bạn phải tự căn chỉnh nội dung để câu trả lời kết thúc trọn vẹn, tuyệt đối không được để tình trạng đang nói bị cắt ngang câu.\n"
    "4. Được phép format câu trả lời theo dạng dễ đọc nhưng không được sử dụng markdown, không dùng ký tự đặc biệt."
)

# =========================================================
# 2. HEALTH CHECK CHO RENDER
# =========================================================


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

# =========================================================
# 3. API CHAT AI (Sử dụng OpenRouter)
# =========================================================


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Dữ liệu gửi lên không hợp lệ."}), 400

    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "Vui lòng nhập nội dung cần tư vấn."}), 400

    if not OPENROUTER_API_KEY:
        return jsonify({"error": "Backend chưa được cấu hình OPENROUTER_API_KEY."}), 503

    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": SITE_URL,
            "X-Title": SITE_NAME,
            "Content-Type": "application/json",
        }

        payload = {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message.strip()}
            ],
            "max_tokens": 120  # Giới hạn số token trả về giống với src cũ
        }

        # Gọi API OpenRouter
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if not response.ok:
            error_data = response.json()
            app.logger.error(f"OpenRouter API Error: {error_data}")

            error_str = str(error_data).lower()
            if "429" in error_str or "quota" in error_str or "rate limit" in error_str:
                return jsonify({"error": "Hệ thống đang quá tải, vui lòng thử lại sau ít phút."}), 429

            return jsonify({"error": "Lỗi kết nối đến dịch vụ AI."}), 502

        response_data = response.json()
        ai_reply = response_data.get("choices", [{}])[0].get(
            "message", {}).get("content", "")

        # Trả về theo cấu trúc cũ mà Frontend đang sử dụng
        return jsonify({
            "choices": [
                {
                    "message": {
                        "content": ai_reply
                    }
                }
            ]
        }), 200

    except Exception as exc:
        app.logger.exception("Lỗi khi gọi API tư vấn AI (OpenRouter)")
        return jsonify({"error": "Không thể xử lý yêu cầu tư vấn lúc này."}), 502

# =========================================================
# 4. XUAT KET QUA M-CHAT-R THANH FILE WORD
# =========================================================


@app.post("/api/export-mchatr")
def export_mchatr():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Dữ liệu xuất báo cáo không hợp lệ."}), 400

    user_info = data.get("userInfo", {})
    answers = data.get("answers", [])
    score = data.get("score", 0)
    interpretation = data.get("interpretation", "")
    questions = data.get("questions", [])

    if not isinstance(user_info, dict):
        user_info = {}
    if not isinstance(answers, list):
        answers = []
    if not isinstance(questions, list):
        questions = []

    doc = Document()

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run(
        "KIỂM SÀNG LỌC RỐI LOẠN PHỔ TỰ KỶ Ở TRẺ NHỎ\n"
        "(KHUNG ĐÁNH GIÁ M-CHAT-R)\n"
        "(Dành cho trẻ từ 16 đến 30 tháng tuổi)"
    )
    run.bold = True
    run.font.size = Pt(14)

    doc.add_paragraph(
        f"Họ tên trẻ: {user_info.get('childName', '')}"
        f"\t\tGiới tính (Nam/Nữ): {user_info.get('gender', '')}"
    )
    doc.add_paragraph(
        f"Ngày sinh: {user_info.get('dob', '')}\t\tTuổi: {user_info.get('age', '')}"
    )
    doc.add_paragraph(f"Địa chỉ: {user_info.get('address', '')}")
    doc.add_paragraph(f"Ngày đánh giá: {user_info.get('evalDate', '')}")

    evaluator = user_info.get("evaluator", "")
    if evaluator == "Khác":
        evaluator = f"Người chăm sóc khác: {user_info.get('evaluatorOther', '')}"
    doc.add_paragraph(f"Người đánh giá: {evaluator}")

    doc.add_paragraph(
        "Bạn hãy trả lời các câu hỏi dưới đây về những hành vi có thể gặp ở con mình. "
        "Nếu hành vi nào xảy ra rất ít khi (chỉ thấy 1-2 lần) thì coi như không có."
    )

    table = doc.add_table(rows=1, cols=3)
    table.style = "Table Grid"
    headers = table.rows[0].cells
    headers[0].text = "Câu hỏi"
    headers[1].text = "Có"
    headers[2].text = "Không"

    for index, question_obj in enumerate(questions):
        if not isinstance(question_obj, dict):
            continue

        cells = table.add_row().cells
        full_question = f"{index + 1}. {question_obj.get('question', '')}"
        example_text = question_obj.get("example", "")
        if example_text:
            full_question += f" {example_text}"
        cells[0].text = full_question

        answer = answers[index] if index < len(answers) else None
        cells[1].text = "X" if answer is True else ""
        cells[2].text = "X" if answer is False else ""

    heading = doc.add_paragraph()
    heading.add_run("\nHƯỚNG DẪN CHẤM ĐIỂM VÀ DIỄN GIẢI KẾT QUẢ").bold = True

    doc.add_paragraph(
        "Lưu ý quan trọng: M-CHAT-R là công cụ sàng lọc, không phải công cụ chẩn đoán "
        "rối loạn phổ tự kỷ. Kết quả cần được xem cùng với quá trình theo dõi phát triển "
        "và các lo ngại của gia đình/người chăm sóc."
    )

    step1 = doc.add_paragraph()
    step1.add_run(
        "BƯỚC 1. Xác định câu trả lời có dấu hiệu nguy cơ").bold = True

    scoring_table = doc.add_table(rows=3, cols=3)
    scoring_table.style = "Table Grid"
    scoring_table.rows[0].cells[0].text = "Nhóm câu"
    scoring_table.rows[0].cells[1].text = "Tính 1 điểm"
    scoring_table.rows[0].cells[2].text = "Tính 0 điểm"
    scoring_table.rows[1].cells[0].text = "Câu 1, 3, 4, 6–11, 13–20"
    scoring_table.rows[1].cells[1].text = "KHÔNG"
    scoring_table.rows[1].cells[2].text = "CÓ"
    scoring_table.rows[2].cells[0].text = "Câu 2, 5, 12"
    scoring_table.rows[2].cells[1].text = "CÓ"
    scoring_table.rows[2].cells[2].text = "KHÔNG"

    score_paragraph = doc.add_paragraph(
        f"\nTổng điểm M-CHAT-R: {score} / 20 điểm")
    score_paragraph.runs[0].bold = True

    step2 = doc.add_paragraph()
    step2.add_run("BƯỚC 2. Đối chiếu kết quả").bold = True

    result_table = doc.add_table(rows=4, cols=2)
    result_table.style = "Table Grid"
    result_table.rows[0].cells[0].text = "Tổng điểm"
    result_table.rows[0].cells[1].text = "Diễn giải"
    result_table.rows[1].cells[0].text = "0–2"
    result_table.rows[1].cells[1].text = (
        "Khả năng thấp. Tiếp tục theo dõi phát triển. Nếu trẻ dưới 24 tháng, "
        "sàng lọc lại sau sinh nhật 2 tuổi. Nếu vẫn có lo ngại về phát triển, "
        "nên trao đổi với nhân viên y tế."
    )
    result_table.rows[2].cells[0].text = "3–7"
    result_table.rows[2].cells[1].text = (
        "Khả năng trung bình. Cần đánh giá chuyên sâu, "
        "đồng thời đánh giá nhu cầu can thiệp sớm."
    )
    result_table.rows[3].cells[0].text = "8–20"
    result_table.rows[3].cells[1].text = (
        "Khả năng cao. Cần đánh giá chuyên sâu, "
        "đồng thời đánh giá nhu cầu can thiệp sớm."
    )

    interpretation_paragraph = doc.add_paragraph(
        f"\nĐánh giá kết quả của bé: {interpretation}"
    )
    interpretation_paragraph.runs[0].bold = True

    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)

    child_name = str(user_info.get("childName", "Be"))
    safe_name = re.sub(r"[^\w.-]+", "_", child_name,
                       flags=re.UNICODE).strip("._-")
    if not safe_name:
        safe_name = "Be"

    return send_file(
        file_stream,
        as_attachment=True,
        download_name=f"Ket_qua_MCHATR_{safe_name}.docx",
        mimetype=(
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
    )

# =========================================================
# 5. CHAY LOCAL (tren Render dung gunicorn)
# =========================================================


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
