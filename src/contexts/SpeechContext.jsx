import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

const SpeechContext = createContext(null)

export function SpeechProvider({ children }) {
    const { currentLanguage } = useLanguage()
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [interimTranscript, setInterimTranscript] = useState('')
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isSupported, setIsSupported] = useState(true)

    // 録音設定
    const [recordingMode, setRecordingMode] = useState(() => localStorage.getItem('lingoflow_recording_mode') || 'manual')
    const [autoStopSeconds, setAutoStopSeconds] = useState(() => Number(localStorage.getItem('lingoflow_auto_stop_seconds')) || 3)
    const [hideTextInChat, setHideTextInChat] = useState(() => localStorage.getItem('lingoflow_hide_text_in_chat') === 'true')
    const [autoListenAfterAI, setAutoListenAfterAI] = useState(() => localStorage.getItem('lingoflow_auto_listen_after_ai') === 'true')

    const recognitionRef = useRef(null)
    const synthRef = useRef(null)
    const autoStopTimerRef = useRef(null)
    const recordingModeRef = useRef(recordingMode)
    const autoStopSecondsRef = useRef(autoStopSeconds)
    const manualStopRef = useRef(false)

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setIsSupported(false)
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = currentLanguage.speechLang

        recognition.onresult = (event) => {
            let interim = ''
            let final = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    final += t
                } else {
                    interim += t
                }
            }
            if (final) {
                // 手動モード（continuous）では結果を蓄積
                if (recordingModeRef.current === 'manual') {
                    setTranscript(prev => prev ? prev + ' ' + final : final)
                } else {
                    setTranscript(prev => prev ? prev + ' ' + final : final)
                }
            }
            setInterimTranscript(interim)

            // 自動モード: 発話検知のたびにタイマーをリセット
            if (recordingModeRef.current === 'auto') {
                if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current)
                autoStopTimerRef.current = setTimeout(() => {
                    recognition.stop()
                }, autoStopSecondsRef.current * 1000)
            }
        }

        recognition.onend = () => {
            // 自動停止タイマーをクリア
            if (autoStopTimerRef.current) {
                clearTimeout(autoStopTimerRef.current)
                autoStopTimerRef.current = null
            }

            // 手動モードでユーザーが意図的に停止していない場合は自動再スタート
            if (recordingModeRef.current === 'manual' && !manualStopRef.current) {
                try {
                    recognition.start()
                    // isListening は true のまま維持
                    return
                } catch (e) {
                    console.error('Failed to restart recognition:', e)
                }
            }

            setIsListening(false)
            setInterimTranscript('')
            manualStopRef.current = false
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            setIsListening(false)
            setInterimTranscript('')
        }

        recognitionRef.current = recognition
        synthRef.current = window.speechSynthesis

        return () => {
            recognition.abort()
        }
    }, [currentLanguage.speechLang])

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return
        setTranscript('')
        setInterimTranscript('')
        // 前回のタイマーをクリア
        if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current)
            autoStopTimerRef.current = null
        }
        try {
            recognitionRef.current.lang = currentLanguage.speechLang
            // 両モードとも continuous=true にし、自動モードはタイマーで停止
            recognitionRef.current.continuous = true
            manualStopRef.current = false
            recognitionRef.current.start()
            setIsListening(true)

            // 自動モード: 開始直後に初回タイマーをセット（何も話さなかった場合用）
            if (recordingModeRef.current === 'auto') {
                autoStopTimerRef.current = setTimeout(() => {
                    recognitionRef.current?.stop()
                }, autoStopSecondsRef.current * 1000)
            }
        } catch (e) {
            console.error('Failed to start recognition:', e)
        }
    }, [currentLanguage.speechLang])

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return
        // 意図的な停止であることをマーク
        manualStopRef.current = true
        // 自動停止タイマーをクリア
        if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current)
            autoStopTimerRef.current = null
        }
        recognitionRef.current.stop()
        setIsListening(false)
    }, [])

    const speak = useCallback((text, onEnd) => {
        if (!synthRef.current) return
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        // 言語判定: 日本語が含まれているかチェック
        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)

        if (hasJapanese) {
            utterance.lang = 'ja-JP'
        } else {
            utterance.lang = currentLanguage.speechLang
        }

        utterance.rate = 0.9
        utterance.pitch = 1.0

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => {
            setIsSpeaking(false)
            if (onEnd) onEnd()
        }
        utterance.onerror = () => setIsSpeaking(false)

        synthRef.current.speak(utterance)
    }, [currentLanguage.speechLang])

    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel()
            setIsSpeaking(false)
        }
    }, [])

    return (
        <SpeechContext.Provider value={{
            isListening,
            transcript,
            interimTranscript,
            isSpeaking,
            isSupported,
            startListening,
            stopListening,
            speak,
            stopSpeaking,
            setTranscript,
            recordingMode,
            setRecordingMode: (mode) => {
                setRecordingMode(mode)
                recordingModeRef.current = mode
                localStorage.setItem('lingoflow_recording_mode', mode)
            },
            autoStopSeconds,
            setAutoStopSeconds: (sec) => {
                setAutoStopSeconds(sec)
                autoStopSecondsRef.current = sec
                localStorage.setItem('lingoflow_auto_stop_seconds', sec)
            },
            hideTextInChat,
            setHideTextInChat: (val) => {
                setHideTextInChat(val)
                localStorage.setItem('lingoflow_hide_text_in_chat', val)
            },
            autoListenAfterAI,
            setAutoListenAfterAI: (val) => {
                setAutoListenAfterAI(val)
                localStorage.setItem('lingoflow_auto_listen_after_ai', val)
            },
        }}>
            {children}
        </SpeechContext.Provider>
    )
}

export function useSpeech() {
    const ctx = useContext(SpeechContext)
    if (!ctx) throw new Error('useSpeech must be used within SpeechProvider')
    return ctx
}
