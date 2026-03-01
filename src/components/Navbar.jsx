import { NavLink } from 'react-router-dom'
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react'
import './Navbar.css'

const NAV_ITEMS = [
    { to: '/', icon: Home, label: 'ホーム' },
    { to: '/lessons', icon: BookOpen, label: 'レッスン' },
    { to: '/progress', icon: BarChart3, label: '記録' },
    { to: '/settings', icon: Settings, label: '設定' },
]

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                    >
                        {({ isActive }) => (
                            <>
                                <div className="nav-icon-wrapper">
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="nav-label">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
