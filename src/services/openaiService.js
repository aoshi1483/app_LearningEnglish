/**
 * OpenAI (ChatGPT) サービス
 * OpenAI Chat Completions API を使用してリアルタイムの会話応答を生成する。
 */

const API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * 学習言語に応じたシステムプロンプトを生成
 */
function buildSystemPrompt(targetLang, scenario) {
    const langNames = {
        en: { name: 'English', native: '英語' },
        es: { name: 'Spanish', native: 'スペイン語' },
        fr: { name: 'French', native: 'フランス語' },
        zh: { name: 'Chinese', native: '中国語' },
        ko: { name: 'Korean', native: '韓国語' },
    }

    const lang = langNames[targetLang] || langNames.en

    let systemPrompt = `You are a friendly and encouraging ${lang.name} conversation partner for a Japanese learner.

IMPORTANT RULES:
- Always respond in ${lang.name} only.
- Keep your responses conversational, natural, and engaging. Aim for 3-5 sentences to allow for more depth in the conversation.
- Ensure your response is complete and does not cut off mid-sentence.
- Gently correct any grammar or vocabulary mistakes the user makes by naturally incorporating the correct form in your response, and occasionally provide a brief explanation for the correction.
- Encourage the user and make the conversation enjoyable.
- Ask open-ended follow-up questions to keep the conversation going.
- If the user seems stuck, offer gentle prompts or suggestions.
- Adapt your language complexity to match the user's level.`

    if (scenario) {
        systemPrompt += `\n\nSCENARIO CONTEXT:
- Situation: ${scenario.situation || ''}
- Your role: ${scenario.aiRole || 'Conversation partner'}
- Guide the conversation naturally within this scenario context.`
    }

    return systemPrompt
}

/**
 * 会話履歴をOpenAI API形式に変換
 */
function formatHistory(messages) {
    return messages
        .filter(m => m.text && m.text.trim().length > 0)
        .map(m => ({
            role: m.isAI ? 'assistant' : 'user',
            content: m.text,
        }))
}

/**
 * OpenAI API を呼び出してAI応答を取得
 * @param {string} userText - ユーザーの入力テキスト
 * @param {Array} conversationHistory - 過去の会話履歴
 * @param {string} targetLang - 学習対象言語コード
 * @param {Object} scenario - シナリオ情報（オプション）
 * @param {string} apiKey - OpenAI APIキー
 * @returns {Promise<string>} AI応答テキスト
 */
export async function getOpenAIResponse(userText, conversationHistory = [], targetLang = 'en', scenario = null, apiKey = null) {
    const key = apiKey || import.meta.env.VITE_OPENAI_API_KEY
    if (!key) {
        return "OpenAI APIキーが設定されていません。設定ページでAPIキーを入力してください。"
    }

    const systemPrompt = buildSystemPrompt(targetLang, scenario)
    const history = formatHistory(conversationHistory)

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userText },
    ]

    const MAX_RETRIES = 3

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages,
                    temperature: 0.8,
                    max_tokens: 1024,
                    top_p: 0.9,
                }),
            })

            if (response.status === 429) {
                console.warn(`OpenAI API rate limit hit (attempt ${attempt + 1}/${MAX_RETRIES + 1})`)
                if (attempt < MAX_RETRIES) {
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
                    await new Promise(resolve => setTimeout(resolve, delay))
                    continue
                }
                return "リクエストが多すぎるため、しばらく待ってからもう一度お試しください。(Rate limit exceeded)"
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('OpenAI API error:', response.status, errorData)
                if (response.status === 401) {
                    return "APIキーが無効です。設定ページで正しいキーを入力してください。"
                }
                if (response.status === 403) {
                    return "このAPIキーには権限がありません。設定ページでキーを確認してください。"
                }
                return "AI接続に問題が発生しました。しばらくしてからもう一度お試しください。"
            }

            const data = await response.json()

            const aiText = data?.choices?.[0]?.message?.content
            if (!aiText) {
                console.error('No text in OpenAI response:', data)
                return "I didn't quite catch that. Could you say it again?"
            }

            return aiText.trim()
        } catch (error) {
            console.error(`OpenAI API fetch error (attempt ${attempt + 1}):`, error)
            if (attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 1000
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
            }
            return "ネットワーク接続に問題があるようです。インターネット接続を確認してからもう一度お試しください。"
        }
    }
}

/**
 * OpenAI APIへの接続テスト
 * @param {string} apiKey - テストするAPIキー
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testOpenAIConnection(apiKey) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10,
            }),
        })

        if (response.ok) {
            return { success: true, message: '接続成功！OpenAI APIが正常に動作しています。' }
        }

        if (response.status === 429) {
            return { success: false, message: 'レート制限中です。しばらく待ってからお試しください。' }
        }
        if (response.status === 401) {
            return { success: false, message: 'APIキーが無効です。正しいキーを入力してください。' }
        }
        return { success: false, message: `エラー (${response.status}): 接続に失敗しました。` }
    } catch {
        return { success: false, message: 'ネットワークエラー: インターネット接続を確認してください。' }
    }
}
