import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../icons';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Mapping of routes to their titles. Can be a string or a function.
    const pathTitles: { [key: string]: string | (() => string) } = {
        '/': () => `Olá, ${user?.name || 'usuário'}!`,
        '/atendimento-imediato': 'Pronto Atendimento',
        '/agendar-consulta': 'Agendar Consulta',
        '/device-test': 'Teste de Equipamento',
        '/notificacoes': 'Notificações',
        '/prontuario-medico': 'Prontuário Médico',
        '/historico': 'Meu Histórico',
        '/financeiro/formas-de-pagamento': 'Formas de Pagamento',
        '/financeiro/pagamentos': 'Histórico de Pagamentos',
        '/perfil': 'Meu Perfil',
    };

    const title = pathTitles[location.pathname];
    const pageTitle = typeof title === 'function' ? title() : title || 'Boni Saúde';
    
    // Pages that are part of the main navigation tabs
    const mainPages = ['/', '/agendar-consulta', '/atendimento-imediato', '/historico', '/perfil'];
    const showBackButton = !mainPages.includes(location.pathname);

    // The Dashboard page has its own custom header, so we don't render this global one.
    if (location.pathname === '/') {
        return null;
    }

    return (
        <header className="sticky top-0 z-20 bg-white shadow-sm p-4 flex items-center h-16">
            {showBackButton && (
                <button onClick={() => navigate(-1)} className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100" aria-label="Voltar">
                    <ArrowLeftIcon />
                </button>
            )}
            <h1 className="text-lg font-bold text-gray-900 truncate">{pageTitle}</h1>
        </header>
    );
};

export default Header;
