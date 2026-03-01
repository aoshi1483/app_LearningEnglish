/**
 * AIレスポンスエンジン（モック実装）
 * パターンマッチングで会話応答を生成する。
 * 将来的にLLM APIへ置き換え可能。
 */

const RESPONSE_PATTERNS = [
    // 挨拶
    {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        responses: [
            "Hello! It's great to talk with you. How are you doing today?",
            "Hi there! Nice to hear from you. What would you like to practice?",
            "Hey! Welcome back. How has your day been so far?",
        ]
    },
    // 自己紹介
    {
        patterns: ['my name is', 'i am', "i'm"],
        responses: [
            "Nice to meet you! That's a great name. Tell me more about yourself!",
            "Wonderful! It's a pleasure to meet you. Where are you from?",
            "Great to meet you! What do you do for work or study?",
        ]
    },
    // 天気
    {
        patterns: ['weather', 'sunny', 'rain', 'cold', 'hot', 'warm'],
        responses: [
            "The weather really affects our mood, doesn't it? Do you prefer warm or cold weather?",
            "I see! Weather is a great topic for conversation. What's your favorite season?",
            "That's interesting! What kind of activities do you enjoy in this weather?",
        ]
    },
    // 趣味
    {
        patterns: ['hobby', 'hobbies', 'like to', 'enjoy', 'fun', 'free time', 'weekend'],
        responses: [
            "That sounds really interesting! How long have you been doing that?",
            "Cool! I'd love to hear more about that. Why do you enjoy it?",
            "That's a great way to spend your time! Do your friends enjoy it too?",
        ]
    },
    // 食べ物
    {
        patterns: ['food', 'eat', 'restaurant', 'cook', 'lunch', 'dinner', 'breakfast', 'coffee', 'tea'],
        responses: [
            "I love talking about food! What's your favorite dish?",
            "Food is such a wonderful topic! Do you enjoy cooking at home?",
            "Mmm, that sounds delicious! Have you tried any new restaurants recently?",
        ]
    },
    // 旅行
    {
        patterns: ['travel', 'trip', 'visit', 'country', 'abroad', 'vacation', 'flight', 'hotel'],
        responses: [
            "Traveling is so enriching! Where would you like to go next?",
            "That's exciting! What was the most memorable part of your trip?",
            "I love hearing about travel experiences! Do you prefer beaches or mountains?",
        ]
    },
    // 仕事
    {
        patterns: ['work', 'job', 'office', 'company', 'meeting', 'project', 'business', 'career'],
        responses: [
            "Work can be both challenging and rewarding. What do you enjoy most about it?",
            "That sounds like an interesting job! How did you get into that field?",
            "I see! What skills do you think are most important in your line of work?",
        ]
    },
    // 感謝
    {
        patterns: ['thank', 'thanks', 'appreciate'],
        responses: [
            "You're welcome! I'm always happy to help you practice. Keep it up!",
            "No problem at all! You're doing great with your English!",
            "Anytime! Your English is really improving. Let's keep going!",
        ]
    },
    // 肯定
    {
        patterns: ['yes', 'yeah', 'sure', 'of course', 'right', 'exactly', 'agree'],
        responses: [
            "Great! Can you tell me more about that?",
            "Wonderful! Let's explore this topic a bit deeper. What else comes to mind?",
            "Excellent! You're expressing yourself very well. What do you think about...?",
        ]
    },
    // 質問への応答
    {
        patterns: ['how about you', 'what about you', 'and you'],
        responses: [
            "Thanks for asking! As an AI, I love learning about different perspectives. Tell me more about your thoughts!",
            "That's kind of you to ask! I'm here to help you practice. Let's continue our conversation!",
        ]
    },
    // わからない
    {
        patterns: ["don't know", "not sure", "i think", 'maybe', 'perhaps'],
        responses: [
            "That's perfectly okay! Learning is all about exploring. Would you like me to help you express that thought?",
            "No worries! Take your time. Would you like to try saying it in a different way?",
            "It's fine to be unsure. That's how we learn! Can you try expressing your idea?",
        ]
    },
]

const FALLBACK_RESPONSES = [
    "That's interesting! Can you tell me more about that?",
    "I see! That's a great point. What else would you like to talk about?",
    "Wonderful! You're expressing yourself very well. Let's keep the conversation going!",
    "Great job! Your English is really improving. What would you like to discuss next?",
    "That's a really good thought! How do you feel about that?",
    "Interesting! I'd love to hear more. Can you give me an example?",
    "You're doing great! Keep practicing. What's on your mind?",
]

const FEEDBACK_TEMPLATES = [
    {
        type: 'encouragement', messages: [
            "Great effort! 👏",
            "You're doing amazing! ✨",
            "Excellent pronunciation! 🎯",
            "Keep it up! 💪",
            "Wonderful speaking! 🌟",
        ]
    },
    {
        type: 'suggestion', messages: [
            "Try to speak a little slower for clearer pronunciation.",
            "Great vocabulary! Try adding more details to your sentences.",
            "Your fluency is improving! Focus on natural connecting words like 'well', 'so', 'actually'.",
            "Nice sentence structure! Practice using different tenses for variety.",
        ]
    },
]

export function getAIResponse(userText) {
    if (!userText || userText.trim().length === 0) {
        return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    }

    const lower = userText.toLowerCase()

    for (const { patterns, responses } of RESPONSE_PATTERNS) {
        for (const pattern of patterns) {
            if (lower.includes(pattern)) {
                return responses[Math.floor(Math.random() * responses.length)]
            }
        }
    }

    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

export function getEncouragement() {
    const msgs = FEEDBACK_TEMPLATES.find(f => f.type === 'encouragement').messages
    return msgs[Math.floor(Math.random() * msgs.length)]
}

export function getSuggestion() {
    const msgs = FEEDBACK_TEMPLATES.find(f => f.type === 'suggestion').messages
    return msgs[Math.floor(Math.random() * msgs.length)]
}

export function calculatePronunciationScore(original, spoken) {
    if (!original || !spoken) return 0

    const origWords = original.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
    const spokenWords = spoken.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)

    if (origWords.length === 0) return 0

    let matches = 0
    for (const word of origWords) {
        if (spokenWords.includes(word)) {
            matches++
        }
    }

    return Math.round((matches / origWords.length) * 100)
}
