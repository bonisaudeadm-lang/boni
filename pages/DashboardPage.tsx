import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { 
    CrossIcon, 
    CalendarIcon, 
    MedicalRecordIcon, 
    MoreVerticalIcon 
} from '../components/icons';


// Representa o status da fatura para segurança de tipo.
type InvoiceStatus = 'none' | 'due' | 'overdue';

// Props para o componente InvoiceAlert.
interface InvoiceAlertProps {
    status: InvoiceStatus;
}

// Sub-componente para exibir alertas de pagamento de faturas.
const InvoiceAlert: React.FC<InvoiceAlertProps> = ({ status }) => {
    const messages: Record<InvoiceStatus, string> = {
        none: 'No momento não existe boleto',
        due: 'Você tem um boleto a vencer',
        overdue: 'Você tem um boleto vencido',
    };

    const statusStyles: Record<InvoiceStatus, string> = {
        none: 'bg-gray-100 text-gray-700',
        due: 'bg-yellow-100 text-yellow-800',
        overdue: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${statusStyles[status]}`}>
                    <MedicalRecordIcon />
                </div>
                <p className="font-medium text-gray-800">{messages[status]}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-700 transition-colors">
                <MoreVerticalIcon />
            </button>
        </div>
    );
};


// O cabeçalho do painel foi atualizado para incluir o alerta de fatura.
const DashboardHeader: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        // O preenchimento inferior foi aumentado para acomodar o novo componente.
        <header className="bg-purple-700 p-4 -mx-4 -mt-4 rounded-b-2xl shadow-lg">
            <div className="max-w-7xl mx-auto px-4 pt-4 pb-16">
                 <div className="flex justify-between items-center text-white">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/perfil')}
                            className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:bg-white/30 transition-colors"
                            aria-label="Acessar perfil"
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </button>
                        <div className="ml-4">
                            <p className="font-semibold text-xl">Olá, {user?.name}!</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};


const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [invoiceStatus] = useState<InvoiceStatus>('due');
    
    const actions = [
        { title: 'Pronto Atendimento médico', description: 'Fale com um clínico geral agora.', path: '/atendimento-imediato', icon: <CrossIcon/> },
        { title: 'Agendar Consulta', description: 'Escolha um especialista e marque sua consulta.', path: '/agendar-consulta', icon: <CalendarIcon/> },
        { title: 'Prontuário Médico', description: 'Acesse seu prontuário médico completo.', path: '/prontuario-medico', icon: <MedicalRecordIcon/> },
    ];

    return (
        <div>
            <DashboardHeader />
            
            <div className="-mt-14 space-y-4">
                <InvoiceAlert status={invoiceStatus} />

                <h2 className="text-xl font-bold text-gray-800 pt-4">O que você gostaria de fazer?</h2>
                <div className="flex flex-col gap-4">
                    {actions.map(action => {
                        const isImmediate = action.path === '/atendimento-imediato';
                        return (
                            <Card
                                key={action.title}
                                className={`hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                                    isImmediate ? 'bg-red-500 text-white hover:bg-red-600' : ''
                                }`}
                                onClick={() => navigate(action.path)}
                            >
                                <div className={`flex items-center ${isImmediate ? 'text-white' : 'text-purple-700'} mb-3`}>
                                <div className={`p-2 ${isImmediate ? 'bg-white/20' : 'bg-purple-100'} rounded-full`}>
                                    {action.icon}
                                </div>
                                <h3 className={`text-lg font-semibold ml-3 ${isImmediate ? 'text-white' : 'text-gray-900'}`}>{action.title}</h3>
                                </div>
                                <p className={`text-sm ${isImmediate ? 'text-red-100' : 'text-gray-600'}`}>{action.description}</p>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;