import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HomeIcon, CrossIcon, CalendarIcon, HistoryIcon, LogoutIcon, CloseIcon, MedicalRecordIcon, FinancialIcon, ChevronDownIcon, ChevronUpIcon, BellIcon } from '../icons';

const Sidebar: React.FC<{ isOpen: boolean, toggle: () => void }> = ({ isOpen, toggle }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isFinancialOpen, setFinancialOpen] = useState(false);

    const navItems = [
        { path: '/', icon: <HomeIcon />, label: 'Início' },
        { path: '/atendimento-imediato', icon: <CrossIcon />, label: 'Pronto Atendimento médico' },
        { path: '/agendar-consulta', icon: <CalendarIcon />, label: 'Agendar Consulta' },
        { path: '/notificacoes', icon: <BellIcon />, label: 'Notificações' },
        { path: '/prontuario-medico', icon: <MedicalRecordIcon />, label: 'Prontuário Médico' },
        { path: '/historico', icon: <HistoryIcon />, label: 'Meu Histórico' },
    ];
    
    const financialNavItems = [
        { path: '/financeiro/formas-de-pagamento', label: 'Formas de Pagamento' },
        { path: '/financeiro/pagamentos', label: 'Histórico de Pagamentos' },
    ];

    const isFinancialActive = financialNavItems.some(item => location.pathname === item.path);

    useEffect(() => {
        if (isFinancialActive) {
            setFinancialOpen(true);
        }
    }, [isFinancialActive]);

    const NavLink: React.FC<{path: string, icon: ReactNode, label: string}> = ({path, icon, label}) => {
        const isActive = location.pathname === path;
        return (
             <Link
                to={path}
                onClick={toggle}
                className={`flex items-center p-3 my-1 rounded-lg transition-colors ${
                    isActive
                        ? 'bg-purple-700 text-white'
                        : 'text-gray-700 hover:bg-purple-100'
                }`}
            >
                {icon}
                <span className="ml-4 font-medium">{label}</span>
            </Link>
        );
    }

    return (
        <>
            <aside className={`fixed inset-y-0 left-0 bg-white shadow-xl z-30 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-purple-100`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 bg-purple-700">
                        <img src="https://storage.googleapis.com/genai-downloads/images/d37821c4b7261a86b9764de30e698822" alt="Boni Logo" className="h-10 w-auto" />
                        <button onClick={toggle} className="md:hidden text-white">
                            <CloseIcon />
                        </button>
                    </div>
                    <nav className="flex-1 p-4">
                        {navItems.map(item => <NavLink key={item.path} {...item} />)}
                        
                        {/* Financial Menu */}
                        <button
                            onClick={() => setFinancialOpen(!isFinancialOpen)}
                            className={`w-full flex items-center justify-between p-3 my-1 rounded-lg transition-colors ${
                                isFinancialActive
                                    ? 'bg-purple-700 text-white'
                                    : 'text-gray-700 hover:bg-purple-100'
                            }`}
                        >
                            <div className="flex items-center">
                                <FinancialIcon />
                                <span className="ml-4 font-medium">Financeiro</span>
                            </div>
                            {isFinancialOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </button>
                        {isFinancialOpen && (
                            <div className="pl-8 transition-all duration-300">
                                {financialNavItems.map(item => {
                                    const isSubActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={toggle}
                                            className={`flex items-center p-2 my-1 rounded-lg text-sm transition-colors ${
                                                isSubActive
                                                    ? 'bg-purple-200 text-purple-800 font-semibold'
                                                    : 'text-gray-600 hover:bg-purple-100'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </nav>
                    <div className="p-4 border-t border-purple-100">
                        <div className="flex items-center mb-4">
                             <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
                             <div className="ml-3">
                                <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                             </div>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="w-full flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                        >
                            <LogoutIcon />
                            <span className="ml-2 font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            </aside>
             {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={toggle}></div>}
        </>
    );
};

export default Sidebar;