import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AIProviderContext = createContext(null)

const STORAGE_KEY = 'lingoflow_ai_provider'
const API_KEYS_STORAGE_KEY = 'lingoflow_api_keys'
const MODEL_STORAGE_KEY = 'lingoflow_ai_model'

export function AIProviderProvider({ children }) {
    const [provider, setProvider] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) || 'gemini'
        } catch {
            return 'gemini'
        }
    })

    const [apiKeys, setApiKeys] = useState(() => {
        try {
            const saved = localStorage.getItem(API_KEYS_STORAGE_KEY)
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })

    const [selectedModels, setSelectedModels] = useState(() => {
        try {
            const saved = localStorage.getItem(MODEL_STORAGE_KEY)
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })

    // localStorageへ永続化
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, provider)
        } catch { /* ignore */ }
    }, [provider])

    useEffect(() => {
        try {
            localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys))
        } catch { /* ignore */ }
    }, [apiKeys])

    useEffect(() => {
        try {
            localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(selectedModels))
        } catch { /* ignore */ }
    }, [selectedModels])

    const switchProvider = useCallback((newProvider) => {
        setProvider(newProvider)
    }, [])

    const setApiKey = useCallback((providerId, key) => {
        const trimmedKey = key ? key.trim() : ''
        setApiKeys(prev => ({ ...prev, [providerId]: trimmedKey }))
    }, [])

    const setSelectedModel = useCallback((providerId, modelId) => {
        setSelectedModels(prev => ({ ...prev, [providerId]: modelId }))
    }, [])

    const clearAllApiKeys = useCallback(() => {
        setApiKeys({})
        try {
            localStorage.removeItem(API_KEYS_STORAGE_KEY)
        } catch { /* ignore */ }
    }, [])

    const getSelectedModel = useCallback((providerId = null) => {
        const pid = providerId || provider
        return selectedModels[pid] || ''
    }, [provider, selectedModels])

    /**
     * 現在のプロバイダーの有効なAPIキーを取得
     * Reactのステートやクロージャの不整合を回避するための絶対的なフォールバックを含む
     */
    const getActiveApiKey = useCallback((providerId = null) => {
        // providerが明示されていない場合、ステートまたはlocalStorageから現在のproviderを特定
        const pid = providerId || provider || localStorage.getItem(STORAGE_KEY) || 'gemini'

        // 1. 最優先: React state (もし正常に最新化されていればこれを使う)
        if (apiKeys && typeof apiKeys === 'object' && apiKeys[pid]) {
            return apiKeys[pid]
        }

        // 2. 強力なフォールバック: localStorageから直接読み取り (クロージャ不整合/ステート遅延対策)
        try {
            const rawKeys = localStorage.getItem(API_KEYS_STORAGE_KEY)
            if (rawKeys) {
                const parsed = JSON.parse(rawKeys)
                if (parsed && typeof parsed === 'object' && parsed[pid]) {
                    return parsed[pid]
                }
            }
        } catch { /* ignore */ }

        // 3. 最終フォールバック: 環境変数 .env
        if (pid === 'gemini') {
            return import.meta.env.VITE_GEMINI_API_KEY || ''
        }
        if (pid === 'openai') {
            return import.meta.env.VITE_OPENAI_API_KEY || ''
        }

        return ''
    }, [provider, apiKeys])

    return (
        <AIProviderContext.Provider value={{
            provider,
            apiKeys,
            selectedModels,
            switchProvider,
            setApiKey,
            setSelectedModel,
            getSelectedModel,
            getActiveApiKey,
            clearAllApiKeys,
        }}>
            {children}
        </AIProviderContext.Provider>
    )
}

export function useAIProvider() {
    const ctx = useContext(AIProviderContext)
    if (!ctx) throw new Error('useAIProvider must be used within AIProviderProvider')
    return ctx
}
