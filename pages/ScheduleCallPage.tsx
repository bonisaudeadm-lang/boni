import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Specialty, Professional } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTerms } from '../context/TermsContext';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { fileToBase64 } from '../utils/file';
import { UploadIcon, CloseIcon } from '../components/icons';

const ScheduleCallPage: React.FC = () => {
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { promptForTerms } = useTerms();
    const navigate = useNavigate();

    // Form state
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedProfessional, setSelectedProfessional] = useState('');
    const [complaint, setComplaint] = useState('');
    const [date, setDate] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [specRes, profRes] = await Promise.all([
                    api.getSpecialties(),
                    api.getProfessionals()
                ]);
                setSpecialties(specRes);
                setProfessionals(profRes);
            } catch (err: any) {
                console.error("Failed to fetch scheduling data", err);
                setError(err.message || "Não foi possível carregar os dados para agendamento.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        } else {
            setFile(null);
        }
    };
    
    const handleSchedule = async () => {
        if (!selectedSpecialty || !selectedProfessional || !date || !complaint) {
            setError("Todos os campos, exceto o anexo, são obrigatórios.");
            return;
        }
        if (!user) {
            setError("Usuário não autenticado.");
            return;
        }
        
        setError(null);
        
        const canProceed = await promptForTerms();
        if (!canProceed) {
            return;
        }

        setIsSubmitting(true);

        try {
            let base64File = "";
            let fileExtension = "";

            if (file) {
                base64File = await fileToBase64(file);
                const nameParts = file.name.split('.');
                if (nameParts.length > 1) {
                    fileExtension = nameParts.pop() || '';
                }
            }

            const specialtyName = specialties.find(s => s.id === selectedSpecialty)?.name;
            const professionalName = professionals.find(p => p.id === selectedProfessional)?.name;
            
            const callDetails = {
                specialty_id: selectedSpecialty,
                specialty_name: specialtyName,
                provider_id: selectedProfessional,
                provider_name: professionalName,
                complaint,
                dateScheduled: date.replace('T', ' '),
                file: base64File,
                extension_file: fileExtension,
            };

            // Navigate to device test page with call details
            navigate('/device-test', {
                state: {
                    type: 'scheduled',
                    payload: callDetails,
                },
            });

        } catch(e: any) {
            setError(e.message || 'Falha ao processar o arquivo ou iniciar o processo de agendamento.');
            setIsSubmitting(false);
        }
    }

    if (isLoading && specialties.length === 0) return <LoadingSpinner />;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Agendar Consulta</h1>
            <Card>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-purple-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white">
                           <option value="">Selecione...</option>
                           {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Profissional</label>
                        <select value={selectedProfessional} onChange={e => setSelectedProfessional(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-purple-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white">
                            <option value="">Selecione...</option>
                           {professionals.filter(p => !selectedSpecialty || p.specialties.some(s => s.id === selectedSpecialty)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
                        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-purple-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Queixa Principal</label>
                        <textarea value={complaint} onChange={e => setComplaint(e.target.value)} rows={3} className="mt-1 block w-full p-2 border border-purple-200 rounded-md bg-white" placeholder="Descreva seus sintomas"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Anexar Exame (Opcional)</label>
                        <div className="mt-1">
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <UploadIcon />
                                <span className="ml-2">Escolher arquivo</span>
                            </label>
                        </div>
                        {file && (
                            <div className="mt-2 flex items-center justify-between bg-purple-50 p-2 rounded-md border border-purple-200">
                                <p className="text-sm text-gray-700 truncate flex-1 mr-2">{file.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                    aria-label="Remover arquivo"
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                        )}
                    </div>

                    <button onClick={handleSchedule} disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-purple-300">
                        {isSubmitting ? 'Aguarde...' : 'Testar Equipamento'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default ScheduleCallPage;