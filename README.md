# ⌛ Scheboard: AI System for Scheduling

## 📖 **Table of Contents**

1. [Introduction](#gioi-thieu)
2. [Installation and Usage](#cai-dat-va-cach-su-dung)
3. [Features](#tinh-nang)
4. [Future Development](#huong-phat-trien)

<a id="gioi-thieu"></a>

## 🌟 **Introduction**

**Scheboard** is a web application designed to automatically schedule tasks and suggest study plans. It includes three main components:

✅ **Frontend:** Built with React.

✅ **Backend:** Developed using FastAPI.

✅ **AI Service:** Integrated AI for intelligent scheduling.

<a id="cai-dat-va-cach-su-dung"></a>

## 🚀 **Installation and Usage**

**Prerequisites**

- Python 3.8+

- Node.js

- FastAPI

- Reactjs

**Installation**

1. Clone the repository:

```
git clone https://github.com/Akapi895/Scheboard.git
cd Scheboard
```

2. Create a `.env` file in the `Scheboard` directory to save your AI API key. Then save the file with:

```
GEMINI_API_KEY=your_gemini_api_key_here
ENDPOINT_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=
```

> Get your Gemini API key at: https://aistudio.google.com/app/apikey

3. Install backend dependencies:

```
cd backend
pip install -r requirements.txt
```

4. Install frontend dependencies:

```
cd frontend
npm install
```

5.  Run the backend:

```
# From path/Scheboard
uvicorn backend.main:app
```

```
cd frontend
npm run dev
```

<a id="tinh-nang"></a>

## ⚙️ **Features**

- **Automated Scheduling:** Organizes tasks based on priority and study methods.

- **Task Categorization:** Supports different task types (study, work, leisure).

- **Time Estimation:** Calculates required time for each task.

- **AI Optimization:** Suggests optimal task schedules.

- **User Profile:** Stores task history and user preferences.

- **Dashboard:** Provides an overview of task progress and schedules.

- **Chatbot Integration:** Assists users in task management.

<a id="huong-phat-trien"></a>

## 🎯 **Future Development**

- **Mobile App Support:** Develop a mobile-friendly version.

- **AI Model Enhancement:** Improve task scheduling with advanced AI models.

- **Calendar Integration:** Sync with external calendar services (Google Calendar, Outlook).

- **Collaboration Features:** Allow users to share schedules and collaborate.

- **Progress Analytics:** Provide detailed analytics on task completion and study habits.

- **Voice Command Support:** Enable voice-based task input and management.

For further details, please check the documentation or contribute to the project!
