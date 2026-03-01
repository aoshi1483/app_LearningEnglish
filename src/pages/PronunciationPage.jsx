import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, RotateCcw, Volume2 } from 'lucide-react'
import { useSpeech } from '../contexts/SpeechContext'
import { useProgress } from '../contexts/ProgressContext'
import { LESSONS } from '../data/lessons'
import { calculatePronunciationScore } from '../data/aiResponses'
import MicButton from '../components/MicButton'
import './PronunciationPage.css'

export default function PronunciationPage() {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const { isListening, transcript, isSupported, startListening, stopListening, speak, stopSpeaking, setTranscript, recordingMode, setRecordingMode } = useSpeech()
    const { completeLesson, addPerfectScore } = useProgress()

    const lesson = LESSONS.pronunciation?.find(l => l.id === lessonId)
    const phrases = lesson?.phrases || []

    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(null)
    const [userText, setUserText] = useState('')
    const [hasAttempted, setHasAttempted] = useState(false)

    const currentPhrase = phrases[currentIndex]

    // ページ離脱時にTTSと音声認識を停止
    useEffect(() => {
        return () => {
            stopSpeaking()
            stopListening()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (transcript && !isListening) {
            setUserText(transcript)
            const s = calculatePronunciationScore(currentPhrase?.prompt, transcript)
            setScore(s)
            setHasAttempted(true)
            setTranscript('')
        }
    }, [transcript, isListening]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleMicToggle = () => {
        if (isListening) {
            stopListening()
        } else {
            setScore(null)
            setUserText('')
            setHasAttempted(false)
            startListening()
        }
    }

    const handlePlayPrompt = () => {
        if (currentPhrase) {
            speak(currentPhrase.prompt)
        }
    }

    const handleNext = () => {
        if (currentIndex < phrases.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setScore(null)
            setUserText('')
            setHasAttempted(false)
        }
    }

    const handleRetry = () => {
        setScore(null)
        setUserText('')
        setHasAttempted(false)
    }

    const getScoreColor = (s) => {
        if (s >= 80) return '#22c55e'
        if (s >= 50) return '#f59e0b'
        return '#ef4444'
    }

    const getScoreLabel = (s) => {
        if (s >= 90) return 'パーフェクト！ 🎉'
        if (s >= 80) return '素晴らしい！ ✨'
        if (s >= 60) return 'いいね！ 👍'
        if (s >= 40) return 'もう少し！ 💪'
        return 'もう一度チャレンジ！ 🔄'
    }

    if (!lesson) {
        return (
            <div className="page-content">
                <p>レッスンが見つかりません</p>
                <button className="btn btn-primary" onClick={() => navigate('/lessons')}>戻る</button>
            </div>
        )
    }

    return (
        <div className="pronunciation-page">
            {/* Header */}
            <div className="pron-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                {/* pron-header-info */}
                <div className="pron-header-info">
                    <h1 className="pron-header-title">{lesson.title}</h1>
                    <p className="pron-header-progress">{currentIndex + 1} / {phrases.length}</p>
                </div>
            </div>


            {/* Progress */}
            <div className="pron-progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${((currentIndex + (hasAttempted ? 1 : 0)) / phrases.length) * 100}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="pron-content">
                {/* Prompt Card */}
                <div className="pron-prompt-card glass-card">
                    <p className="pron-prompt-label">この文を発音してください</p>
                    <p className="pron-prompt-text">{currentPhrase?.prompt}</p>
                    <p className="pron-prompt-translation">{currentPhrase?.translation}</p>
                    <button className="pron-play-btn" onClick={handlePlayPrompt}>
                        <Volume2 size={18} />
                        <span>お手本を聞く</span>
                    </button>
                </div>

                {/* Score */}
                {hasAttempted && score !== null && (
                    <div className="pron-result glass-card">
                        <div className="pron-score-circle" style={{ '--score-color': getScoreColor(score) }}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle
                                    cx="60" cy="60" r="52"
                                    fill="none"
                                    stroke={getScoreColor(score)}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${score * 3.267} 326.7`}
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 0.8s ease' }}
                                />
                            </svg>
                            <span className="pron-score-value" style={{ color: getScoreColor(score) }}>{score}%</span>
                        </div>
                        <p className="pron-score-label">{getScoreLabel(score)}</p>

                        {userText && (
                            <div className="pron-user-text">
                                <p className="pron-user-text-label">あなたの発音:</p>
                                <p className="pron-user-text-content">{userText}</p>
                            </div>
                        )}

                        <div className="pron-actions">
                            <button className="btn btn-secondary" onClick={handleRetry}>
                                <RotateCcw size={16} />
                                もう一度
                            </button>
                            {currentIndex < phrases.length - 1 && (
                                <button className="btn btn-primary" onClick={handleNext}>
                                    次へ
                                    <ChevronRight size={16} />
                                </button>
                            )}
                            {currentIndex === phrases.length - 1 && (
                                <button className="btn btn-success" onClick={() => {
                                    // レッスン完了時にXP付与
                                    if (lesson) {
                                        completeLesson(lesson.id, lesson.xp || 15)
                                    }
                                    // パーフェクトスコア判定
                                    if (score === 100) {
                                        addPerfectScore()
                                    }
                                    navigate('/lessons/pronunciation')
                                }}>
                                    完了！
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mic Area */}
            <div className="pron-mic-area">
                <div className="mic-mode-toggle">
                    <button
                        className={`mic-mode-option ${recordingMode === 'manual' ? 'mic-mode-option--active' : ''}`}
                        onClick={() => setRecordingMode('manual')}
                    >
                        ✋ 手動
                    </button>
                    <button
                        className={`mic-mode-option ${recordingMode === 'auto' ? 'mic-mode-option--active' : ''}`}
                        onClick={() => setRecordingMode('auto')}
                    >
                        ⚡ 自動
                    </button>
                </div>
                <MicButton
                    isListening={isListening}
                    onToggle={handleMicToggle}
                    disabled={!isSupported}
                    recordingMode={recordingMode}
                />
                <p className="mic-label">
                    {isListening
                        ? (recordingMode === 'auto' ? '聞き取り中...（自動停止）' : '話し終えたらボタンを押してください')
                        : 'タップして発音'}
                </p>
            </div>
        </div>
    )
}
