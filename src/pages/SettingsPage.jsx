import { useState } from 'react'
import { Globe, Volume2, Mic, Info, Cpu, Eye, EyeOff, Loader, CheckCircle, XCircle, Trash2, User } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useSpeech } from '../contexts/SpeechContext'
import { useAIProvider } from '../contexts/AIProviderContext'
import { useProgress } from '../contexts/ProgressContext'
import { AI_PROVIDERS, testAIConnection, fetchAvailableModels } from '../services/aiService'
import pkg from '../../package.json'
import './SettingsPage.css'

export default function SettingsPage() {
    const { currentLanguage, availableLanguages, switchLanguage } = useLanguage()
    const { isSupported, recordingMode, setRecordingMode, autoStopSeconds, setAutoStopSeconds, hideTextInChat, setHideTextInChat, autoListenAfterAI, setAutoListenAfterAI } = useSpeech()
    const { provider, switchProvider, apiKeys, setApiKey, getActiveApiKey, selectedModels, setSelectedModel, clearAllApiKeys } = useAIProvider()
    const { username, setUsername, resetProgress } = useProgress()

    const [showKeys, setShowKeys] = useState({})
    const [testStatus, setTestStatus] = useState({})
    const [testing, setTesting] = useState({})
    const [customModelMode, setCustomModelMode] = useState({})
    const [fetchedModels, setFetchedModels] = useState({})
    const [fetchingModels, setFetchingModels] = useState({})
    const [fetchModelStatus, setFetchModelStatus] = useState({})

    const toggleShowKey = (providerId) => {
        setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }))
    }

    const handleTestConnection = async (providerId) => {
        const key = getActiveApiKey(providerId)
        if (!key) {
            setTestStatus({ [providerId]: { success: false, message: 'APIキーが設定されていません。' } })
            return
        }
        setTesting(prev => ({ ...prev, [providerId]: true }))
        setTestStatus(prev => ({ ...prev, [providerId]: null }))
        try {
            const currentModel = selectedModels[providerId] || AI_PROVIDERS[providerId]?.defaultModel
            const result = await testAIConnection(providerId, key, currentModel)
            setTestStatus(prev => ({ ...prev, [providerId]: result }))
        } finally {
            setTesting(prev => ({ ...prev, [providerId]: false }))
        }
    }

    const handleFetchModels = async (providerId) => {
        const key = getActiveApiKey(providerId)
        if (!key) {
            setFetchModelStatus(prev => ({ ...prev, [providerId]: { success: false, message: 'APIキーが必要です。先にAPIキーを入力してください。' } }))
            return
        }
        setFetchingModels(prev => ({ ...prev, [providerId]: true }))
        setFetchModelStatus(prev => ({ ...prev, [providerId]: null }))
        try {
            const result = await fetchAvailableModels(providerId, key)
            if (result.success) {
                setFetchedModels(prev => ({ ...prev, [providerId]: result.models }))
            }
            setFetchModelStatus(prev => ({ ...prev, [providerId]: result }))
        } finally {
            setFetchingModels(prev => ({ ...prev, [providerId]: false }))
        }
    }

    return (
        <div className="page-content settings-page">
            <header className="settings-header">
                <h1 className="settings-title">設定</h1>
            </header>

            {/* User Profile */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <User size={18} />
                    ユーザープロフィール
                </h2>
                <div className="settings-card glass-card">
                    <div className="settings-item-col">
                        <label className="provider-key-label">ユーザー名</label>
                        <div className="username-input-row">
                            <input
                                type="text"
                                className="provider-key-input"
                                placeholder="名前を入力..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <p className="settings-hint">AIはこの名前であなたを呼びます。</p>
                    </div>
                </div>
            </div>

            {/* AI Provider Selection */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Cpu size={18} />
                    AIプロバイダー
                </h2>
                <div className="provider-list">
                    {Object.values(AI_PROVIDERS).map((p) => (
                        <div key={p.id} className={`provider-card glass-card ${p.id === provider ? 'provider-card--active' : ''}`}>
                            <button
                                className="provider-select-btn"
                                onClick={() => switchProvider(p.id)}
                            >
                                <span className="provider-icon emoji">{p.icon}</span>
                                <div className="provider-info">
                                    <span className="provider-name">{p.name}</span>
                                    <span className="provider-desc">{p.description}</span>
                                </div>
                                {p.id === provider && (
                                    <span className="provider-check">✓ 使用中</span>
                                )}
                            </button>

                            <div className="provider-key-section">
                                <label className="provider-key-label">APIキー</label>
                                <div className="provider-key-input-row">
                                    <input
                                        type={showKeys[p.id] ? 'text' : 'password'}
                                        className="provider-key-input"
                                        placeholder={p.keyPlaceholder}
                                        value={apiKeys[p.id] || ''}
                                        onChange={(e) => setApiKey(p.id, e.target.value)}
                                    />
                                    <button
                                        className="provider-key-toggle"
                                        onClick={() => toggleShowKey(p.id)}
                                        title={showKeys[p.id] ? 'キーを隠す' : 'キーを表示'}
                                    >
                                        {showKeys[p.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {!apiKeys[p.id] && getActiveApiKey(p.id) && (
                                    <p className="provider-key-hint">.envのキーを使用中</p>
                                )}
                                <button
                                    className="provider-test-btn"
                                    onClick={() => handleTestConnection(p.id)}
                                    disabled={testing[p.id]}
                                >
                                    {testing[p.id] ? (
                                        <><Loader size={14} className="spin" /> テスト中...</>
                                    ) : (
                                        '接続テスト'
                                    )}
                                </button>
                                {testStatus[p.id] && (
                                    <div className={`provider-test-result ${testStatus[p.id].success ? 'provider-test-result--success' : 'provider-test-result--error'}`}>
                                        {testStatus[p.id].success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        <span>{testStatus[p.id].message}</span>
                                    </div>
                                )}
                            </div>

                            {/* Model Selection */}
                            <div className="provider-model-section">
                                <label className="provider-key-label">モデル</label>
                                <button
                                    className="fetch-models-btn"
                                    onClick={() => handleFetchModels(p.id)}
                                    disabled={fetchingModels[p.id]}
                                >
                                    {fetchingModels[p.id] ? (
                                        <><Loader size={16} className="spin" /> モデル一覧を取得中...</>
                                    ) : (
                                        <>🔄 利用可能なモデル一覧を取得</>
                                    )}
                                </button>
                                {fetchModelStatus[p.id] && (
                                    <div className={`fetch-model-status ${fetchModelStatus[p.id].success ? 'fetch-model-status--success' : 'fetch-model-status--error'}`}>
                                        {fetchModelStatus[p.id].success ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        <span>{fetchModelStatus[p.id].message}</span>
                                    </div>
                                )}
                                {fetchedModels[p.id] && fetchedModels[p.id].length > 0 ? (
                                    <>
                                        <select
                                            className="provider-model-select"
                                            value={customModelMode[p.id] ? '__custom__' : (selectedModels[p.id] || p.defaultModel)}
                                            onChange={(e) => {
                                                if (e.target.value === '__custom__') {
                                                    setCustomModelMode(prev => ({ ...prev, [p.id]: true }))
                                                } else {
                                                    setCustomModelMode(prev => ({ ...prev, [p.id]: false }))
                                                    setSelectedModel(p.id, e.target.value)
                                                }
                                            }}
                                        >
                                            {fetchedModels[p.id].map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}{m.description ? ` — ${m.description}` : ''}
                                                </option>
                                            ))}
                                            {p.allowCustomModel && (
                                                <option value="__custom__">✏️ カスタムモデル名を入力...</option>
                                            )}
                                        </select>
                                        {customModelMode[p.id] && (
                                            <div className="custom-model-input-row">
                                                <input
                                                    type="text"
                                                    className="provider-key-input"
                                                    placeholder="例: gemini-2.5-pro-preview-06-05"
                                                    value={selectedModels[p.id] || ''}
                                                    onChange={(e) => setSelectedModel(p.id, e.target.value)}
                                                />
                                                <p className="settings-hint">APIで使用するモデル名を直接入力できます。</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="model-placeholder">
                                        <p>↑ 上のボタンを押して、利用可能なモデルを取得してください</p>
                                        {selectedModels[p.id] && (
                                            <p className="model-placeholder-current">現在のモデル: <strong>{selectedModels[p.id]}</strong></p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Language Selection */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Globe size={18} />
                    学習言語
                </h2>
                <div className="language-list">
                    {availableLanguages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-option glass-card ${lang.code === currentLanguage.code ? 'language-option--active' : ''}`}
                            onClick={() => switchLanguage(lang.code)}
                        >
                            <span className="language-flag emoji">{lang.flag}</span>
                            <div className="language-info">
                                <span className="language-name">{lang.nativeName}</span>
                                <span className="language-name-en">{lang.name}</span>
                            </div>
                            {lang.code === currentLanguage.code && (
                                <span className="language-check">✓ 使用中</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Speech Settings */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Volume2 size={18} />
                    音声設定
                </h2>
                <div className="settings-card glass-card">
                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Mic size={18} />
                            <span>音声認識</span>
                        </div>
                        <span className={`settings-status ${isSupported ? 'settings-status--ok' : 'settings-status--error'}`}>
                            {isSupported ? '対応済み' : '非対応'}
                        </span>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Volume2 size={18} />
                            <span>音声合成</span>
                        </div>
                        <span className="settings-status settings-status--ok">対応済み</span>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Globe size={18} />
                            <span>認識言語</span>
                        </div>
                        <span className="settings-value">{currentLanguage.speechLang}</span>
                    </div>
                </div>
            </div>

            {/* Recording Settings */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Mic size={18} />
                    録音設定
                </h2>
                <div className="settings-card glass-card">
                    <div className="recording-mode-section">
                        <label className="provider-key-label">録音モード</label>
                        <div className="recording-mode-toggle">
                            <button
                                className={`recording-mode-btn ${recordingMode === 'manual' ? 'recording-mode-btn--active' : ''}`}
                                onClick={() => setRecordingMode('manual')}
                            >
                                <span className="recording-mode-icon">✋</span>
                                <div className="recording-mode-info">
                                    <span className="recording-mode-name">手動モード</span>
                                    <span className="recording-mode-desc">ボタンで開始/停止</span>
                                </div>
                                {recordingMode === 'manual' && <span className="recording-mode-check">✓</span>}
                            </button>
                            <button
                                className={`recording-mode-btn ${recordingMode === 'auto' ? 'recording-mode-btn--active' : ''}`}
                                onClick={() => setRecordingMode('auto')}
                            >
                                <span className="recording-mode-icon">⚡</span>
                                <div className="recording-mode-info">
                                    <span className="recording-mode-name">自動モード</span>
                                    <span className="recording-mode-desc">話し終わると自動送信</span>
                                </div>
                                {recordingMode === 'auto' && <span className="recording-mode-check">✓</span>}
                            </button>
                        </div>
                    </div>
                    {recordingMode === 'auto' && (
                        <div className="settings-item-col">
                            <div className="settings-item-info-between">
                                <span>自動停止までの時間</span>
                                <span className="settings-value">{autoStopSeconds}秒</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={autoStopSeconds}
                                onChange={(e) => setAutoStopSeconds(Number(e.target.value))}
                                className="settings-slider"
                            />
                            <p className="settings-hint">発音が止まってから自動的に録音を終了するまでの時間です。</p>
                        </div>
                    )}
                    <p className="settings-desc-text">
                        {recordingMode === 'manual'
                            ? '🎙️ マイクボタンをもう一度押すと録音が終了します。じっくり話したい場合に最適です。'
                            : '⚡ 話し終えると自動的にAIに送信されます。テンポよく会話したい場合に最適です。'}
                    </p>
                </div>
            </div>

            {/* Chat Display Settings */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Eye size={18} />
                    チャット表示設定
                </h2>
                <div className="settings-card glass-card">
                    <div className="settings-item">
                        <div className="settings-item-info">
                            {hideTextInChat ? <EyeOff size={18} /> : <Eye size={18} />}
                            <div>
                                <span>テキスト非表示モード</span>
                                <p className="settings-hint">チャットの文字をぼかし表示にし、リスニング練習に集中できます</p>
                            </div>
                        </div>
                        <button
                            className={`settings-toggle-btn ${hideTextInChat ? 'settings-toggle-btn--active' : ''}`}
                            onClick={() => setHideTextInChat(!hideTextInChat)}
                        >
                            <div className="settings-toggle-knob" />
                        </button>
                    </div>
                    <p className="settings-desc-text">
                        {hideTextInChat
                            ? '🙈 テキストがぼかし表示になります。各メッセージの👁️ボタンで個別に表示できます。'
                            : '👁️ テキストは通常通り表示されます。トーク画面のヘッダーからも切り替え可能です。'}
                    </p>

                    <div className="settings-item" style={{ marginTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
                        <div className="settings-item-info">
                            <Mic size={18} />
                            <div>
                                <span>AI応答後に自動録音</span>
                                <p className="settings-hint">AIの読み上げが終わったら自動的にマイクを開始します</p>
                            </div>
                        </div>
                        <button
                            className={`settings-toggle-btn ${autoListenAfterAI ? 'settings-toggle-btn--active' : ''}`}
                            onClick={() => setAutoListenAfterAI(!autoListenAfterAI)}
                        >
                            <div className="settings-toggle-knob" />
                        </button>
                    </div>
                    <p className="settings-desc-text">
                        {autoListenAfterAI
                            ? '🎙️ AIが話し終わったら自動で録音を開始します。テンポよく会話したい場合に最適です。'
                            : '🔇 手動でマイクボタンを押してから録音を開始します。'}
                    </p>
                </div>
            </div>

            {/* Data Management */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Trash2 size={18} />
                    データ管理
                </h2>
                <div className="settings-card glass-card">
                    <div className="settings-item-col">
                        <div className="settings-item-info-between">
                            <div>
                                <span className="settings-data-title">学習記録リセット</span>
                                <p className="settings-hint">XP、ストリーク、完了レッスンなどを初期化します</p>
                            </div>
                            <button
                                className="settings-reset-btn settings-reset-btn--warning"
                                onClick={() => {
                                    if (window.confirm('学習記録をすべてリセットします。よろしいですか？'))
                                        resetProgress()
                                }}
                            >
                                リセット
                            </button>
                        </div>
                    </div>
                    <div className="settings-item-col">
                        <div className="settings-item-info-between">
                            <div>
                                <span className="settings-data-title">APIキー削除</span>
                                <p className="settings-hint">保存済みのAPIキーをすべて削除します</p>
                            </div>
                            <button
                                className="settings-reset-btn settings-reset-btn--warning"
                                onClick={() => {
                                    if (window.confirm('保存済みのAPIキーをすべて削除します。よろしいですか？'))
                                        clearAllApiKeys()
                                }}
                            >
                                削除
                            </button>
                        </div>
                    </div>
                    <div className="settings-item-col">
                        <div className="settings-item-info-between">
                            <div>
                                <span className="settings-data-title settings-data-title--danger">全データ初期化</span>
                                <p className="settings-hint">学習記録、APIキー、設定をすべて初期化します</p>
                            </div>
                            <button
                                className="settings-reset-btn settings-reset-btn--danger"
                                onClick={() => {
                                    if (window.confirm('すべてのデータを初期化します。この操作は元に戻せません。本当によろしいですか？')) {
                                        resetProgress()
                                        clearAllApiKeys()
                                        // その他のlocalStorageデータも削除
                                        localStorage.removeItem('lingoflow_recording_mode')
                                        localStorage.removeItem('lingoflow_auto_stop_seconds')
                                        localStorage.removeItem('lingoflow_ai_provider')
                                        localStorage.removeItem('lingoflow_ai_model')
                                        localStorage.removeItem('lingoflow_language')
                                        window.location.reload()
                                    }
                                }}
                            >
                                初期化
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="settings-section">
                <h2 className="settings-section-title">
                    <Info size={18} />
                    アプリについて
                </h2>
                <div className="settings-card glass-card">
                    <div className="settings-item">
                        <span>アプリ名</span>
                        <span className="settings-value">LingoFlow</span>
                    </div>
                    <div className="settings-item">
                        <span>バージョン</span>
                        <span className="settings-value">{pkg.version}</span>
                    </div>
                    <div className="settings-item">
                        <span>AIエンジン</span>
                        <span className="settings-value">{AI_PROVIDERS[provider]?.name || 'Gemini'}</span>
                    </div>
                    <div className="settings-item">
                        <span>音声エンジン</span>
                        <span className="settings-value">Web Speech API</span>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="settings-tips glass-card">
                <p className="settings-tips-title">💡 ヒント</p>
                <ul className="settings-tips-list">
                    <li>Chrome または Edge ブラウザで最良の音声認識性能を得られます</li>
                    <li>静かな環境で練習すると認識精度が向上します</li>
                    <li>学習言語を切り替えることで、他の言語も練習できます</li>
                    <li>AIプロバイダーを切り替えて、異なるAIとの会話を体験できます</li>
                </ul>
            </div>
        </div>
    )
}
