import { Flame, Trophy, Clock, BookOpen, Star, Zap, Award, Lock } from 'lucide-react'
import { ACHIEVEMENTS } from '../data/lessons'
import { useProgress } from '../contexts/ProgressContext'
import './ProgressPage.css'

export default function ProgressPage() {
    const progress = useProgress()
    const { streak, longestStreak, totalXp, completedLessons, totalSpeakingMinutes, perfectScores, weeklyData } = progress

    const maxXp = Math.max(...weeklyData.map(d => d.xp), 1)

    const stats = { streak, longestStreak, totalXp, completedLessons, totalSpeakingMinutes, perfectScores }
    const unlockedAchievements = ACHIEVEMENTS.filter(a => a.condition(stats))
    const lockedAchievements = ACHIEVEMENTS.filter(a => !a.condition(stats))

    return (
        <div className="page-content progress-page">
            <header className="progress-header">
                <h1 className="progress-title">学習記録</h1>
                <p className="progress-subtitle">あなたの成長を振り返ろう</p>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <Flame size={24} className="stat-icon streak-fire" />
                    <span className="stat-value">{streak}</span>
                    <span className="stat-label">日連続</span>
                </div>
                <div className="stat-card glass-card">
                    <Zap size={24} className="stat-icon stat-icon--xp" />
                    <span className="stat-value">{totalXp}</span>
                    <span className="stat-label">合計 XP</span>
                </div>
                <div className="stat-card glass-card">
                    <BookOpen size={24} className="stat-icon stat-icon--lessons" />
                    <span className="stat-value">{completedLessons}</span>
                    <span className="stat-label">レッスン</span>
                </div>
                <div className="stat-card glass-card">
                    <Clock size={24} className="stat-icon stat-icon--time" />
                    <span className="stat-value">{totalSpeakingMinutes}</span>
                    <span className="stat-label">分</span>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="section-header">
                <h2 className="section-title">今週のアクティビティ</h2>
            </div>
            <div className="weekly-chart glass-card">
                <div className="chart-bars">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="chart-bar-wrapper">
                            <div className="chart-bar-track">
                                <div
                                    className="chart-bar-fill"
                                    style={{ height: `${(d.xp / maxXp) * 100}%` }}
                                />
                            </div>
                            <span className="chart-bar-label">{d.day}</span>
                            <span className="chart-bar-value">{d.xp}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Streak Info */}
            <div className="streak-info glass-card">
                <div className="streak-info-item">
                    <Flame size={20} className="streak-fire" />
                    <div>
                        <span className="streak-info-value">{streak}日</span>
                        <span className="streak-info-label">現在のストリーク</span>
                    </div>
                </div>
                <div className="streak-info-divider" />
                <div className="streak-info-item">
                    <Trophy size={20} style={{ color: '#f59e0b' }} />
                    <div>
                        <span className="streak-info-value">{longestStreak}日</span>
                        <span className="streak-info-label">最長ストリーク</span>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="section-header">
                <h2 className="section-title">実績バッジ</h2>
                <span className="badge badge-primary">
                    <Award size={12} />
                    {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                </span>
            </div>

            <div className="achievements-list">
                {unlockedAchievements.map(a => (
                    <div key={a.id} className="achievement-card glass-card achievement-card--unlocked">
                        <span className="achievement-icon emoji">{a.icon}</span>
                        <div className="achievement-info">
                            <span className="achievement-title">{a.title}</span>
                            <span className="achievement-desc">{a.description}</span>
                        </div>
                        <Star size={16} className="achievement-star" />
                    </div>
                ))}
                {lockedAchievements.map(a => (
                    <div key={a.id} className="achievement-card glass-card achievement-card--locked">
                        <span className="achievement-icon-locked">
                            <Lock size={18} />
                        </span>
                        <div className="achievement-info">
                            <span className="achievement-title">{a.title}</span>
                            <span className="achievement-desc">{a.description}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
