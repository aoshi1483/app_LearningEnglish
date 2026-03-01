import { createContext, useContext, useState, useCallback } from 'react'

const LanguageContext = createContext(null)

const LANGUAGES = {
    en: {
        code: 'en',
        name: 'English',
        nativeName: '英語',
        speechLang: 'en-US',
        flag: '🇺🇸',
    },
    es: {
        code: 'es',
        name: 'Spanish',
        nativeName: 'スペイン語',
        speechLang: 'es-ES',
        flag: '🇪🇸',
    },
    fr: {
        code: 'fr',
        name: 'French',
        nativeName: 'フランス語',
        speechLang: 'fr-FR',
        flag: '🇫🇷',
    },
    zh: {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中国語',
        speechLang: 'zh-CN',
        flag: '🇨🇳',
    },
    ko: {
        code: 'ko',
        name: 'Korean',
        nativeName: '韓国語',
        speechLang: 'ko-KR',
        flag: '🇰🇷',
    },
}

export function LanguageProvider({ children }) {
    const [targetLang, setTargetLang] = useState('en')

    const currentLanguage = LANGUAGES[targetLang]
    const availableLanguages = Object.values(LANGUAGES)

    const switchLanguage = useCallback((langCode) => {
        if (LANGUAGES[langCode]) {
            setTargetLang(langCode)
        }
    }, [])

    return (
        <LanguageContext.Provider value={{
            targetLang,
            currentLanguage,
            availableLanguages,
            switchLanguage,
            LANGUAGES,
        }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}
