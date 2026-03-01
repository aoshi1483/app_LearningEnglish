/**
 * 統一AIサービス
 * Gemini API と OpenAI API の両方に対応。
 * AISettingsContext の設定に基づいて適切なAPIを呼び出す。
 */

/**
 * AIプロバイダー情報（設定ページで使用）
 */
// .env からデフォルトモデルを動的取得（Vite環境変数）
const ENV_GEMINI_MODEL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_DEFAULT_MODEL;
const ENV_OPENAI_MODEL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_DEFAULT_MODEL;

export const AI_PROVIDERS = {
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        icon: '✨',
        description: 'Gemini 2.5 / 2.0 / 1.5',
        keyPlaceholder: 'AIzaSy...',
        helpUrl: 'https://aistudio.google.com/app/apikey',
        models: [
            { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash (Preview)', description: '最新・高速' },
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '高速・安定' },
            { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: '超軽量' },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'レガシー安定版' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'レガシー高性能' },
        ],
        // .env > ハードコードのフォールバック
        defaultModel: ENV_GEMINI_MODEL || 'gemini-2.0-flash',
        // カスタムモデル入力を許可
        allowCustomModel: true,
    },
    openai: {
        id: 'openai',
        name: 'OpenAI (ChatGPT)',
        icon: '🤖',
        description: 'GPT-4o / GPT-4o mini',
        keyPlaceholder: 'sk-...',
        helpUrl: 'https://platform.openai.com/api-keys',
        models: [
            { id: 'gpt-4o-mini', name: 'GPT-4o mini', description: '高速・低コスト' },
            { id: 'gpt-4o', name: 'GPT-4o', description: '高性能' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'バランス型' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '最も軽量' },
        ],
        defaultModel: ENV_OPENAI_MODEL || 'gpt-4o-mini',
        allowCustomModel: true,
    },
}
/**
 * APIから利用可能なモデル一覧を動的に取得
 * @param {string} provider - 'gemini' | 'openai'
 * @param {string} apiKey - APIキー
 * @returns {Promise<{success: boolean, models: Array, message?: string}>}
 */
