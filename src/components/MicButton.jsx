import { Mic, MicOff } from 'lucide-react'
import './MicButton.css'

export default function MicButton({ isListening, onToggle, disabled, size = 'large', recordingMode = 'manual' }) {
    return (
        <div className={`mic-container mic-container--${size}`}>
            {isListening && (
                <>
                    <div className="mic-ring mic-ring--1" />
                    <div className="mic-ring mic-ring--2" />
                    <div className="mic-ring mic-ring--3" />
                </>
            )}

            {recordingMode === 'auto' && (
                <div className="mic-mode-badge">Auto</div>
            )}

            <button
                className={`mic-btn ${isListening ? 'mic-btn--active' : ''} ${disabled ? 'mic-btn--disabled' : ''}`}
                onClick={onToggle}
                disabled={disabled}
                aria-label={isListening ? '録音停止' : '録音開始'}
            >
                {isListening ? <MicOff size={size === 'large' ? 32 : 24} /> : <Mic size={size === 'large' ? 32 : 24} />}
            </button>
        </div>
    )
}
