import React from 'react';

interface TermsModalProps {
    isOpen: boolean;
    isLoading: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, isLoading, onAccept, onDecline }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            aria-labelledby="terms-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all" role="document">
                <h2 id="terms-modal-title" className="text-2xl font-bold text-gray-900 mb-4">Termos de Uso e Permissões</h2>
                <p className="text-gray-600 mb-6">
                    Para utilizar nossos serviços de telemedicina, você precisa concordar com nossos Termos de Uso e nos dar permissão para acessar sua câmera e microfone durante as consultas. 
                    Seus dados são protegidos e utilizados apenas para a realização do atendimento.
                </p>
                <div className="flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        onClick={onAccept}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
                    >
                        {isLoading ? 'Aguarde...' : 'Aceitar e Continuar'}
                    </button>
                    <button
                        onClick={onDecline}
                        disabled={isLoading}
                        type="button"
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-6 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Declinar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