export async function fetchAvailableModels(provider, apiKey) {
    if (!apiKey || apiKey.trim().length === 0) {
        return { success: false, models: [], message: 'APIキーが必要です。' }
    }

    try {
        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
            const res = await fetch(url)

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                return {
                    success: false,
                    models: [],
                    message: err?.error?.message || `取得失敗 (${res.status})`
                }
            }

            const data = await res.json()
            if (!data.models || data.models.length === 0) {
                return { success: false, models: [], message: 'モデルが見つかりませんでした。' }
            }

            // Step 1: パターンフィルタで明らかに不要なモデルを除外（API呼び出し回数を削減）
            const EXCLUDE_PATTERNS = [
                /embedding/i, /aqa/i, /tunedmodel/i, /imagen/i, /veo/i, /^models\/chat-/,
            ]
            const candidates = data.models
                .filter(m => {
                    if (!m.supportedGenerationMethods?.includes('generateContent')) return false
                    const id = m.name || ''
                    if (!id.startsWith('models/gemini-')) return false
                    return !EXCLUDE_PATTERNS.some(p => p.test(id))
                })
                .map(m => ({
                    id: m.name.replace('models/', ''),
                    name: m.displayName || m.name.replace('models/', ''),
                    description: m.description?.substring(0, 50) || '',
                }))

            // Step 2: 各候補に軽量テストリクエストを並列で送り、実際に使えるか検証
            const testResults = await Promise.allSettled(
                candidates.map(async (model) => {
                    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${apiKey}`
                    const controller = new AbortController()
                    const timeout = setTimeout(() => controller.abort(), 8000)
                    try {
                        const testRes = await fetch(testUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            signal: controller.signal,
                            body: JSON.stringify({
                                contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
                                generationConfig: { maxOutputTokens: 1 },
                            }),
                        })
                        clearTimeout(timeout)
                        // 200 OK = 使用可能、404 = モデル不存在、その他 = 使用不可
                        return testRes.ok ? model : null
                    } catch {
                        clearTimeout(timeout)
                        return null
                    }
                })
            )

            const verifiedModels = testResults
                .map(r => r.status === 'fulfilled' ? r.value : null)
                .filter(Boolean)
                // 新しいモデルを優先的に先頭に表示
                .sort((a, b) => {
                    const versionA = a.id.match(/gemini-(\d+\.\d+)/)?.[1] || '0'
                    const versionB = b.id.match(/gemini-(\d+\.\d+)/)?.[1] || '0'
                    return parseFloat(versionB) - parseFloat(versionA) || a.id.localeCompare(b.id)
                })

            return {
                success: true,
                models: verifiedModels,
                message: `${verifiedModels.length}個の利用可能なモデルを確認しました（${candidates.length}個中）。`
            }
        }

        if (provider === 'openai') {
            // OpenAI の場合はハードコードリストを返す（/v1/models APIは全モデルが混在するため）
            return {
                success: true,
                models: AI_PROVIDERS.openai.models,
                message: 'OpenAIのモデルリストを取得しました。'
            }
        }

        return { success: false, models: [], message: '不明なプロバイダーです。' }
    } catch (error) {
        console.error('fetchAvailableModels error:', error)
        return { success: false, models: [], message: `通信エラー: ${error.message}` }
    }
}

/**
 * 学習言語に応じたシステムプロンプトを生成
 */
function buildSystemPrompt(targetLang, scenario, username = 'User') {
    const langNames = {
        en: 'English', es: 'Spanish', fr: 'French', zh: 'Chinese', ko: 'Korean',
    }
    const lang = langNames[targetLang] || 'English'

    let prompt = `You are a friendly and encouraging ${lang} conversation partner for a Japanese learner named ${username}.

IMPORTANT RULES:
- Always respond in ${lang} only.
- Keep responses conversational, natural, and engaging. Aim for a response length of 3-5 sentences to provide meaningful interaction.
- Ensure your response is complete and does not cut off mid-sentence.
- Gently correct grammar or vocabulary mistakes by naturally incorporating the correct form, and briefly explain the correction if it's a common mistake.
- Encourage the user and make the conversation enjoyable.
- Ask open-ended follow-up questions to keep the conversation going.
- Adapt language complexity to the user's level.`

    if (scenario) {
        const situation = typeof scenario.situation === 'object'
            ? (scenario.situation[targetLang] || scenario.situation['en'] || '')
            : (scenario.situation || '')
        const aiRole = typeof scenario.aiRole === 'object'
            ? (scenario.aiRole[targetLang] || scenario.aiRole['en'] || 'Conversation partner')
            : (scenario.aiRole || 'Conversation partner')

        prompt += `\n\nSCENARIO:
- Situation: ${situation}
- Your role: ${aiRole}
- Stay in character within this scenario.
- When the conversation has naturally reached its conclusion (e.g., the transaction is complete, the greeting is finished, the question has been answered, or the scenario's purpose has been fulfilled), add the marker [LESSON_COMPLETE] at the very end of your response. Do NOT add this marker prematurely; only when the scenario is truly complete.
- Do NOT mention the marker to the user. Just append it silently at the end.`
    }

    return prompt
}

/**
 * Gemini API を呼び出す
 */
async function callGemini(userText, history, systemPrompt, apiKey, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    // メッセージ履歴の構築
    // history に既に今回の userText が含まれている場合は二重に追加しない
    const contents = history.filter(m => m.text?.trim()).map(m => ({
        role: m.isAI ? 'model' : 'user',
        parts: [{ text: m.text }],
    }))

    // 履歴の最後が user でない場合のみ、現在の入力を追加（安全策）
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
        contents.push({ role: 'user', parts: [{ text: userText }] })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒タイムアウト

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: { temperature: 0.8, topP: 0.9, maxOutputTokens: 1024 },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ],
            }),
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            console.error('Gemini API error:', res.status, err)
            throw new Error(err?.error?.message || `API error: ${res.status}`)
        }

        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
            // 安全フィルターなどでブロックされた場合
            if (data?.promptFeedback?.blockReason) {
                throw new Error(`AI generated no response (Reason: ${data.promptFeedback.blockReason})`)
            }
            throw new Error('AI generated an empty response.')
        }
        return text.trim()
    } catch (error) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
            throw new Error('Connection timed out. Please try again.')
        }
        throw error
    }
}

/**
 * OpenAI API を呼び出す
 */
async function callOpenAI(userText, history, systemPrompt, apiKey, model) {
    const url = 'https://api.openai.com/v1/chat/completions'

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.filter(m => m.text?.trim()).map(m => ({
            role: m.isAI ? 'assistant' : 'user',
            content: m.text,
        })),
    ]

    // 履歴の最後が user でない場合のみ追加
    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
        messages.push({ role: 'user', content: userText })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.8,
                max_tokens: 1024,
            }),
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            console.error('OpenAI API error:', res.status, err)
            throw new Error(err?.error?.message || `API error: ${res.status}`)
        }

        const data = await res.json()
        const text = data?.choices?.[0]?.message?.content
        if (!text) throw new Error('OpenAI returned an empty response.')
        return text.trim()
    } catch (error) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
            throw new Error('Connection timed out. Please try again.')
        }
        throw error
    }
}

/**
 * 統一AIレスポンス関数
 * SpeakingPracticePage から呼ばれる形式に合わせたインターフェース
 *
 * @param {string} provider - 'gemini' | 'openai'
 * @param {string} userText - ユーザーの入力テキスト
 * @param {Array} conversationHistory - 過去の会話
 * @param {string} targetLang - 学習対象言語コード
 * @param {Object} scenario - シナリオ情報
 * @param {string} apiKey - APIキー
 * @param {string} model - モデル名（オプション）
 * @returns {Promise<string>}
 */
