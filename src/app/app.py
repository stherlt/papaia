from flask import Flask, request, jsonify
from flask_cors import CORS  # Handle CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = r"C:\users\sther\Documents\HackED 2025\src\papasphotos"  # Your chosen folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure folder exists

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'photo' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Save the file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    return jsonify({"message": "File uploaded successfully!", "saved_path": file_path})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)