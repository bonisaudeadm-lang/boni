import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import AudioVisualizer from '../components/ui/AudioVisualizer';

const DeviceTestPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { type, payload } = location.state || {};

    // Effect to request access to media devices and get the stream
    useEffect(() => {
        // Redirect if the page is accessed directly without state
        if (!type || !payload) {
            navigate('/', { replace: true });
            return;
        }

        const setupMedia = async () => {
            setIsLoading(true);
            try {
                // Request camera and microphone access
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream); // Set the stream, which will trigger the next effect
            } catch (err: any) {
                console.error("Error accessing media devices.", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError("Permissão para câmera e microfone negada. Por favor, habilite o acesso nas configurações do seu navegador.");
                } else {
                    setError("Não foi possível acessar sua câmera ou microfone. Verifique se os dispositivos estão conectados e não estão sendo usados por outro aplicativo.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        setupMedia();
        
    // The dependency array is intentionally empty to run this effect only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Effect to attach the media stream to the video element and handle cleanup
    useEffect(() => {
        // If we have a stream and the video element is ready, attach it.
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        // Cleanup function: this will be called when the component unmounts.
        return () => {
            // Stop all media tracks to release the camera and microphone.
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]); // This effect runs whenever the 'stream' object changes.

    const handleConfirm = () => {
        if (!user) {
            setError("Sessão expirada. Por favor, faça login novamente.");
            return;
        }
        
        // Navigate to the waiting room, which will handle the API call.
        navigate('/waiting-room', {
            state: {
                type,
                payload,
            },
            replace: true, // Replace device-test in history so user can't go back to it
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Teste de Áudio e Vídeo</h1>
            <Card>
                {isLoading && <LoadingSpinner />}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{error}</div>}
                
                {!isLoading && !error && (
                    <>
                        <div className="bg-black rounded-lg overflow-hidden mb-4 border-4 border-purple-200">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-auto"></video>
                        </div>
                        <div className="mb-6">
                            <p className="text-center text-gray-600 mb-2">Verifique se sua imagem aparece acima e se a barra abaixo reage à sua voz.</p>
                            {stream && <AudioVisualizer stream={stream} />}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                             <button
                                onClick={() => navigate(-1)}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-colors"
                            >
                                Tudo certo, conectar agora
                            </button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default DeviceTestPage;