export async function getAIResponse(provider, userText, conversationHistory = [], targetLang = 'en', scenario = null, apiKey = '', model = '', username = 'User') {
    // クロージャの不整合でapiKeyが空で渡された場合のフォールバック
    let resolvedKey = apiKey ? apiKey.trim() : '';

    if (!resolvedKey) {
        // フォールバック1: localStorageから直接取得
        try {
            const savedKeys = localStorage.getItem('lingoflow_api_keys');
            if (savedKeys) {
                const parsed = JSON.parse(savedKeys);
                const pid = provider || localStorage.getItem('lingoflow_ai_provider') || 'gemini';
                if (parsed && parsed[pid]) {
                    resolvedKey = parsed[pid];
                    console.log('[aiService] Fallback: API key retrieved from localStorage');
                }
            }
        } catch { /* ignore */ }
    }

    if (!resolvedKey) {
        // フォールバック2: 環境変数 (.env)
        if (provider === 'gemini' || !provider) {
            resolvedKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        } else if (provider === 'openai') {
            resolvedKey = import.meta.env.VITE_OPENAI_API_KEY || '';
        }
        if (resolvedKey) {
            console.log('[aiService] Fallback: API key retrieved from .env');
        }
    }

    if (!resolvedKey) {
        return '⚠️ APIキーが設定されていません。設定ページ（⚙️）からAPIキーを入力してください。'
    }

    const systemPrompt = buildSystemPrompt(targetLang, scenario, username)

    try {
        if (provider === 'openai') {
            return await callOpenAI(userText, conversationHistory, systemPrompt, resolvedKey, model || AI_PROVIDERS.openai.defaultModel)
        } else {
            return await callGemini(userText, conversationHistory, systemPrompt, resolvedKey, model || AI_PROVIDERS.gemini.defaultModel)
        }
    } catch (error) {
        console.error('AI response error:', error)
        const msg = error.message.toLowerCase()
        if (msg.includes('401') || msg.includes('403') || msg.includes('invalid') || msg.includes('key')) {
            return `⚠️ APIキーが無効です。設定ページで正しいキーを入力してください。(${error.message})`
        }
        if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
            return `⚠️ 利用制限(Quota)に達しました。しばらく待つか、別のモデル/プロバイダーを試してください。(${error.message})`
        }
        if (msg.includes('timeout') || msg.includes('abort')) {
            return '⚠️ タイムアウトです。ネットワーク接続を確認してもう一度お試しください。'
        }
        return `⚠️ エラーが発生しました: ${error.message}`
    }
}

/**
 * API接続テスト
 * 設定ページの「接続テスト」ボタンで使用
 * @param {string} provider - 'gemini' | 'openai'
 * @param {string} apiKey - APIキー
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testAIConnection(provider, apiKey, model = '') {
    if (!apiKey || apiKey.trim().length === 0) {
        return { success: false, message: 'APIキーが入力されていません。' }
    }

    // 選択中のモデルを使用（指定がなければデフォルト）
    const testModel = model || AI_PROVIDERS[provider]?.defaultModel || '';

    try {
        if (provider === 'gemini') {
            const geminiModel = testModel || 'gemini-2.0-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'Say "OK" in one word.' }] }],
                    generationConfig: { maxOutputTokens: 10 },
                }),
            })
            if (res.ok) {
                return { success: true, message: `✅ Gemini API に正常に接続できました！ (モデル: ${geminiModel})` }
            }
            const err = await res.json().catch(() => ({}))
            const errMsg = err?.error?.message || `接続失敗 (${res.status})`;
            // モデルが見つからない場合のヒント
            if (res.status === 404 || errMsg.toLowerCase().includes('not found')) {
                return { success: false, message: `モデル "${geminiModel}" が見つかりません。モデル名を確認してください。\n${errMsg}` }
            }
            return { success: false, message: errMsg }
        }

        if (provider === 'openai') {
            const openaiModel = testModel || 'gpt-4o-mini';
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: openaiModel,
                    messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
                    max_tokens: 5,
                }),
            })
            if (res.ok) {
                return { success: true, message: `✅ OpenAI API に正常に接続できました！ (モデル: ${openaiModel})` }
            }
            const err = await res.json().catch(() => ({}))
            const errMsg = err?.error?.message || `接続失敗 (${res.status})`;
            if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('does not exist')) {
                return { success: false, message: `モデル "${openaiModel}" が見つかりません。モデル名を確認してください。\n${errMsg}` }
            }
            return { success: false, message: errMsg }
        }

        return { success: false, message: '不明なプロバイダーです。' }
    } catch (error) {
        console.error('Connection test error:', error)
        return { success: false, message: `接続エラー: ${error.message}` }
    }
}
