import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTerms } from '../context/TermsContext';
import Card from '../components/ui/Card';
import { fileToBase64 } from '../utils/file';
import { PaperclipIcon, CloseIcon } from '../components/icons';

const StartCallPage: React.FC = () => {
    const [complaint, setComplaint] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { promptForTerms } = useTerms();
    const navigate = useNavigate();
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        } else {
            setFile(null);
        }
    };

    const handleStartCall = async () => {
        if (!complaint) {
            setError('Por favor, descreva seu sintoma.');
            return;
        }
        if (!user) {
            setError('Usuário não autenticado.');
            return;
        }
        setError(null);

        const canProceed = await promptForTerms();
        if (!canProceed) {
            return; 
        }

        setIsLoading(true);

        try {
            const callPayload: { complaint: string; file?: string; extension_file?: string } = {
                complaint,
            };

            if (file) {
                const base64File = await fileToBase64(file);
                const nameParts = file.name.split('.');
                const fileExtension = nameParts.length > 1 ? nameParts.pop() || '' : '';
                
                callPayload.file = base64File;
                callPayload.extension_file = fileExtension;
            }

            // Navigate to the device test page, passing the payload.
            navigate('/device-test', {
                state: {
                    type: 'immediate',
                    payload: callPayload,
                },
            });

        } catch (e: any) {
            setError(e.message || 'Falha ao processar o arquivo. Por favor, tente novamente.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-red-600">Pronto Atendimento médico</h1>
            <Card>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Queixa Principal</label>
                        <p className="mb-2 text-sm text-gray-600">Descreva seu principal sintoma para que possamos te direcionar para um clínico geral.</p>
                        <textarea
                            value={complaint}
                            onChange={(e) => setComplaint(e.target.value)}
                            rows={4}
                            className="w-full p-2 border rounded border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Ex: Dor de cabeça forte, febre, etc."
                        />
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
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                            >
                                <PaperclipIcon />
                                <span className="ml-2">Anexar Documentos</span>
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
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">{error}</div>}
                
                <button
                    onClick={handleStartCall}
                    disabled={isLoading}
                    className="mt-6 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    {isLoading ? 'Aguarde...' : 'Testar Equipamento e Iniciar'}
                </button>
            </Card>
        </div>
    );
};

export default StartCallPage;