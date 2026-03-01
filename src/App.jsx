import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { SpeechProvider } from './contexts/SpeechContext'
import { AIProviderProvider } from './contexts/AIProviderContext'
import { ProgressProvider } from './contexts/ProgressContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LessonsPage from './pages/LessonsPage'
import SpeakingPracticePage from './pages/SpeakingPracticePage'
import PronunciationPage from './pages/PronunciationPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
    return (
        <AIProviderProvider>
            <LanguageProvider>
                <SpeechProvider>
                    <ProgressProvider>
                        <div className="app-layout">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/lessons" element={<LessonsPage />} />
                                <Route path="/lessons/:categoryId" element={<LessonsPage />} />
                                <Route path="/speaking/:categoryId/:lessonId" element={<SpeakingPracticePage />} />
                                <Route path="/pronunciation/:lessonId" element={<PronunciationPage />} />
                                <Route path="/progress" element={<ProgressPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                            </Routes>
                            <Routes>
                                <Route path="/speaking/*" element={null} />
                                <Route path="/pronunciation/*" element={null} />
                                <Route path="*" element={<Navbar />} />
                            </Routes>
                        </div>
                    </ProgressProvider>
                </SpeechProvider>
            </LanguageProvider>
        </AIProviderProvider>
    )
}
