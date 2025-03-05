import requests
import os
from dotenv import load_dotenv


load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("API key chưa được cài đặt. Vui lòng cấu hình file .env.")
    exit(1)

def chat_with_gemini(question: str, instruction: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"parts": [
                {"text": instruction},
                {"text": question}
            ]}
        ]
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        try:
            data = response.json()
            answer = data["candidates"][0]["content"]["parts"][0]["text"]
            return answer
        except Exception:
            return "Không thể trích xuất câu trả lời từ API."
    else:
        try:
            error_message = response.json().get("error", response.text)
        except Exception:
            error_message = response.text
        return f"Failed to get response. Status Code: {response.status_code}. Error: {error_message}"