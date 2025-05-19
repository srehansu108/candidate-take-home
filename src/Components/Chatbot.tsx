import React, { useState, useRef, useEffect } from 'react';

type MessageSender = 'user' | 'bot' | 'error' | 'typing';

interface Message {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp?: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [messages, isTyping]);

  const addMessage = (text: string, sender: MessageSender) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add user message
    addMessage(trimmedInput, 'user');
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`/api/chat?message=${encodeURIComponent(trimmedInput)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      if (data.error) {
        addMessage(data.error, 'error');
      } else {
        addMessage(data.response, 'bot');
      }
    } catch (err) {
      console.error('Chat error:', err);
      addMessage(
        err instanceof Error ? err.message : 'Sorry, something went wrong. Please try again.',
        'error'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Header with Bot Avatar */}
      <div className="chat-header">
        <div className="bot-avatar">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#4361ee"/>
            <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6Z" fill="white"/>
            <path d="M12 16C8.67 16 6 18.68 6 22H18C18 18.68 15.33 16 12 16Z" fill="white"/>
          </svg>
        </div>
        <h2>Chatbot Assistant</h2>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message-container ${message.sender}`}
          >
            {message.sender === 'bot' && (
              <div className="bot-avatar small">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#4361ee"/>
                  <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6Z" fill="white"/>
                  <path d="M12 16C8.67 16 6 18.68 6 22H18C18 18.68 15.33 16 12 16Z" fill="white"/>
                </svg>
              </div>
            )}
            
            {message.sender === 'user' && (
              <div className="user-avatar small">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#666"/>
                  <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6Z" fill="white"/>
                  <path d="M12 16C8.67 16 6 18.68 6 22H18C18 18.68 15.33 16 12 16Z" fill="white"/>
                </svg>
              </div>
            )}
            
            <div className={`message ${message.sender}`}>
              {message.text}
              {message.timestamp && (
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message-container bot">
            <div className="bot-avatar small">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#4361ee"/>
                <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6Z" fill="white"/>
                <path d="M12 16C8.67 16 6 18.68 6 22H18C18 18.68 15.33 16 12 16Z" fill="white"/>
              </svg>
            </div>
            <div className="message bot typing">
              <div className="typing-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-input"
          disabled={isTyping}
        />
        <button
          onClick={handleSend}
          className="send-button"
          disabled={!input.trim() || isTyping}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <style jsx>{`
        .chatbot-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 420px;
          height: 600px;
          margin: 0 auto;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .chat-header {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #4361ee;
          color: white;
        }
        
        .bot-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .bot-avatar svg {
          width: 24px;
          height: 24px;
        }
        
        .chat-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }
        
        .message-container {
          display: flex;
          margin-bottom: 12px;
          align-items: flex-end;
        }
        
        .message-container.bot {
          justify-content: flex-start;
        }
        
        .message-container.user {
          justify-content: flex-end;
        }
        
        .bot-avatar.small, .user-avatar.small {
          width: 32px;
          height: 32px;
          min-width: 32px;
          margin-right: 8px;
        }
        
        .user-avatar.small svg {
          width: 20px;
          height: 20px;
        }
        
        .bot-avatar.small svg {
          width: 20px;
          height: 20px;
        }
        
        .message {
          position: relative;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 70%;
          word-wrap: break-word;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          line-height: 1.4;
        }
        
        .message.bot {
          background: white;
          color: #050505;
          border-bottom-left-radius: 4px;
        }
        
        .message.user {
          background: #4361ee;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .message.error {
          background: #fee2e2;
          color: #b91c1c;
        }
        
        .message.typing {
          background: white;
          color: #65676b;
          font-style: italic;
        }
        
        .message-timestamp {
          font-size: 0.7rem;
          opacity: 0.7;
          margin-top: 4px;
          text-align: right;
        }
        
        .typing-dots {
          display: inline-flex;
          align-items: center;
        }
        
        .typing-dots span {
          animation: typingAnimation 1.4s infinite ease-in-out;
          opacity: 0;
        }
        
        .typing-dots span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typingAnimation {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        .chat-input-container {
          display: flex;
          padding: 12px;
          border-top: 1px solid #e4e6eb;
          background: white;
        }
        
        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e4e6eb;
          border-radius: 20px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .chat-input:focus {
          border-color: #4361ee;
        }
        
        .send-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          margin-left: 8px;
          border: none;
          border-radius: 50%;
          background: #4361ee;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .send-button:disabled {
          background: #e4e6eb;
          color: #bcc0c4;
          cursor: not-allowed;
        }
        
        .send-button:hover:not(:disabled) {
          background: #3a56d4;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;