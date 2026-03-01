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

    // AI応答後の自動録音用: 初回沈黙タイマーをスキップするフラグ
    const noInitialTimerRef = useRef(false)
    // ユーザーが発話したかどうかを追跡（onendでの再スタート判定に使用）
    const hasSpeechRef = useRef(false)

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
                hasSpeechRef.current = true
                setTranscript(prev => prev ? prev + ' ' + final : final)
            }
            setInterimTranscript(interim)

            // 自動モード: 発話検知のたびにタイマーをリセット
            // (noInitialTimer でも、話し始めたら通常通りタイマーを動かす)
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

            // ユーザーが意図的に停止した場合 → 終了
            if (manualStopRef.current) {
                setIsListening(false)
                setInterimTranscript('')
                manualStopRef.current = false
                return
            }

            // 手動モード: ブラウザが勝手に切断した場合は自動再スタート
            if (recordingModeRef.current === 'manual') {
                try {
                    recognition.start()
                    return
                } catch (e) {
                    console.error('Failed to restart recognition:', e)
                }
            }

            // 自動モード + noInitialTimer + まだ発話していない場合:
            // ユーザーを待ち続けるため再スタート
            if (recordingModeRef.current === 'auto' && noInitialTimerRef.current && !hasSpeechRef.current) {
                try {
                    recognition.start()
                    return
                } catch (e) {
                    console.error('Failed to restart recognition:', e)
                }
            }

            // それ以外（自動モードで発話後にタイマーで停止した場合など）→ 終了
            setIsListening(false)
            setInterimTranscript('')
            noInitialTimerRef.current = false
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)

            // no-speech エラー: noInitialTimer で待機中なら無視
            // (onend が続いて発火し、そこで再スタートされる)
            if (event.error === 'no-speech' && noInitialTimerRef.current && !hasSpeechRef.current && !manualStopRef.current) {
                return
            }

            // aborted エラー: 意図的な中断の場合は無視
            if (event.error === 'aborted') {
                return
            }

            setIsListening(false)
            setInterimTranscript('')
        }

        recognitionRef.current = recognition
        synthRef.current = window.speechSynthesis

        return () => {
            recognition.abort()
        }
    }, [currentLanguage.speechLang])

    const startListening = useCallback((noInitialTimer = false) => {
        if (!recognitionRef.current) return
        noInitialTimerRef.current = noInitialTimer
        hasSpeechRef.current = false
        manualStopRef.current = false
        setTranscript('')
        setInterimTranscript('')
        // 前回のタイマーをクリア
        if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current)
            autoStopTimerRef.current = null
        }
        try {
            recognitionRef.current.lang = currentLanguage.speechLang
            recognitionRef.current.continuous = true
            recognitionRef.current.start()
            setIsListening(true)

            // 自動モード かつ noInitialTimer でない場合: 初回タイマーをセット
            if (recordingModeRef.current === 'auto' && !noInitialTimer) {
                autoStopTimerRef.current = setTimeout(() => {
                    recognitionRef.current?.stop()
                }, autoStopSecondsRef.current * 1000)
            }
            // noInitialTimer の場合: 初回タイマーなし（ユーザーが話し始めるまで待つ）
        } catch (e) {
            console.error('Failed to start recognition:', e)
        }
    }, [currentLanguage.speechLang])

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return
        // 意図的な停止であることをマーク
        manualStopRef.current = true
        noInitialTimerRef.current = false
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

        // Chrome の onend 未発火バグ対策: 二重呼び出し防止付きハンドラー
        let ended = false
        let watchdogTimer = null
        let resumeTimer = null

        const handleEnd = () => {
            if (ended) return
            ended = true
            if (watchdogTimer) { clearInterval(watchdogTimer); watchdogTimer = null }
            if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null }
            setIsSpeaking(false)
            if (onEnd) onEnd()
        }

        utterance.onstart = () => {
            setIsSpeaking(true)

            // Chrome workaround: 長い発話で音声が途中停止するのを防ぐ定期的な pause/resume
            resumeTimer = setInterval(() => {
                if (synthRef.current?.speaking) {
                    synthRef.current.pause()
                    synthRef.current.resume()
                }
            }, 14000)

            // Watchdog: onend が発火しなかった場合のフォールバック検知
            watchdogTimer = setInterval(() => {
                if (!synthRef.current?.speaking) {
                    handleEnd()
                }
            }, 500)
        }
        utterance.onend = handleEnd
        utterance.onerror = () => {
            if (watchdogTimer) { clearInterval(watchdogTimer); watchdogTimer = null }
            if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null }
            setIsSpeaking(false)
        }

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
