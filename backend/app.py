from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import os
import random
from reportlab.pdfgen import canvas

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# 🔴 MODEL DISABLED (TRAINING IN PROGRESS)
MODEL_READY = False

@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(image_path)

    img = cv2.imread(image_path)
    h, w, _ = img.shape

    # 🟡 FAKE DETECTIONS (FOR FRONTEND DEV)
    findings = []
    for i in range(random.randint(1, 4)):
        x1 = random.randint(0, w // 2)
        y1 = random.randint(0, h // 2)
        x2 = x1 + random.randint(40, 120)
        y2 = y1 + random.randint(40, 120)

        label = random.choice(["Reversal", "Correction"])
        findings.append({
            "type": label,
            "bbox": [x1, y1, x2, y2]
        })

        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(img, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    annotated_path = os.path.join(OUTPUT_FOLDER, "annotated.jpg")
    cv2.imwrite(annotated_path, img)

    # 📄 PDF REPORT
    pdf_path = os.path.join(OUTPUT_FOLDER, "report.pdf")
    c = canvas.Canvas(pdf_path)
    c.drawString(50, 800, "NeuroScript – Screening Report (Demo Mode)")
    c.drawString(50, 770, f"Markers Detected: {len(findings)}")

    y = 740
    for f in findings:
        c.drawString(50, y, f"- {f['type']} detected")
        y -= 20

    c.save()

    return jsonify({
        "mode": "demo",
        "findings": findings,
        "image_url": "/result/image",
        "pdf_url": "/result/pdf"
    })

@app.route("/result/image")
def get_image():
    return send_file("outputs/annotated.jpg", mimetype="image/jpeg")

@app.route("/result/pdf")
def get_pdf():
    return send_file("outputs/report.pdf", mimetype="application/pdf")

if __name__ == "__main__":
    app.run(debug=True)
