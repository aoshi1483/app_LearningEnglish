export const CATEGORIES = [
    {
        id: 'daily',
        title: '日常会話',
        titleEn: 'Daily Conversation',
        icon: '💬',
        color: '#6366f1',
        description: '挨拶、自己紹介、天気の話題など',
    },
    {
        id: 'travel',
        title: '旅行',
        titleEn: 'Travel',
        icon: '✈️',
        color: '#8b5cf6',
        description: '空港、ホテル、レストランでの会話',
    },
    {
        id: 'business',
        title: 'ビジネス',
        titleEn: 'Business',
        icon: '💼',
        color: '#06b6d4',
        description: '会議、プレゼン、メール対応',
    },
    {
        id: 'pronunciation',
        title: '発音練習',
        titleEn: 'Pronunciation',
        icon: '🎯',
        color: '#f59e0b',
        description: '正しい発音を身につけよう',
    },
    {
        id: 'roleplay',
        title: 'ロールプレイ',
        titleEn: 'Role Play',
        icon: '🎭',
        color: '#ec4899',
        description: '実場面をシミュレーション',
    },
    {
        id: 'free',
        title: 'フリートーク',
        titleEn: 'Free Talk',
        icon: '🗣️',
        color: '#22c55e',
        description: 'AIと自由に会話しよう',
    },
]

