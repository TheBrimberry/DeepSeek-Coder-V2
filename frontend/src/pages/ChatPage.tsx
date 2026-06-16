import { useState } from 'react';
import { MessageCircle, Send, Phone, Video, Search } from 'lucide-react';
import Header from '../components/Header';
import { mockConversations } from '../data/mock';

interface ChatMessage {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

const mockMessages: ChatMessage[] = [
  { id: 'm1', text: 'Hey! Have you checked out the new TypeScript 5.4 features?', sent: false, time: '10:30 AM' },
  { id: 'm2', text: 'Not yet! What caught your eye?', sent: true, time: '10:32 AM' },
  { id: 'm3', text: 'The NoInfer utility type is pretty cool. It helps prevent unwanted type widening in generic functions.', sent: false, time: '10:33 AM' },
  { id: 'm4', text: 'Oh nice, that sounds really useful for library authors. I have been running into that exact issue.', sent: true, time: '10:35 AM' },
  { id: 'm5', text: 'Exactly! Also the improved narrowing for closures is a game changer.', sent: false, time: '10:36 AM' },
  { id: 'm6', text: 'I will definitely check it out today. Thanks for the heads up!', sent: true, time: '10:38 AM' },
  { id: 'm7', text: 'No problem! Let me know if you want to pair on migrating our project.', sent: false, time: '10:39 AM' },
];

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedConv = mockConversations.find((c) => c.id === selectedConversation);

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page chat-page">
      <Header />

      <div className="chat-layout">
        {/* Left Panel: Conversation List */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">
              <MessageCircle size={20} />
              Messages
            </h2>
          </div>

          <div className="chat-sidebar-search">
            <Search size={16} className="chat-sidebar-search-icon" />
            <input
              type="text"
              className="chat-sidebar-search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="conversation-list">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation === conv.id ? 'conversation-item-active' : ''}`}
                onClick={() => setSelectedConversation(conv.id)}
              >
                <div className="conversation-avatar-wrapper">
                  <img
                    src={conv.avatar_url}
                    alt={conv.name}
                    className="conversation-avatar"
                  />
                  {conv.online && <span className="online-indicator" />}
                </div>
                <div className="conversation-info">
                  <div className="conversation-top">
                    <span className="conversation-name">{conv.name}</span>
                    <span className="conversation-time">{conv.time}</span>
                  </div>
                  <div className="conversation-bottom">
                    <span className="conversation-preview">{conv.last_message}</span>
                    {conv.unread_count > 0 && (
                      <span className="unread-badge">{conv.unread_count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Area */}
        <div className="chat-main">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div className="chat-main-user">
                  <img
                    src={selectedConv.avatar_url}
                    alt={selectedConv.name}
                    className="chat-main-avatar"
                  />
                  <div className="chat-main-user-info">
                    <span className="chat-main-name">{selectedConv.name}</span>
                    <span className="chat-main-status">
                      {selectedConv.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="chat-main-actions">
                  <button className="btn-icon" aria-label="Voice call">
                    <Phone size={20} />
                  </button>
                  <button className="btn-icon" aria-label="Video call">
                    <Video size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${msg.sent ? 'message-sent' : 'message-received'}`}
                  >
                    <p className="message-text">{msg.text}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="chat-input-bar">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="btn btn-primary chat-send-btn"
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">
              <MessageCircle size={48} className="chat-placeholder-icon" />
              <h3 className="chat-placeholder-title">Select a conversation</h3>
              <p className="chat-placeholder-text">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
