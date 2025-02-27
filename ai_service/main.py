import os
from dotenv import load_dotenv
import json
load_dotenv()

from chatbot.chatbot import chat_with_gemini

def main():
    with open('instructions.json', 'r', encoding='utf-8') as f:
        instructions = json.load(f)

    print("Nhập câu hỏi của bạn (gõ 'exit' để thoát):")
    
    instruction = instructions.get('instruction_1')
    
    while True:
        question = input("You: ")
        if question.lower() in ["exit", "quit"]:
            print("Tạm biệt!")
            break
        
        answer = chat_with_gemini(question, instruction)
        print("Bot:", answer)

if __name__ == '__main__':
    main()
