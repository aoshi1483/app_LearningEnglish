import { useNavigate } from 'react-router-dom'
import { Clock, Zap } from 'lucide-react'
import { getLevelLabel, getLevelColor } from '../data/lessons'
import './LessonCard.css'

export default function LessonCard({ lesson, categoryId }) {
    const navigate = useNavigate()

    const handleClick = () => {
        if (lesson.scenario) {
            navigate(`/speaking/${categoryId}/${lesson.id}`)
        } else if (categoryId === 'pronunciation') {
            navigate(`/pronunciation/${lesson.id}`)
        }
    }

    return (
        <button className="lesson-card glass-card" onClick={handleClick}>
            <div className="lesson-card-header">
                <h3 className="lesson-card-title">{lesson.title}</h3>
                <span
                    className="lesson-card-level"
                    style={{ color: getLevelColor(lesson.level), borderColor: getLevelColor(lesson.level) + '40' }}
                >
                    {getLevelLabel(lesson.level)}
                </span>
            </div>
            <div className="lesson-card-meta">
                {lesson.duration && (
                    <span className="lesson-card-meta-item">
                        <Clock size={14} />
                        {lesson.duration}分
                    </span>
                )}
                {lesson.xp && (
                    <span className="lesson-card-meta-item lesson-card-xp">
                        <Zap size={14} />
                        {lesson.xp} XP
                    </span>
                )}
            </div>
        </button>
    )
}
