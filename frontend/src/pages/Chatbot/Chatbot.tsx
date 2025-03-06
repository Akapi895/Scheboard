import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

interface Message {
  sender: string;
  text: string;
}

interface ChatHistoryItem {
  prompt: string;
  answer: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // TODO
  // Hardcoded user_id for demo purposes - in real app this would come from auth
  const [userId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat history from API
  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/ai/chat/response/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // New user, no history yet
          return;
        }
        throw new Error(`Error fetching chat history: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.history && Array.isArray(data.history)) {
        // Convert history format to message format
        const historyMessages: Message[] = [];
        
        data.history.forEach((item: ChatHistoryItem) => {
          historyMessages.push({ sender: 'user', text: item.prompt });
          historyMessages.push({ sender: 'ai', text: item.answer });
        });
        
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  // Send message to API
  const sendMessageToApi = async (userMessage: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/ai/chat/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "user_id": userId,
          "prompt": userMessage
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessages(prevMessages => [...prevMessages, { 
          text: data.response, 
          sender: 'ai' 
        }]);
      } else {
        throw new Error('API returned error status');
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prevMessages => [...prevMessages, { 
        text: "Sorry, I encountered an error. Please try again later.", 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = input.trim();
      
      // Add user message to the chat
      setMessages(prevMessages => [...prevMessages, { 
        text: userMessage, 
        sender: 'user' 
      }]);
      
      // Clear input field
      setInput('');
      
      // Send message to API
      sendMessageToApi(userMessage);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>Welcome to Scheboard</h3>
              <p>How can I assist you today?</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.sender === 'ai' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai loading">
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
