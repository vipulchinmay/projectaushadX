from flask import Flask, request, jsonify
import easyocr, json, base64
from langchain_ollama import OllamaLLM
from io import BytesIO
from PIL import Image

app = Flask(__name__)

@app.route('/scan', methods=['POST'])
def scan_medicine():
    try:
        data = request.json
        if not data or "image" not in data:
            return jsonify({"error": "No image received"}), 400

        base64_str = data["image"]
        print("Received Image Base64 Length:", len(base64_str))

        # Convert Base64 to Image
        image_bytes = base64.b64decode(base64_str)
        image = Image.open(BytesIO(image_bytes))

        # OCR Processing
        reader = easyocr.Reader(['en'])
        ocr_result = reader.readtext(image, detail=0)
        print("OCR Extracted Text:", ocr_result)

        # AI Processing
        model = OllamaLLM(model="seekhan")
        prompt = f"Extract details from: {' '.join(ocr_result)}"
        response = model.invoke(input=prompt)

        print("AI Response:", response)
        return jsonify({
            "medicine_name": "Paracetamol",
            "manufacturing_date": "01/2024",
            "expiry_date": "12/2025",
            "description": response,
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
