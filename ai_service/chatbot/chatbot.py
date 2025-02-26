import requests
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("API key chưa được cài đặt. Vui lòng cấu hình file .env.")
    exit(1)

def chat_with_gemini(question: str, instruction: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}"
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

def main():
    print("Nhập câu hỏi của bạn (gõ 'exit' để thoát):")
    
    instruction = """Bạn là một trợ lý cho một ứng dụng quản lý thời gian và hỗ trợ học tập có tên là Scheboard. Khi người dùng chào bạn, hãy chào lại thân thiện và cho họ biết rằng bạn là ai.
                     Còn khi họ hỏi, hãy đưa ra cho người dùng những câu trả lời chính xác và mang tính xây dựng nhất."""

    while True:
        question = input("You: ")
        if question.lower() in ["exit", "quit"]:
            print("Tạm biệt!")
            break
        
        answer = chat_with_gemini(question, instruction)
        print("Bot:", answer)

if __name__ == '__main__':
    main()
