import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MedicalRecord, Patient } from '../types';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { HistoryIcon } from '../components/icons';

const MedicalRecordPage: React.FC = () => {
    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    
    const [dependents, setDependents] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');

    // Combine user (holder) and dependents into a single list for the selector.
    const allPeople = useMemo(() => {
        if (!user) return [];
        const holder = {
            id: user.id,
            name: user.name,
            registry: user.registry,
        };
        // Dependents (Patient type) already have id, name, and registry.
        return [holder, ...dependents];
    }, [user, dependents]);

    // Effect to set the initial patient and fetch the list of dependents.
    useEffect(() => {
        if (user) {
            setSelectedPatientId(user.id); // Default to the logged-in user (holder).

            const fetchDependents = async () => {
                try {
                    const deps = await api.getDependents();
                    setDependents(deps);
                } catch (err) {
                    console.error("Failed to fetch dependents for medical record page", err);
                    // This is not a fatal error, the page can still show the holder's record.
                }
            };
            fetchDependents();
        }
    }, [user]);

    // Effect to fetch the medical record whenever the selected patient changes.
    useEffect(() => {
        if (!selectedPatientId || allPeople.length === 0 || !user) {
            // If there's no selection or no people loaded yet, do nothing.
            return;
        }

        const selectedPerson = allPeople.find(p => p.id === selectedPatientId);
        if (!selectedPerson) {
            // This case shouldn't happen if logic is correct.
            return;
        }
        
        const isHolder = selectedPerson.id === user.id;

        const fetchRecord = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.getMedicalRecord(selectedPerson, isHolder);
                if (response && response.personalData) {
                   setRecord(response);
                } else {
                   // API returned a valid response, but no record data.
                   setRecord(null);
                }
            } catch (err: any) {
                // A 404 status from the API means the record doesn't exist, which is not an error.
                if (err.message && err.message.includes('(Status: 404)')) {
                    setRecord(null);
                } else {
                    console.error("Failed to fetch medical record", err);
                    setError(err.message || "Não foi possível carregar o prontuário médico.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecord();
    }, [selectedPatientId, allPeople, user]);

    const renderList = (title: string, items: string[] | undefined) => (
        <Card className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            {items && items.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            ) : (
                <p className="text-gray-500">Nenhuma informação registrada.</p>
            )}
        </Card>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Prontuário Médico</h1>
            
            {/* Patient Selector - only show if there's more than one person (i.e., dependents exist) */}
            {allPeople.length > 1 && (
                <div className="mb-6 max-w-sm">
                    <label htmlFor="patient-selector" className="block text-sm font-medium text-gray-700">
                        Visualizando prontuário de:
                    </label>
                    <select
                        id="patient-selector"
                        value={selectedPatientId}
                        onChange={e => setSelectedPatientId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-purple-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white"
                        aria-label="Selecionar paciente"
                    >
                        {allPeople.map(person => (
                            <option key={person.id} value={person.id}>
                                {person.name} {person.id === user?.id ? '(Titular)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <Link to="/historico" className="block mb-6">
                <Card className="hover:shadow-lg hover:border-purple-300 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                             <HistoryIcon />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-purple-800">Ver meu Histórico</h3>
                            <p className="text-gray-600">Acesse suas consultas, exames e prescrições.</p>
                        </div>
                    </div>
                </Card>
            </Link>

            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <Card>
                    <p className="text-center text-red-500 p-4">{error}</p>
                </Card>
            ) : record ? (
                <>
                    <Card className="mb-6">
                        <h3 className="text-xl font-semibold mb-3">Dados Pessoais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <p><strong>Nome:</strong> {record.personalData.fullName}</p>
                            <p><strong>Data de Nascimento:</strong> {new Date(record.personalData.birthDate).toLocaleDateString('pt-BR')}</p>
                            <p><strong>CPF:</strong> {record.personalData.cpf}</p>
                            <p><strong>Tipo Sanguíneo:</strong> {record.personalData.bloodType || 'Não informado'}</p>
                            <p><strong>Email:</strong> {record.personalData.email || 'Não informado'}</p>
                            <p><strong>Telefone:</strong> {record.personalData.phone || 'Não informado'}</p>
                        </div>
                    </Card>

                    {renderList("Alergias", record.allergies)}
                    {renderList("Medicamentos de Uso Contínuo", record.continuousMedications)}
                    {renderList("Condições e Diagnósticos", record.diagnosedConditions)}
                </>
            ) : (
                 <Card>
                    <p className="text-center text-gray-600 p-4">Ainda não há informações no prontuário médico para o paciente selecionado.</p>
                </Card>
            )}
        </div>
    );
};

export default MedicalRecordPage;