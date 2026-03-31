import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DUMMY_TRACKS = [
  { id: 1, title: 'Redbone', artist: 'Childish Gambino' },
  { id: 2, title: 'Good Days', artist: 'SZA' },
  { id: 3, title: 'PRIDE.', artist: 'Kendrick Lamar' },
  { id: 4, title: 'Nights', artist: 'Frank Ocean' },
]

const INITIAL_MESSAGES = [
  { id: 1, role: 'assistant', text: "Hey! I'm Palate, your music assistant. Connect your Spotify and I'll learn your taste over time. Ask me anything — recommendations, playlist edits, or just tell me what mood you're in." },
]

export default function App() {
  const [apiOnline, setApiOnline] = useState(null)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then(res => res.ok ? setApiOnline(true) : setApiOnline(false))
      .catch(() => setApiOnline(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    const userMessage = text
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMessage }])
    setInput('')
    const thinkingId = Date.now() + 1
    setMessages(prev => [...prev, { id: thinkingId, role: 'assistant', text: 'Thinking...' }])
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await res.json()
      setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, text: data.reply } : m))
    } catch {
      setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, text: 'Something went wrong.' } : m))
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="navbar-title">Palate</span>
        <div className="navbar-right">
          <span className={`status-dot ${apiOnline === null ? 'status-loading' : apiOnline ? 'status-online' : 'status-offline'}`} title={apiOnline ? 'API reachable' : 'API unreachable'} />
          <button className="connect-btn">Connect Spotify</button>
        </div>
      </nav>

      <div className="body">
        <aside className="sidebar">
          <p className="sidebar-header">Your Library</p>
          <ul className="track-list">
            {DUMMY_TRACKS.map(track => (
              <li key={track.id} className="track-item">
                <span className="track-title">{track.title}</span>
                <span className="track-artist">{track.artist}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="chat">
          <div className="messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message message-${msg.role}`}>
                <span className="message-text">{msg.text}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="input-row">
            <textarea
              className="chat-input"
              placeholder="Ask for recommendations, describe a mood, edit a playlist..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-btn" onClick={handleSend}>Send</button>
          </div>
        </main>
      </div>
    </div>
  )
}
