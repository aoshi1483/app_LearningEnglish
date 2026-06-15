import { useState, useRef, useEffect } from 'react'
import { Volume2, RotateCcw, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useSpeech } from '../contexts/SpeechContext'
import './ChatBubble.css'

export default function ChatBubble({ message, isAI, timestamp, hideText = false, onRetry, onEdit, coaching }) {
    const { speak, isSpeaking } = useSpeech()
    const [revealed, setRevealed] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(message)
    const [coachingOpen, setCoachingOpen] = useState(true)
    const editInputRef = useRef(null)

    const handlePlayAudio = () => {
        if (!isSpeaking && isAI) {
            speak(message)
        }
    }

    const handleStartEdit = () => {
        setEditText(message)
        setIsEditing(true)
    }

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus()
            editInputRef.current.select()
        }
    }, [isEditing])

    const handleConfirmEdit = () => {
        const trimmed = editText.trim()
        if (trimmed && trimmed !== message && onEdit) {
            onEdit(trimmed)
        }
        setIsEditing(false)
    }

    const handleCancelEdit = () => {
        setEditText(message)
        setIsEditing(false)
    }

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleConfirmEdit()
        } else if (e.key === 'Escape') {
            handleCancelEdit()
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
                {isEditing ? (
                    <div className="chat-edit-container">
                        <input
                            ref={editInputRef}
                            type="text"
                            className="chat-edit-input"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                        />
                        <div className="chat-edit-actions">
                            <button className="chat-edit-confirm" onClick={handleConfirmEdit} title="確定">
                                <Check size={14} />
                            </button>
                            <button className="chat-edit-cancel" onClick={handleCancelEdit} title="キャンセル">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                            {!isAI && onEdit && (
                                <button
                                    className="chat-edit-btn"
                                    onClick={handleStartEdit}
                                    title="テキストを編集"
                                >
                                    <Pencil size={12} />
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
                    </>
                )}
            </div>
            {/* Coaching feedback card */}
            {isAI && coaching && (
                <div className="chat-coaching">
                    <button
                        className="chat-coaching-toggle"
                        onClick={() => setCoachingOpen(!coachingOpen)}
                    >
                        <span className="chat-coaching-title">🎓 フィードバック</span>
                        {coachingOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {coachingOpen && (
                        <div className="chat-coaching-content">
                            {coaching.split('\n').filter(l => l.trim()).map((line, i) => {
                                const trimmed = line.trim()
                                let className = 'chat-coaching-line'
                                if (trimmed.startsWith('❌')) className += ' chat-coaching-error'
                                else if (trimmed.startsWith('✅')) className += ' chat-coaching-correct'
                                else if (trimmed.startsWith('💡')) className += ' chat-coaching-tip'
                                else if (trimmed.startsWith('📚')) className += ' chat-coaching-vocab'
                                else if (trimmed.includes('→')) className += ' chat-coaching-error'
                                return <p key={i} className={className}>{trimmed}</p>
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
