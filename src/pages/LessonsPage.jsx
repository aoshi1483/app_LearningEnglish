import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CATEGORIES, LESSONS } from '../data/lessons'
import LessonCard from '../components/LessonCard'
import './LessonsPage.css'

export default function LessonsPage() {
    const { categoryId } = useParams()
    const navigate = useNavigate()

    // 特定カテゴリが選ばれた場合
    if (categoryId) {
        const category = CATEGORIES.find(c => c.id === categoryId)
        const lessons = LESSONS[categoryId] || []

        return (
            <div className="page-content lessons-page">
                <header className="lessons-header">
                    <button className="back-btn" onClick={() => navigate('/lessons')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="lessons-header-info">
                        <span className="emoji lessons-header-icon">{category?.icon}</span>
                        <div>
                            <h1 className="lessons-header-title">{category?.title}</h1>
                            <p className="lessons-header-desc">{category?.description}</p>
                        </div>
                    </div>
                </header>

                <div className="lessons-list">
                    {lessons.length > 0 ? (
                        lessons.map((lesson) => (
                            <LessonCard key={lesson.id} lesson={lesson} categoryId={categoryId} />
                        ))
                    ) : (
                        <div className="lessons-empty glass-card">
                            <span className="emoji">🔜</span>
                            <p>このカテゴリのレッスンは準備中です</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // カテゴリ一覧
    return (
        <div className="page-content lessons-page">
            <header className="lessons-page-header">
                <h1 className="lessons-page-title">レッスン</h1>
                <p className="lessons-page-subtitle">カテゴリを選んで学習を始めましょう</p>
            </header>

            <div className="lessons-categories">
                {CATEGORIES.map((cat) => {
                    const lessons = LESSONS[cat.id] || []
                    return (
                        <button
                            key={cat.id}
                            className="lessons-category-card glass-card"
                            onClick={() => navigate(`/lessons/${cat.id}`)}
                        >
                            <div className="lessons-cat-icon" style={{ background: cat.color + '20' }}>
                                <span className="emoji">{cat.icon}</span>
                            </div>
                            <div className="lessons-cat-info">
                                <h3 className="lessons-cat-name">{cat.title}</h3>
                                <p className="lessons-cat-desc">{cat.description}</p>
                                <span className="lessons-cat-count">{lessons.length} レッスン</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
