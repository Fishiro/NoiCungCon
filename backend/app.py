from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
from dotenv import load_dotenv
from apikeyrotator import RotatingSession
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

load_dotenv()
app = Flask(__name__)
CORS(app)

api_keys = os.getenv("AI_API_KEYS", "").split(",")
session = RotatingSession(keys=api_keys)


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    try:
        response = session.post(
            "https://api.openai.com/v1/chat/completions",
            json={"model": "gpt-3.5-turbo",
                  "messages": [{"role": "user", "content": data.get("message")}]}
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/export-mchatr', methods=['POST'])
def export_mchatr():
    data = request.json
    user_info = data.get("userInfo", {})
    answers = data.get("answers", [])
    score = data.get("score", 0)
    interpretation = data.get("interpretation", "")
    questions = data.get("questions", [])

    # Tạo tệp Word trực tiếp trên RAM (Session-based)
    doc = Document()

    # Tiêu đề
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run(
        "KIỂM SÀNG LỌC RỐI LOẠN PHỔ TỰ KỶ Ở TRẺ NHỎ\n(KHUNG ĐÁNH GIÁ M-CHAT-R)\n(Dành cho trẻ từ 16 đến 30 tháng tuổi)")
    run.bold = True
    run.font.size = Pt(14)

    # Khối thông tin người dùng
    doc.add_paragraph(
        f"Họ tên trẻ: {user_info.get('childName', '')}\t\tNam/Nữ: {user_info.get('gender', '')}")
    doc.add_paragraph(
        f"Ngày sinh: {user_info.get('dob', '')}\t\tTuổi: {user_info.get('age', '')}")
    doc.add_paragraph(f"Địa chỉ: {user_info.get('address', '')}")
    doc.add_paragraph(f"Ngày đánh giá: {user_info.get('evalDate', '')}")

    evaluator = user_info.get('evaluator', '')
    if evaluator == 'Khác':
        evaluator = f"Người chăm sóc khác: {user_info.get('evaluatorOther', '')}"
    doc.add_paragraph(f"Người đánh giá: {evaluator}")

    doc.add_paragraph(
        "Bạn hãy trả lời các câu hỏi dưới đây về những hành vi có thể gặp ở con mình. Nếu hành vi nào xảy ra rất ít khi (chỉ thấy 1-2 lần) thì coi như không có.")

    # Bảng câu hỏi (3 cột)
    table = doc.add_table(rows=1, cols=3)
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Câu hỏi'
    hdr_cells[1].text = 'Có'
    hdr_cells[2].text = 'Không'

    for i, q_obj in enumerate(questions):
        row_cells = table.add_row().cells

        # Gộp câu hỏi chính và ví dụ (nếu có)
        q_text = q_obj.get('question', '')
        q_example = q_obj.get('example', '')
        full_question = f"{i+1}. {q_text}"
        if q_example:
            full_question += f" {q_example}"

        row_cells[0].text = full_question

        ans = answers[i] if i < len(answers) else None
        if ans is True:
            row_cells[1].text = "X"
            row_cells[2].text = ""
        elif ans is False:
            row_cells[1].text = ""
            row_cells[2].text = "X"

    # Kết quả và hướng dẫn
    doc.add_paragraph(
        "\nHƯỚNG DẪN CHẤM ĐIỂM VÀ DIỄN GIẢI KẾT QUẢ").runs[0].bold = True
    doc.add_paragraph("Lưu ý quan trọng: M-CHAT-R là công cụ sàng lọc, không phải công cụ chẩn đoán rối loạn phổ tự kỷ. Kết quả cần được xem cùng với quá trình theo dõi phát triển và các lo ngại của gia đình/người chăm sóc.")

    # Bảng hướng dẫn 1
    doc.add_paragraph(
        "BƯỚC 1. Xác định câu trả lời có dấu hiệu nguy cơ").runs[0].bold = True
    t1 = doc.add_table(rows=3, cols=3)
    t1.style = 'Table Grid'
    t1.rows[0].cells[0].text = "Nhóm câu"
    t1.rows[0].cells[1].text = "Tính 1 điểm"
    t1.rows[0].cells[2].text = "Tính 0 điểm"
    t1.rows[1].cells[0].text = "Câu 1, 3, 4, 6–11, 13–20"
    t1.rows[1].cells[1].text = "KHÔNG"
    t1.rows[1].cells[2].text = "CÓ"
    t1.rows[2].cells[0].text = "Câu 2, 5, 12"
    t1.rows[2].cells[1].text = "CÓ"
    t1.rows[2].cells[2].text = "KHÔNG"

    doc.add_paragraph(
        f"\nTổng điểm M-CHAT-R: {score} / 20 điểm").runs[0].bold = True

    # Bảng hướng dẫn 2
    doc.add_paragraph("BƯỚC 2. Đối chiếu kết quả").runs[0].bold = True
    t2 = doc.add_table(rows=4, cols=2)
    t2.style = 'Table Grid'
    t2.rows[0].cells[0].text = "Tổng điểm"
    t2.rows[0].cells[1].text = "Hiển thị câu trả lời"
    t2.rows[1].cells[0].text = "0–2"
    t2.rows[1].cells[1].text = "Khả năng thấp. Tiếp tục theo dõi phát triển. Nếu trẻ dưới 24 tháng, sàng lọc lại sau sinh nhật 2 tuổi. Nếu vẫn có lo ngại về phát triển, nên trao đổi với nhân viên y tế"
    t2.rows[2].cells[0].text = "3–7"
    t2.rows[2].cells[1].text = "Khả năng trung bình. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm."
    t2.rows[3].cells[0].text = "8–20"
    t2.rows[3].cells[1].text = "Khả năng cao. Cần đánh giá chẩn đoán chuyên sâu, đồng thời đánh giá nhu cầu can thiệp sớm."

    doc.add_paragraph(
        f"\nĐánh giá kết quả của bé: {interpretation}").runs[0].bold = True

    # Ghi ra stream thay vì lưu tệp vật lý để đảm bảo không rò rỉ dữ liệu (No saving policy)
    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)

    safe_name = user_info.get("childName", "Be").replace(" ", "_")
    return send_file(
        file_stream,
        as_attachment=True,
        download_name=f'Ket_qua_MCHATR_{safe_name}.docx',
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )


if __name__ == '__main__':
    app.run(port=int(os.getenv("PORT", 5000)))
