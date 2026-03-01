import { useNavigate } from 'react-router-dom'
import { Flame, Target, Trophy, ChevronRight, Zap, Clock, Star } from 'lucide-react'
import { CATEGORIES } from '../data/lessons'
import { useProgress } from '../contexts/ProgressContext'
import { useLanguage } from '../contexts/LanguageContext'
import './HomePage.css'

export default function HomePage() {
    const navigate = useNavigate()
    const { streak, todayXp, dailyGoal, totalXp, completedLessons, totalSpeakingMinutes } = useProgress()
    const { currentLanguage } = useLanguage()
    const goalProgress = Math.min((todayXp / dailyGoal) * 100, 100)

    const langLabel = {
        en: '英語', es: 'スペイン語', fr: 'フランス語', zh: '中国語', ko: '韓国語',
    }[currentLanguage.code] || '英語'

    return (
        <div className="page-content home-page">
            {/* Header */}
            <header className="home-header">
                <div>
                    <p className="home-greeting">おかえりなさい 👋</p>
                    <h1 className="home-title">今日も{langLabel}を練習しよう</h1>
                </div>
                <div className="home-streak">
                    <Flame size={24} className="streak-fire" />
                    <span className="home-streak-count">{streak}</span>
                    <span className="home-streak-label">日連続</span>
                </div>
            </header>

            {/* Daily Progress Card */}
            <div className="daily-progress glass-card">
                <div className="daily-progress-header">
                    <div className="daily-progress-info">
                        <Target size={18} className="daily-progress-icon" />
                        <span className="daily-progress-label">今日の目標</span>
                    </div>
                    <span className="daily-progress-xp">
                        <Zap size={14} />
                        {todayXp} / {dailyGoal} XP
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${goalProgress}%` }}
                    />
                </div>
                <div className="daily-stats">
                    <div className="daily-stat">
                        <Clock size={14} />
                        <span>{totalSpeakingMinutes}分</span>
                    </div>
                    <div className="daily-stat">
                        <Star size={14} />
                        <span>{completedLessons}レッスン完了</span>
                    </div>
                    <div className="daily-stat">
                        <Trophy size={14} />
                        <span>{totalXp} XP</span>
                    </div>
                </div>
            </div>

            {/* Quick Action - Free Talk */}
            <button
                className="quick-action"
                onClick={() => navigate('/speaking/free/free-1')}
            >
                <div className="quick-action-content">
                    <span className="quick-action-emoji emoji">🗣️</span>
                    <div className="quick-action-text">
                        <span className="quick-action-title">AIとフリートーク</span>
                        <span className="quick-action-desc">自由に{langLabel}で会話しよう</span>
                    </div>
                </div>
                <ChevronRight size={20} />
            </button>

            {/* Categories */}
            <div className="section-header">
                <h2 className="section-title">カテゴリ</h2>
                <button className="section-link" onClick={() => navigate('/lessons')}>
                    すべて見る
                </button>
            </div>

            <div className="category-grid">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className="category-card glass-card"
                        onClick={() => navigate(`/lessons/${cat.id}`)}
                    >
                        <div className="category-icon" style={{ background: cat.color + '20' }}>
                            <span className="emoji">{cat.icon}</span>
                        </div>
                        <span className="category-name">{cat.title}</span>
                        <span className="category-desc">{cat.description}</span>
                    </button>
                ))}
            </div>

            {/* Motivation Section */}
            <div className="motivation-card glass-card">
                <div className="motivation-icon emoji">💡</div>
                <p className="motivation-text">
                    毎日少しずつの練習が、大きな進歩につながります。<br />
                    {todayXp < dailyGoal ? (
                        <strong>今日もあと{dailyGoal - todayXp} XPで目標達成！</strong>
                    ) : (
                        <strong>🎉 今日の目標達成！素晴らしい！</strong>
                    )}
                </p>
            </div>
        </div>
    )
}
