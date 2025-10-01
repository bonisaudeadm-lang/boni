import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarIcon, CrossIcon, HistoryIcon, UserIcon } from '../icons';

const BottomNav: React.FC = () => {
    interface NavItemType {
        path: string;
        icon: React.ReactNode;
        label: string;
        isPrimary?: boolean;
    }

    const navItems: NavItemType[] = [
        { path: '/', icon: <HomeIcon />, label: 'Início' },
        { path: '/agendar-consulta', icon: <CalendarIcon />, label: 'Agendar' },
        { path: '/atendimento-imediato', icon: <CrossIcon />, label: 'Atendimento', isPrimary: true },
        { path: '/historico', icon: <HistoryIcon />, label: 'Histórico' },
        { path: '/perfil', icon: <UserIcon />, label: 'Perfil' },
    ];

    const primaryAction = navItems.find(item => item.isPrimary);
    const regularItems = navItems.filter(item => !item.isPrimary);
    const middleIndex = Math.floor(regularItems.length / 2);

    return (
        <nav className="fixed bottom-4 left-1/2 z-40 h-16 w-[90%] max-w-sm -translate-x-1/2 rounded-full bg-white p-2 shadow-2xl">
            <div className="flex h-full items-center justify-around">
                {regularItems.slice(0, middleIndex).map((item) => (
                    <NavItem key={item.path} {...item} />
                ))}

                {primaryAction && <PrimaryNavItem {...primaryAction} />}

                {regularItems.slice(middleIndex).map((item) => (
                    <NavItem key={item.path} {...item} />
                ))}
            </div>
        </nav>
    );
};

interface NavItemProps {
    path: string;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ path, icon, label }) => {
    return (
        <NavLink
            to={path}
            end
            className="flex h-full w-1/5 items-center justify-center"
            aria-label={label}
        >
            {({ isActive }) => (
                <div className={`relative flex flex-col items-center justify-center transition-colors ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                    {isActive && <span className="absolute -top-2.5 h-1 w-6 rounded-full bg-purple-600"></span>}
                    <div className="h-6 w-6">{icon}</div>
                </div>
            )}
        </NavLink>
    );
};

const PrimaryNavItem: React.FC<NavItemProps> = ({ path, icon, label }) => {
    return (
        <NavLink
            to={path}
            className="relative -mt-8 h-16 w-16"
            aria-label={label}
        >
            {({ isActive }) => (
                <div
                    className={`flex h-full w-full items-center justify-center rounded-2xl text-white transition-all duration-300 transform ${
                        isActive ? 'bg-red-600 scale-105 shadow-xl' : 'bg-red-500 shadow-lg hover:bg-red-600'
                    }`}
                >
                    <div className="flex h-8 w-8 items-center justify-center">{icon}</div>
                </div>
            )}
        </NavLink>
    );
};

export default BottomNav;
