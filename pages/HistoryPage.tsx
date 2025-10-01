import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Patient } from '../types';

// Enhanced type for history items to include patient info
interface HistoryItem {
    id?: string;
    protocol?: string;
    specialty?: { name: string };
    provider?: { name: string };
    created_at: string;
    status?: string;
    downloadLinks?: PrescriptionLink[];
    // Added fields
    patientId: string;
    patientName: string;
}

interface PrescriptionLink {
    id: string;
    name: string;
    link: string;
    created_at: string;
}

const HistoryPage: React.FC = () => {
    const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
    const [dependents, setDependents] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [error, setError] = useState<string|null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAllHistory = async () => {
            if (!user) {
                setIsLoading(false);
                setError("Usuário não encontrado.");
                return;
            };

            setIsLoading(true);
            setError(null);
            try {
                const deps = await api.getDependents();
                setDependents(deps);

                const peopleToFetch = [user, ...deps];

                const historyPromises = peopleToFetch.map(person =>
                    api.getHistory(person).then(historyItems =>
                        historyItems.map(item => ({
                            ...item,
                            patientId: person.id,
                            patientName: person.name,
                        }))
                    )
                );

                const nestedHistory = await Promise.all(historyPromises);
                const flatHistory = nestedHistory.flat();

                flatHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                
                setAllHistory(flatHistory);
            } catch (err: any) {
                console.error("Failed to fetch history", err);
                setError(err.message || "Não foi possível carregar o histórico.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllHistory();
    }, [user]);

    const filteredHistory = useMemo(() => {
        if (selectedPatient === 'all') {
            return allHistory;
        }
        return allHistory.filter(item => item.patientId === selectedPatient);
    }, [selectedPatient, allHistory]);

    const allPeople = useMemo(() => (user ? [user, ...dependents] : [...dependents]), [user, dependents]);

    const handleDownload = async (link: PrescriptionLink, patientId: string) => {
        const person = allPeople.find(p => p.id === patientId);
        if (!person) {
            setError("Não foi possível identificar o paciente para realizar o download.");
            return;
        }
    
        setDownloadingId(link.id);
        setError(null);
        try {
            const response = await api.downloadPrescription(link.id, person);
            window.open(response.URL, '_blank', 'noopener,noreferrer');
        } catch (err: any) {
            console.error("Failed to download prescription", err);
            setError(err.message || "Ocorreu um erro ao tentar baixar o documento.");
        } finally {
            setDownloadingId(null);
        }
    };


    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>

    const renderHistoryItem = (item: HistoryItem) => {
        const isConsultation = !item.downloadLinks || item.downloadLinks.length === 0;

        return (
            <Card key={item.id || item.protocol} className="mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-gray-900">{isConsultation ? (item.specialty?.name || 'Clínico Geral') : 'Emissão de Documento'}</p>
                         <p className="text-sm text-gray-500">
                            <strong>Paciente:</strong> {item.patientName}
                         </p>
                        <p className="text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleString('pt-BR')}
                        </p>
                         {isConsultation && item.provider?.name && (
                            <p className="text-sm text-gray-700">
                                Com {item.provider.name}
                            </p>
                        )}
                    </div>
                    {isConsultation && item.status && (
                       <span className="text-sm font-medium text-green-600">{item.status}</span>
                    )}
                </div>
                {item.downloadLinks && item.downloadLinks.length > 0 && (
                    <div className="mt-4 border-t pt-4 border-purple-100">
                        <h4 className="font-semibold mb-2">Documentos:</h4>
                        <ul className="space-y-2">
                           {item.downloadLinks.map(link => (
                                <li key={link.id} className="flex justify-between items-center">
                                    <span>{link.name}</span>
                                     <button
                                        onClick={() => handleDownload(link, item.patientId)}
                                        disabled={downloadingId === link.id}
                                        className="text-purple-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                                    >
                                        {downloadingId === link.id ? 'Baixando...' : 'Baixar'}
                                    </button>
                                </li>
                           ))}
                        </ul>
                    </div>
                )}
            </Card>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Meu Histórico</h1>
            <div className="mb-6 max-w-sm">
                <label htmlFor="patient-filter" className="block text-sm font-medium text-gray-700">Filtrar por Paciente</label>
                <select
                    id="patient-filter"
                    value={selectedPatient}
                    onChange={e => setSelectedPatient(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-purple-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white"
                >
                    <option value="all">Todos</option>
                    {user && <option value={user.id}>{user.name} (Titular)</option>}
                    {dependents.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                </select>
            </div>
            
            <div>
                {filteredHistory.length > 0 ? (
                    filteredHistory.map(renderHistoryItem)
                ) : (
                    <Card>
                        <p className="text-center text-gray-600">Nenhum histórico encontrado para o paciente selecionado.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;