import { useState } from 'react'
import { Volume2, RotateCcw } from 'lucide-react'
import { useSpeech } from '../contexts/SpeechContext'
import './ChatBubble.css'

export default function ChatBubble({ message, isAI, timestamp, hideText = false, onRetry }) {
    const { speak, isSpeaking } = useSpeech()
    const [revealed, setRevealed] = useState(false)

    const handlePlayAudio = () => {
        if (!isSpeaking && isAI) {
            speak(message)
        }
    }

    const isBlurred = hideText && !revealed

    return (
        <div className={`chat-bubble ${isAI ? 'chat-bubble--ai' : 'chat-bubble--user'}`}>
            {isAI && (
                <div className="chat-avatar">
                    <span className="emoji">🤖</span>
                </div>
            )}
            <div className="chat-content">
                <div
                    className={`chat-text ${isBlurred ? 'chat-text--hidden' : ''}`}
                    onClick={() => isBlurred && setRevealed(true)}
                    title={isBlurred ? 'タップして表示' : ''}
                >
                    {message}
                </div>
                <div className="chat-footer">
                    {timestamp && <span className="chat-time">{timestamp}</span>}
                    {isAI && (
                        <button
                            className={`chat-play-btn ${isSpeaking ? 'chat-play-btn--playing' : ''}`}
                            onClick={handlePlayAudio}
                            aria-label="音声再生"
                        >
                            <Volume2 size={14} />
                        </button>
                    )}
                    {hideText && (
                        <button
                            className="chat-reveal-btn"
                            onClick={() => setRevealed(!revealed)}
                            title={revealed ? 'テキストを隠す' : 'テキストを表示'}
                        >
                            {revealed ? '🙈' : '👁️'}
                        </button>
                    )}
                    {!isAI && onRetry && (
                        <button
                            className="chat-retry-btn"
                            onClick={onRetry}
                            title="録り直す"
                        >
                            <RotateCcw size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

