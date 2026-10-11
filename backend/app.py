from flask import Flask, request, jsonify 
from flask_cors import CORS 
import os 
from dotenv import load_dotenv 
# Import thu vien xoay vong key 
from apikeyrotator import RotatingSession 
 
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
            json={"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": data.get("message")}]} 
        ) 
        response.raise_for_status() 
        return jsonify(response.json()) 
    except Exception as e: 
        return jsonify({"error": str(e)}), 500 
 
if __name__ == '__main__': 
    app.run(port=int(os.getenv("PORT", 5000))) 
