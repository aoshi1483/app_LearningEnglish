import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ProgressContext = createContext(null)

const STORAGE_KEY = 'lingoflow_progress'

function formatDateLocal(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function getToday() {
    return formatDateLocal(new Date())
}

function getDayOfWeek() {
    return new Date().getDay() // 0=日, 1=月, ...
}

function getWeekStartDate() {
    // 今週の日曜日の日付を返す（日曜始まり）
    const now = new Date()
    const day = now.getDay() // 0=日
    const diff = day // 日曜日からの差分
    const sunday = new Date(now)
    sunday.setDate(now.getDate() - diff)
    sunday.setHours(0, 0, 0, 0)
    return formatDateLocal(sunday)
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function createDefaultProgress() {
    return {
        totalXp: 0,
        todayXp: 0,
        dailyGoal: 50,
        completedLessons: 0,
        completedLessonIds: [],
        totalSpeakingMinutes: 0,
        perfectScores: 0,
        streak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        weekStartDate: getWeekStartDate(),
        weeklyData: DAY_LABELS.map(day => ({ day, xp: 0 })),
        username: 'User',
    }
}

function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const data = JSON.parse(saved)
            // 今日の日付が変わっていたらtodayXpをリセット
            if (data.lastActiveDate !== getToday()) {
                data.todayXp = 0
            }
            // 週が変わっていたらweeklyDataをリセット
            const currentWeekStart = getWeekStartDate()
            const todayDay = getDayOfWeek()
            // 今日より後の曜日にXPがある = 先週のデータが残っている
            const hasStaleData = Array.isArray(data.weeklyData) &&
                data.weeklyData.some((d, i) => i > todayDay && d.xp > 0)
            if (!data.weekStartDate || data.weekStartDate !== currentWeekStart || hasStaleData) {
                data.weeklyData = DAY_LABELS.map(day => ({ day, xp: 0 }))
                data.weekStartDate = currentWeekStart
            }
            // weeklyData の整合性チェック（曜日ラベルが壊れていたら再生成、XPはリセット）
            if (!Array.isArray(data.weeklyData) || data.weeklyData.length !== 7 ||
                !data.weeklyData.every((d, i) => d.day === DAY_LABELS[i])) {
                data.weeklyData = DAY_LABELS.map(day => ({ day, xp: 0 }))
            }
            return { ...createDefaultProgress(), ...data }
        }
    } catch { /* ignore */ }
    return createDefaultProgress()
}

export function ProgressProvider({ children }) {
    const [progress, setProgress] = useState(loadProgress)
    const [currentDate, setCurrentDate] = useState(getToday)

    // localStorageへ永続化
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
        } catch { /* ignore */ }
    }, [progress])

    // 画面を開きっぱなしで午前0時を跨いだ場合のリセット対応
    useEffect(() => {
        const updateDate = () => {
            const today = getToday()
            if (currentDate !== today) {
                setCurrentDate(today)
            }
        }
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') updateDate()
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)
        const intervalId = setInterval(updateDate, 60000)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            clearInterval(intervalId)
        }
    }, [currentDate])

    // ストリーク更新（アプリ起動時に呼ばれる）
    useEffect(() => {
        const today = getToday()
        setProgress(prev => {
            if (prev.lastActiveDate === today) return prev // 今日既に更新済み

            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = formatDateLocal(yesterday)

            let newStreak = prev.streak
            if (prev.lastActiveDate === yesterdayStr) {
                // 昨日もアクティブ → ストリーク継続
                // (XP加算時にストリーク+1するので、ここでは何もしない)
            } else if (prev.lastActiveDate && prev.lastActiveDate !== today) {
                // 1日以上空いた → ストリークリセット
                newStreak = 0
            }

            return { ...prev, streak: newStreak }
        })
    }, [])

    const addXp = useCallback((amount) => {
        setProgress(prev => {
            const today = getToday()
            const dayIndex = getDayOfWeek()
            const currentWeekStart = getWeekStartDate()

            // 週データ更新
            let weeklyData = [...prev.weeklyData]
            let weekStartDate = prev.weekStartDate

            // 週が変わっていたらリセット
            if (!weekStartDate || weekStartDate !== currentWeekStart) {
                weeklyData = DAY_LABELS.map(day => ({ day, xp: 0 }))
                weekStartDate = currentWeekStart
            }

            // 日付が変わった場合、今日の曜日のXPをリセットしてから加算
            if (prev.lastActiveDate !== today) {
                weeklyData[dayIndex] = { ...weeklyData[dayIndex], xp: amount }
            } else {
                weeklyData[dayIndex] = { ...weeklyData[dayIndex], xp: weeklyData[dayIndex].xp + amount }
            }

            // ストリーク処理
            let newStreak = prev.streak
            if (prev.lastActiveDate !== today) {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayStr = formatDateLocal(yesterday)
                if (prev.lastActiveDate === yesterdayStr || !prev.lastActiveDate) {
                    newStreak = prev.streak + 1
                } else {
                    newStreak = 1
                }
            }

            const newLongestStreak = Math.max(prev.longestStreak, newStreak)

            return {
                ...prev,
                totalXp: prev.totalXp + amount,
                todayXp: (prev.lastActiveDate === today ? prev.todayXp : 0) + amount,
                streak: newStreak,
                longestStreak: newLongestStreak,
                lastActiveDate: today,
                weeklyData,
                weekStartDate,
            }
        })
    }, [])

    const completeLesson = useCallback((lessonId, xpAmount) => {
        setProgress(prev => {
            // 既に完了済みの場合はXPのみ加算（レッスン数は増やさない）
            if (prev.completedLessonIds.includes(lessonId)) {
                return prev // 重複防止
            }
            return {
                ...prev,
                completedLessons: prev.completedLessons + 1,
                completedLessonIds: [...prev.completedLessonIds, lessonId],
            }
        })
        addXp(xpAmount)
    }, [addXp])

    const addSpeakingMinutes = useCallback((minutes) => {
        setProgress(prev => ({
            ...prev,
            totalSpeakingMinutes: prev.totalSpeakingMinutes + minutes,
        }))
    }, [])

    const addPerfectScore = useCallback(() => {
        setProgress(prev => ({
            ...prev,
            perfectScores: prev.perfectScores + 1,
        }))
    }, [])

    const setUsername = useCallback((name) => {
        setProgress(prev => ({
            ...prev,
            username: name
        }))
    }, [])

    const resetProgress = useCallback(() => {
        setProgress(createDefaultProgress())
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch { /* ignore */ }
    }, [])

    return (
        <ProgressContext.Provider value={{
            ...progress,
            todayXp: progress.lastActiveDate === currentDate ? progress.todayXp : 0,
            addXp,
            completeLesson,
            addSpeakingMinutes,
            addPerfectScore,
            setUsername,
            resetProgress,
        }}>
            {children}
        </ProgressContext.Provider>
    )
}

export function useProgress() {
    const ctx = useContext(ProgressContext)
    if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
    return ctx
}