export const LESSONS = {
    daily: [
        {
            id: 'daily-1',
            title: '初めましての挨拶',
            level: 'beginner',
            duration: 5,
            xp: 20,
            phrases: [
                { prompt: 'Hello! Nice to meet you.', translation: 'こんにちは！初めまして。' },
                { prompt: 'My name is [Your Name]. What is your name?', translation: '私の名前は○○です。あなたの名前は？' },
                { prompt: 'I am from Japan. Where are you from?', translation: '日本から来ました。あなたはどこから？' },
                { prompt: 'It is nice to meet you too!', translation: 'こちらこそ、お会いできて嬉しいです！' },
            ],
            scenario: {
                situation: 'パーティーで初めての人に会う場面です。自己紹介をしましょう。',
                aiRole: 'パーティーの参加者',
                aiOpener: {
                    en: "Hi there! I don't think we've met before. I'm Alex.",
                    es: "¡Hola! No creo que nos hayamos conocido antes. Soy Alex.",
                    fr: "Salut ! Je ne crois pas qu'on se soit déjà rencontrés. Je suis Alex.",
                    zh: "你好！我们好像还没见过面。我是Alex。",
                    ko: "안녕하세요! 저희 아직 만난 적 없는 것 같아요. 저는 Alex예요.",
                },
                hints: ['名前を言いましょう', '出身地を聞いてみましょう', '趣味について話してみましょう'],
            },
        },
        {
            id: 'daily-2',
            title: '天気について話す',
            level: 'beginner',
            duration: 5,
            xp: 20,
            phrases: [
                { prompt: 'How is the weather today?', translation: '今日の天気はどうですか？' },
                { prompt: 'It is sunny and warm today.', translation: '今日は晴れて暖かいです。' },
                { prompt: 'I heard it will rain tomorrow.', translation: '明日は雨が降ると聞きました。' },
                { prompt: 'I love this kind of weather!', translation: 'こういう天気が大好きです！' },
            ],
            scenario: {
                situation: '同僚と天気について軽く話す場面です。',
                aiRole: '同僚',
                aiOpener: {
                    en: "Good morning! Beautiful day today, isn't it?",
                    es: "¡Buenos días! Hermoso día hoy, ¿no crees?",
                    fr: "Bonjour ! Belle journée aujourd'hui, n'est-ce pas ?",
                    zh: "早上好！今天天气真好，对吧？",
                    ko: "좋은 아침이에요! 오늘 날씨 정말 좋죠?",
                },
                hints: ['天気の感想を言いましょう', '週末の天気について聞いてみましょう'],
            },
        },
        {
            id: 'daily-3',
            title: '週末の予定を話す',
            level: 'intermediate',
            duration: 7,
            xp: 30,
            phrases: [
                { prompt: 'What are your plans for the weekend?', translation: '週末の予定は？' },
                { prompt: 'I am planning to go hiking.', translation: 'ハイキングに行く予定です。' },
                { prompt: 'That sounds like fun! Can I join you?', translation: '楽しそう！一緒に行ってもいい？' },
                { prompt: 'Sure, the more the merrier!', translation: 'もちろん、大勢の方が楽しいよ！' },
            ],
            scenario: {
                situation: '友人と週末の予定について話す場面です。',
                aiRole: '友人',
                aiOpener: {
                    en: "Hey! Do you have any plans for this weekend? I'm thinking of doing something fun.",
                    es: "¡Oye! ¿Tienes planes para este fin de semana? Estoy pensando en hacer algo divertido.",
                    fr: "Salut ! Tu as des projets pour ce week-end ? Je pensais faire quelque chose de sympa.",
                    zh: "嘿！这个周末有什么计划吗？我在想做点好玩的事。",
                    ko: "야! 이번 주말에 계획 있어? 뭔가 재미있는 거 할까 생각 중이야.",
                },
                hints: ['予定を伝えましょう', '相手を誘ってみましょう', '場所や時間を提案しましょう'],
            },
        },
    ],
    travel: [
        {
            id: 'travel-1',
            title: '空港でのチェックイン',
            level: 'beginner',
            duration: 5,
            xp: 20,
            phrases: [
                { prompt: 'I would like to check in for my flight.', translation: 'フライトのチェックインをしたいです。' },
                { prompt: 'Here is my passport and boarding pass.', translation: 'パスポートと搭乗券です。' },
                { prompt: 'Can I have a window seat, please?', translation: '窓側の席をお願いできますか？' },
                { prompt: 'What time does the boarding start?', translation: '搭乗は何時から始まりますか？' },
            ],
            scenario: {
                situation: '空港のカウンターでチェックインする場面です。',
                aiRole: 'チェックインカウンターのスタッフ',
                aiOpener: {
                    en: "Good morning! Welcome to the check-in counter. May I see your passport, please?",
                    es: "¡Buenos días! Bienvenido al mostrador de facturación. ¿Me permite ver su pasaporte, por favor?",
                    fr: "Bonjour ! Bienvenue au comptoir d'enregistrement. Puis-je voir votre passeport, s'il vous plaît ?",
                    zh: "早上好！欢迎来到值机柜台。请出示您的护照好吗？",
                    ko: "안녕하세요! 체크인 카운터에 오신 것을 환영합니다. 여권을 보여주시겠어요?",
                },
                hints: ['パスポートを見せましょう', '座席の希望を伝えましょう', '荷物について尋ねましょう'],
            },
        },
        {
            id: 'travel-2',
            title: 'ホテルのチェックイン',
            level: 'beginner',
            duration: 5,
            xp: 20,
            phrases: [
                { prompt: 'I have a reservation under [Your Name].', translation: '○○の名前で予約しています。' },
                { prompt: 'What time is checkout?', translation: 'チェックアウトは何時ですか？' },
                { prompt: 'Is breakfast included?', translation: '朝食は付いていますか？' },
                { prompt: 'Could you recommend a good restaurant nearby?', translation: '近くのおすすめレストランはありますか？' },
            ],
            scenario: {
                situation: 'ホテルのフロントでチェックインする場面です。',
                aiRole: 'ホテルのフロントスタッフ',
                aiOpener: {
                    en: "Good evening! Welcome to Grand Hotel. Do you have a reservation?",
                    es: "¡Buenas noches! Bienvenido al Grand Hotel. ¿Tiene una reservación?",
                    fr: "Bonsoir ! Bienvenue au Grand Hôtel. Avez-vous une réservation ?",
                    zh: "晚上好！欢迎来到Grand Hotel。请问您有预订吗？",
                    ko: "안녕하세요! Grand Hotel에 오신 것을 환영합니다. 예약하셨나요?",
                },
                hints: ['予約の確認をしましょう', 'Wi-Fiのパスワードを聞きましょう', '周辺情報を尋ねましょう'],
            },
        },
    ],
    business: [
        {
            id: 'business-1',
            title: '自己紹介（ビジネス）',
            level: 'intermediate',
            duration: 7,
            xp: 30,
            phrases: [
                { prompt: 'Let me introduce myself. I am the project manager.', translation: '自己紹介させてください。プロジェクトマネージャーです。' },
                { prompt: 'I have been working in this field for five years.', translation: 'この分野で5年間働いています。' },
                { prompt: 'I look forward to working with you.', translation: '一緒に働けることを楽しみにしています。' },
            ],
            scenario: {
                situation: '新しいチームメンバーに自己紹介する場面です。',
                aiRole: 'チームリーダー',
                aiOpener: {
                    en: "Welcome to the team! We're excited to have you on board. Could you tell us a bit about yourself?",
                    es: "¡Bienvenido al equipo! Estamos encantados de tenerte con nosotros. ¿Podrías contarnos un poco sobre ti?",
                    fr: "Bienvenue dans l'équipe ! Nous sommes ravis de vous avoir parmi nous. Pourriez-vous nous parler un peu de vous ?",
                    zh: "欢迎加入团队！我们很高兴有你的加入。你能简单介绍一下自己吗？",
                    ko: "팀에 오신 것을 환영합니다! 함께하게 되어 정말 기뻐요. 자기소개를 해주시겠어요?",
                },
                hints: ['役職と経験を伝えましょう', '専門分野について話しましょう', '意気込みを伝えましょう'],
            },
        },
    ],
    pronunciation: [
        {
            id: 'pron-1',
            title: 'R と L の発音',
            level: 'beginner',
            duration: 5,
            xp: 15,
            phrases: [
                { prompt: 'Right and light are different sounds.', translation: 'RightとLightは違う音です。' },
                { prompt: 'The red lorry ran along the road.', translation: '赤いトラックが道を走りました。' },
                { prompt: 'Really reliable railroad.', translation: '本当に信頼できる鉄道。' },
                { prompt: 'Larry rarely likes lemon.', translation: 'ラリーはめったにレモンが好きではない。' },
            ],
        },
        {
            id: 'pron-2',
            title: 'TH の発音',
            level: 'beginner',
            duration: 5,
            xp: 15,
            phrases: [
                { prompt: 'Think about three things.', translation: '3つのことを考えてください。' },
                { prompt: 'This is the other brother.', translation: 'これはもう一人の兄弟です。' },
                { prompt: 'The weather is getting better.', translation: '天気が良くなってきています。' },
                { prompt: 'They thought it was Thursday.', translation: '彼らは木曜日だと思っていました。' },
            ],
        },
    ],
    roleplay: [
        {
            id: 'role-1',
            title: 'カフェで注文する',
            level: 'beginner',
            duration: 5,
            xp: 25,
            scenario: {
                situation: 'カフェでコーヒーと軽食を注文する場面です。',
                aiRole: 'カフェの店員',
                aiOpener: {
                    en: "Hi! Welcome to Sunrise Café. What can I get for you today?",
                    es: "¡Hola! Bienvenido a Sunrise Café. ¿Qué puedo servirle hoy?",
                    fr: "Bonjour ! Bienvenue au Sunrise Café. Qu'est-ce que je peux vous servir aujourd'hui ?",
                    zh: "你好！欢迎来到Sunrise Café。今天想喝点什么？",
                    ko: "안녕하세요! Sunrise Café에 오신 것을 환영합니다. 오늘 뭘 드릴까요?",
                },
                hints: ['飲み物を注文しましょう', 'サイズを伝えましょう', '食べ物も注文してみましょう'],
            },
        },
        {
            id: 'role-2',
            title: '道を尋ねる',
            level: 'beginner',
            duration: 5,
            xp: 25,
            scenario: {
                situation: '街中で目的地への行き方を尋ねる場面です。',
                aiRole: '地元の人',
                aiOpener: {
                    en: "Oh, you look a bit lost! Can I help you find something?",
                    es: "¡Oh, pareces un poco perdido! ¿Puedo ayudarte a encontrar algo?",
                    fr: "Oh, vous avez l'air un peu perdu ! Est-ce que je peux vous aider à trouver quelque chose ?",
                    zh: "哦，你看起来有点迷路了！需要我帮你找什么吗？",
                    ko: "어, 좀 길을 잃은 것 같네요! 뭔가 찾는 걸 도와드릴까요?",
                },
                hints: ['目的地を伝えましょう', '歩いて行けるか聞きましょう', 'お礼を言いましょう'],
            },
        },
    ],
    free: [
        {
            id: 'free-1',
            title: 'フリートーク',
            level: 'beginner',
            duration: 10,
            xp: 30,
            scenario: {
                situation: {
                    en: 'AIと自由に英語で会話を楽しみましょう。どんな話題でもOKです。',
                    es: 'AIと自由にスペイン語で会話を楽しみましょう。どんな話題でもOKです。',
                    fr: 'AIと自由にフランス語で会話を楽しみましょう。どんな話題でもOKです。',
                    zh: 'AIと自由に中国語で会話を楽しみましょう。どんな話題でもOKです。',
                    ko: 'AIと自由に韓国語で会話を楽しみましょう。どんな話題でもOKです。',
                },
                aiRole: {
                    en: 'フレンドリーな英語の先生',
                    es: 'フレンドリーなスペイン語の先生',
                    fr: 'フレンドリーなフランス語の先生',
                    zh: 'フレンドリーな中国語の先生',
                    ko: 'フレンドリーな韓国語の先生',
                },
                aiOpener: {
                    en: "Hey! I'm your English conversation partner. What would you like to talk about today? We could discuss hobbies, travel, food, or anything you'd like!",
                    es: "¡Hola! Soy tu compañero de conversación en español. ¿Sobre qué te gustaría hablar hoy? ¡Podemos hablar de pasatiempos, viajes, comida o cualquier cosa que te guste!",
                    fr: "Salut ! Je suis ton partenaire de conversation en français. De quoi aimerais-tu parler aujourd'hui ? On peut discuter de loisirs, de voyages, de cuisine ou de tout ce que tu veux !",
                    zh: "嘿！我是你的中文会话伙伴。你今天想聊什么？我们可以聊兴趣爱好、旅行、美食，或者任何你想聊的话题！",
                    ko: "안녕! 나는 너의 한국어 회화 파트너야. 오늘 어떤 이야기를 하고 싶어? 취미, 여행, 음식, 또는 원하는 뭐든 이야기할 수 있어!",
                },
                hints: ['好きな話題を選びましょう', '質問をしてみましょう', '意見を言ってみましょう'],
            },
        },
    ],
}

