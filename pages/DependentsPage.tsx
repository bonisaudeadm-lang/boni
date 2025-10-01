import React, { useState, useEffect, FormEvent } from 'react';
import { api } from '../services/api';
import { Patient } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

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


const DependentsPage: React.FC = () => {
    const [dependents, setDependents] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDependent, setSelectedDependent] = useState<Patient | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => {
        fetchDependents();
    }, []);

    const handleOpenModal = (dependent: Patient | null = null) => {
        setSelectedDependent(dependent);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDependent(null);
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
            fetchDependents(); // Refresh list
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao salvar o dependente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (dependent: Patient) => {
        if (window.confirm(`Tem certeza que deseja remover ${dependent.name}?`)) {
            try {
                await api.deleteDependent(dependent.registry);
                fetchDependents(); // Refresh list
            } catch (err: any) {
                setError(err.message || "Ocorreu um erro ao remover o dependente.");
            }
        }
    };

    const renderDependentCard = (dependent: Patient) => (
        <Card key={dependent.id} className="mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-gray-900">{dependent.name}</p>
                    <p className="text-sm text-gray-500">CPF: {dependent.cpf_cnpj}</p>
                </div>
                <div className="flex items-center gap-4">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dependent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dependent.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                    <button onClick={() => handleOpenModal(dependent)} className="text-purple-600 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(dependent)} className="text-red-600 hover:underline">Remover</button>
                </div>
            </div>
        </Card>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-900">Meus Dependentes</h1>
                 <button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Adicionar Dependente
                </button>
            </div>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            {isLoading ? (
                <LoadingSpinner />
            ) : dependents.length > 0 ? (
                dependents.map(renderDependentCard)
            ) : (
                <Card>
                    <p className="text-center text-gray-600">Você ainda não cadastrou nenhum dependente.</p>
                </Card>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedDependent ? 'Editar Dependente' : 'Adicionar Dependente'}
            >
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

export default DependentsPage;