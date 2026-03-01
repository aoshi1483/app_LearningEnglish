import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Send, Loader, Eye, EyeOff, CheckCircle, Mic } from 'lucide-react'
import { useSpeech } from '../contexts/SpeechContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useAIProvider } from '../contexts/AIProviderContext'
import { useProgress } from '../contexts/ProgressContext'
import { LESSONS, CATEGORIES } from '../data/lessons'
import { getAIResponse } from '../services/aiService'
import ChatBubble from '../components/ChatBubble'
import MicButton from '../components/MicButton'
import './SpeakingPracticePage.css'

export default function SpeakingPracticePage() {
    const { categoryId, lessonId } = useParams()
    const navigate = useNavigate()
    const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, speak, stopSpeaking, setTranscript, isSpeaking, recordingMode, setRecordingMode, hideTextInChat, setHideTextInChat, autoListenAfterAI, setAutoListenAfterAI } = useSpeech()
    const { targetLang } = useLanguage()
    const { provider, getActiveApiKey, getSelectedModel } = useAIProvider()
    const { completeLesson, addSpeakingMinutes, addXp, username } = useProgress()

    const [messages, setMessages] = useState([])
    const [showHints, setShowHints] = useState(false)
    const [textInput, setTextInput] = useState('')
    const [isAiThinking, setIsAiThinking] = useState(false)
    const [isLessonComplete, setIsLessonComplete] = useState(false)
    const chatEndRef = useRef(null)
    const sessionStartRef = useRef(Date.now())
    const messageCountRef = useRef(0)
    const autoListenRef = useRef(autoListenAfterAI)
    useEffect(() => { autoListenRef.current = autoListenAfterAI }, [autoListenAfterAI])

    const lessons = LESSONS[categoryId] || []
    const lesson = lessons.find(l => l.id === lessonId)
    const category = CATEGORIES.find(c => c.id === categoryId)
    const scenario = lesson?.scenario

    // ローカライズヘルパー: オブジェクトならtargetLangの値を返す、文字列ならそのまま
    const getLocalized = (value) => {
        if (!value) return ''
        if (typeof value === 'object') return value[targetLang] || value['en'] || ''
        return value
    }

    // 初回AIメッセージ
    useEffect(() => {
        if (!scenario) return

        const openerText = getLocalized(scenario.aiOpener)
        if (!openerText) return

        const timer = setTimeout(() => {
            setMessages([{
                id: Date.now(),
                text: openerText,
                isAI: true,
                time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            }])
            speak(openerText, () => {
                // 初回AIメッセージ後も自動録音を開始
                if (autoListenRef.current && isSupported) {
                    // TTS終了直後はブラウザのオーディオが安定しないため少し待つ
                    setTimeout(() => startListening(true), 300)
                }
            })
        }, 500)
        return () => clearTimeout(timer)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // transcript が更新されたらメッセージ送信
    useEffect(() => {
        if (transcript && !isListening) {
            handleSendMessage(transcript)
            setTranscript('')
        }
    }, [transcript, isListening]) // eslint-disable-line react-hooks/exhaustive-deps

    // スクロール
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, interimTranscript, isAiThinking])

    const handleSendMessage = async (text) => {
        if (!text.trim() || isAiThinking) return

        const now = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

        const userMessage = {
            id: Date.now(),
            text: text.trim(),
            isAI: false,
            time: now,
        }

        // ユーザーメッセージ追加
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)

        // AI応答を取得
        setIsAiThinking(true)
        try {
            const aiResponse = await getAIResponse(
                provider,
                text.trim(),
                updatedMessages,
                targetLang,
                scenario,
                getActiveApiKey(),
                getSelectedModel(),
                username
            )

            // [LESSON_COMPLETE] マーカーを検出・除去
            const hasCompleteMarker = aiResponse.includes('[LESSON_COMPLETE]')
            const cleanResponse = aiResponse.replace(/\[LESSON_COMPLETE\]/g, '').trim()

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: cleanResponse,
                isAI: true,
                time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            }])

            // エラーメッセージ（⚠️で始まる）は読み上げをスキップ
            if (!cleanResponse.startsWith('⚠')) {
                speak(cleanResponse, () => {
                    // AI読み上げ完了後に自動録音開始（refで最新値を参照）
                    if (autoListenRef.current && isSupported && !hasCompleteMarker) {
                        // TTS終了直後はブラウザのオーディオが安定しないため少し待つ
                        setTimeout(() => startListening(true), 300)
                    }
                })
            }
            messageCountRef.current += 1

            // レッスン完了検知
            if (hasCompleteMarker) {
                const minutesSpent = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000))
                addSpeakingMinutes(minutesSpent)
                if (lesson) {
                    const xp = lesson.xp || Math.min(10 + messageCountRef.current * 5, 50)
                    completeLesson(lesson.id, xp)
                }
                setIsLessonComplete(true)
            }
        } catch (error) {
            console.error('AI response error:', error)
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I couldn't process that. Let's try again!",
                isAI: true,
                time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            }])
        } finally {
            setIsAiThinking(false)
        }
    }

    const handleMicToggle = () => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }

    const handleTextSubmit = (e) => {
        e.preventDefault()
        if (textInput.trim() && !isAiThinking) {
            handleSendMessage(textInput)
            setTextInput('')
        }
    }

    const handleRetry = (msgId) => {
        if (isAiThinking || isSpeaking) return
        // 該当メッセージ以降を全て削除
        setMessages(prev => {
            const idx = prev.findIndex(m => m.id === msgId)
            if (idx === -1) return prev
            return prev.slice(0, idx)
        })
        // レッスン完了状態をリセット
        setIsLessonComplete(false)
        // メッセージカウントを調整
        messageCountRef.current = Math.max(0, messageCountRef.current - 1)
    }

    return (
        <div className="speaking-page">
            {/* Header */}
            <div className="speaking-header">
                <button className="back-btn" onClick={() => {
                    // セッション終了時にXPと会話時間を記録
                    const minutesSpent = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000))
                    addSpeakingMinutes(minutesSpent)
                    if (messageCountRef.current > 0 && lesson) {
                        const xp = lesson.xp || Math.min(10 + messageCountRef.current * 5, 50)
                        completeLesson(lesson.id, xp)
                    }
                    navigate(-1)
                }}>
                    <ArrowLeft size={20} />
                </button>
                <div className="speaking-header-info">
                    <span className="emoji">{category?.icon}</span>
                    <div style={{ flex: 1 }}> {/* ← ここに flex: 1 を追加してボタンを右に押し出します */}
                        <h1 className="speaking-header-title">{lesson?.title || 'スピーキング練習'}</h1>
                        {scenario?.aiRole && (
                            <p className="speaking-header-role">🤖 {getLocalized(scenario.aiRole)}</p>
                        )}
                    </div>
                    {/* --- ヒントボタンをここ（infoの中）に移動 --- */}
                    {scenario?.hints && (
                        <button
                            className={`hint-btn ${showHints ? 'hint-btn--active' : ''}`}
                            onClick={() => setShowHints(!showHints)}
                        >
                            <Lightbulb size={18} />
                        </button>
                    )}
                    <button
                        className={`hint-btn ${hideTextInChat ? 'hint-btn--active' : ''}`}
                        onClick={() => setHideTextInChat(!hideTextInChat)}
                        title={hideTextInChat ? 'テキストを表示' : 'テキストを非表示'}
                    >
                        {hideTextInChat ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                        className={`hint-btn ${autoListenAfterAI ? 'hint-btn--active' : ''}`}
                        onClick={() => setAutoListenAfterAI(!autoListenAfterAI)}
                        title={autoListenAfterAI ? '自動録音OFF' : '自動録音ON'}
                    >
                        <Mic size={18} />
                    </button>
                </div>
            </div>

            {/* Situation */}
            {scenario?.situation && (
                <div className="speaking-situation">
                    <p>{getLocalized(scenario.situation)}</p>
                </div>
            )}

            {/* Hints */}
            {showHints && scenario?.hints && (
                <div className="speaking-hints glass-card">
                    <h3 className="speaking-hints-title">💡 ヒント</h3>
                    <ul className="speaking-hints-list">
                        {scenario.hints.map((hint, i) => (
                            <li key={i}>{hint}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Chat Area */}
            <div className="speaking-chat">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <ChatBubble
                            message={msg.text}
                            isAI={msg.isAI}
                            timestamp={msg.time}
                            hideText={hideTextInChat}
                            onRetry={!msg.isAI && !isAiThinking && !isSpeaking ? () => handleRetry(msg.id) : undefined}
                        />
                    </div>
                ))}
                {isAiThinking && (
                    <div className="ai-thinking">
                        <div className="ai-thinking-avatar">
                            <span className="emoji">🤖</span>
                        </div>
                        <div className="ai-thinking-dots">
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                        </div>
                    </div>
                )}
                {interimTranscript && (
                    <div className="interim-text">
                        <span className="interim-indicator" />
                        {interimTranscript}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="speaking-input-area">
                {isLessonComplete ? (
                    <div className="lesson-complete-card glass-card">
                        <CheckCircle size={32} className="lesson-complete-icon" />
                        <h3 className="lesson-complete-title">レッスン完了！ 🎉</h3>
                        <p className="lesson-complete-desc">
                            {lesson?.xp || Math.min(10 + messageCountRef.current * 5, 50)} XP 獲得しました！
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate(-1)}>
                            レッスン一覧に戻る
                        </button>
                    </div>
                ) : (
                    <>
                        {!isSupported && (
                            <div className="speech-warning">
                                ⚠️ このブラウザは音声認識に対応していません。テキスト入力をご利用ください。
                            </div>
                        )}

                        <form className="text-input-form" onSubmit={handleTextSubmit}>
                            <input
                                type="text"
                                className="text-input"
                                placeholder="テキストで入力..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                disabled={isAiThinking}
                            />
                            <button type="submit" className="send-btn" disabled={!textInput.trim() || isAiThinking}>
                                {isAiThinking ? <Loader size={18} className="spin" /> : <Send size={18} />}
                            </button>
                        </form>

                        <div className="mic-area">
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
                                disabled={!isSupported || isAiThinking || isSpeaking}
                                recordingMode={recordingMode}
                            />
                            <p className="mic-label">
                                {isAiThinking
                                    ? 'AI応答中...'
                                    : isSpeaking
                                        ? 'AIの声を再生中...'
                                        : isListening
                                            ? (recordingMode === 'auto' ? '聞き取り中...（自動停止）' : '話し終えたらボタンを押して送信')
                                            : 'タップして話す'}
                            </p>
                            {isSpeaking && (
                                <button className="skip-btn" onClick={stopSpeaking}>
                                    読み上げスキップ
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