export const ACHIEVEMENTS = [
    { id: 'first-lesson', title: '最初の一歩', icon: '🌟', description: '初めてのレッスンを完了', condition: (stats) => stats.completedLessons >= 1 },
    { id: 'streak-3', title: '3日連続', icon: '🔥', description: '3日間連続で学習', condition: (stats) => stats.streak >= 3 },
    { id: 'streak-7', title: '1週間チャレンジ', icon: '💪', description: '7日間連続で学習', condition: (stats) => stats.streak >= 7 },
    { id: 'streak-30', title: '習慣マスター', icon: '👑', description: '30日間連続で学習', condition: (stats) => stats.streak >= 30 },
    { id: 'lessons-5', title: '学習者', icon: '📚', description: 'レッスンを5つ完了', condition: (stats) => stats.completedLessons >= 5 },
    { id: 'lessons-10', title: '熱心な学習者', icon: '🎓', description: 'レッスンを10個完了', condition: (stats) => stats.completedLessons >= 10 },
    { id: 'xp-100', title: '100 XP達成', icon: '⭐', description: '100 XPを獲得', condition: (stats) => stats.totalXp >= 100 },
    { id: 'xp-500', title: '500 XP達成', icon: '🏆', description: '500 XPを獲得', condition: (stats) => stats.totalXp >= 500 },
    { id: 'perfect-score', title: 'パーフェクト', icon: '💎', description: '発音スコア100%を達成', condition: (stats) => stats.perfectScores >= 1 },
    { id: 'speaking-10', title: 'おしゃべり好き', icon: '🗣️', description: '10分以上会話', condition: (stats) => stats.totalSpeakingMinutes >= 10 },
]

export function getLevelLabel(level) {
    switch (level) {
        case 'beginner': return '初級'
        case 'intermediate': return '中級'
        case 'advanced': return '上級'
        default: return level
    }
}

export function getLevelColor(level) {
    switch (level) {
        case 'beginner': return '#22c55e'
        case 'intermediate': return '#f59e0b'
        case 'advanced': return '#ef4444'
        default: return '#6366f1'
    }
}
