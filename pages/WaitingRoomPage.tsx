import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const waitingMessages = [
    "Estamos conectando você ao profissional...",
    "Aguarde um momento, estamos preparando sua sala virtual.",
    "Sua consulta começará em breve.",
    "Verificando a disponibilidade do médico..."
];

const WaitingRoomPage: React.FC = () => {
    const [statusMessage, setStatusMessage] = useState(waitingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { type, payload } = location.state || {};

    useEffect(() => {
        // Redirect if the page is accessed directly without state
        if (!type || !payload || !user) {
            navigate('/', { replace: true });
            return;
        }

        // Start cycling through messages
        let messageIndex = 0;
        messageIntervalRef.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % waitingMessages.length;
            setStatusMessage(waitingMessages[messageIndex]);
        }, 3000); // Change message every 3 seconds

        const initiateCall = async () => {
            try {
                let response;
                if (type === 'immediate') {
                    response = await api.startImmediateCall(payload, user);
                } else if (type === 'scheduled') {
                    response = await api.scheduleCall(payload, user);
                } else {
                    throw new Error("Tipo de chamada inválido.");
                }

                if (response && response.URL) {
                    setStatusMessage("Conexão estabelecida! Redirecionando...");
                    // Give a moment for the user to see the success message
                    setTimeout(() => {
                        window.open(response.URL, '_blank', 'noopener,noreferrer');
                        navigate('/', { replace: true }); // Go back to dashboard
                    }, 1500);
                } else {
                    throw new Error("A API não retornou uma URL para a chamada. Por favor, tente novamente.");
                }

            } catch (err: any) {
                setError(err.message || 'Ocorreu um erro ao iniciar a chamada. Tente novamente.');
            } finally {
                if (messageIntervalRef.current) {
                    clearInterval(messageIntervalRef.current);
                }
            }
        };

        initiateCall();

        // Cleanup interval on component unmount
        return () => {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-white">
            {!error ? (
                <>
                    <div className="mb-8">
                         <div className="animate-pulse text-purple-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                         </div>
                    </div>
                    <LoadingSpinner />
                    <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Aguarde, por favor</h1>
                    <p className="text-gray-600 max-w-sm">{statusMessage}</p>
                </>
            ) : (
                 <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-md w-full">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Falha na Conexão</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
                        >
                            Tentar Novamente
                        </button>
                         <button
                            onClick={() => navigate('/')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Ir para o Início
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaitingRoomPage;
