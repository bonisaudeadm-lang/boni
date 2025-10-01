import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const PatientsListPage: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);


    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.getPatients();
                setPatients(response);
            } catch (err: any) {
                console.error("Failed to fetch patients", err);
                setError(err.message || "Não foi possível carregar os pacientes.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPatients();
    }, []);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Gestão de Pacientes</h1>
            <Card className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-100">
                    <thead className="bg-purple-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">CPF</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-purple-100">
                        {patients.map((patient) => (
                            <tr key={patient.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                    <div className="text-sm text-gray-500">{patient.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.cpf_cnpj}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="#" className="text-purple-600 hover:text-purple-900">Editar</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default PatientsListPage;