import React, { useState, useEffect, FormEvent, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Patient, Plan } from '../types';

import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { LogoutIcon, ChevronRightIcon, MedicalRecordIcon, FinancialIcon, BellIcon } from '../components/icons';

// --- Sub-component for the form, moved from the obsolete DependentsPage.tsx ---
const DependentForm: React.FC<{
    dependent?: Patient | null;
    onSave: (dependent: Partial<Patient>) => void;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ dependent, onSave, onCancel, isSaving }) => {
    
    const [formData, setFormData] = useState({
        name: dependent?.name || '',
        cpf_cnpj: dependent?.cpf_cnpj || '',
        email: dependent?.email || '',
        phone: dependent?.phone || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({ ...dependent, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-purple-200 rounded-md bg-white"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <input type="text" name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} required className="mt-1 block w-full p-2 border border-purple-200 rounded-md bg-white"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-purple-200 rounded-md bg-white"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full p-2 border border-purple-200 rounded-md bg-white"/>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-purple-300">
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

const ProfileLink: React.FC<{ to: string, icon: ReactNode, title: string, subtitle: string }> = ({ to, icon, title, subtitle }) => (
    <Link to={to} className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-full mr-4">
            {icon}
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <ChevronRightIcon className="text-gray-400" />
    </Link>
);


// --- Main Profile Page Component ---
const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for plan info
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isPlanLoading, setIsPlanLoading] = useState(true);
    const [planError, setPlanError] = useState<string | null>(null);

    // State for dependents management
    const [dependents, setDependents] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDependent, setSelectedDependent] = useState<Patient | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchDependents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.getDependents();
                setDependents(response);
            } catch (err: any) {
                console.error("Failed to fetch dependents", err);
                setError(err.message || "Não foi possível carregar os dependentes.");
            } finally {
                setIsLoading(false);
            }
        };
        
        const fetchPlanDetails = async () => {
            if (!user) return;
            setIsPlanLoading(true);
            setPlanError(null);
            try {
                const holderDetails = await api.getHolderDetails(user.id);
                if (holderDetails && holderDetails.plan) {
                    setPlan(holderDetails.plan);
                } else {
                    setPlan(null);
                }
            } catch (err: any) {
                if (err.message && err.message.includes('(Status: 404)')) {
                    setPlan(null);
                } else {
                    console.error("Failed to fetch plan details", err);
                    setPlanError(err.message || "Não foi possível carregar os detalhes do plano.");
                }
            } finally {
                setIsPlanLoading(false);
            }
        };

        fetchDependents();
        fetchPlanDetails();
    }, [user]);
    
    const handleOpenModal = (dependent: Patient | null = null) => {
        setSelectedDependent(dependent);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDependent(null);
        if (error) setError(null);
    };

    const handleSave = async (dependentData: Partial<Patient>) => {
        setIsSaving(true);
        setError(null);
        try {
            if (selectedDependent) {
                await api.updateDependent(dependentData as Patient);
            } else {
                await api.addDependent(dependentData);
            }
            handleCloseModal();
            const response = await api.getDependents();
            setDependents(response);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao salvar o dependente.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async (dependent: Patient) => {
        if (window.confirm(`Tem certeza que deseja remover ${dependent.name}?`)) {
            setError(null);
            try {
                await api.deleteDependent(dependent.registry);
                const response = await api.getDependents();
                setDependents(response);
            } catch (err: any) {
                setError(err.message || "Ocorreu um erro ao remover o dependente.");
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const renderDependentCard = (dependent: Patient) => (
        <Card key={dependent.id} className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                    <p className="font-bold text-lg text-gray-900">{dependent.name}</p>
                    <p className="text-sm text-gray-500">CPF: {dependent.cpf_cnpj}</p>
                     <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dependent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dependent.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button onClick={() => handleOpenModal(dependent)} className="text-purple-600 hover:underline text-sm font-medium">Editar</button>
                    <button onClick={() => handleDelete(dependent)} className="text-red-600 hover:underline text-sm font-medium">Remover</button>
                </div>
            </div>
        </Card>
    );

    return (
        <div>
            <Card className="mb-6">
                <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-white text-2xl font-bold mr-4">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xl font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </div>
            </Card>

            <div className="space-y-3 mb-6">
                <ProfileLink to="/prontuario-medico" icon={<MedicalRecordIcon />} title="Prontuário Médico" subtitle="Acesse seu histórico de saúde" />
                <ProfileLink to="/financeiro/pagamentos" icon={<FinancialIcon />} title="Financeiro" subtitle="Veja pagamentos e cartões" />
                <ProfileLink to="/notificacoes" icon={<BellIcon />} title="Notificações" subtitle="Suas mensagens e alertas" />
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-gray-900">Meus Dependentes</h2>
                     <button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                        Adicionar
                    </button>
                </div>
                {error && !isModalOpen && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                {isLoading ? (
                    <LoadingSpinner />
                ) : dependents.length > 0 ? (
                    dependents.map(renderDependentCard)
                ) : (
                    !error && <Card>
                        <p className="text-center text-gray-600">Você ainda não cadastrou nenhum dependente.</p>
                    </Card>
                )}
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Meu Plano</h2>
                <Card>
                    {isPlanLoading ? (
                        <LoadingSpinner />
                    ) : planError ? (
                        <p className="text-center text-red-500">{planError}</p>
                    ) : plan ? (
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Nome do Plano</p>
                                <p className="font-semibold text-lg text-gray-800">{plan.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="flex items-center">
                                    <span className={`px-2 py-0.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                        plan.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {plan.status.toLowerCase() === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">Nenhuma informação do plano encontrada.</p>
                    )}
                </Card>
            </div>

            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors font-medium"
            >
                <LogoutIcon />
                <span className="ml-3">Sair da Conta</span>
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedDependent ? 'Editar Dependente' : 'Adicionar Dependente'}
            >
                 {error && isModalOpen && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                <DependentForm
                    dependent={selectedDependent}
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                    isSaving={isSaving}
                />
            </Modal>
        </div>
    );
};

export default ProfilePage;
