import React, { ReactNode } from 'react';
import { CloseIcon } from '../icons';
import Card from './Card';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-lg transform transition-all"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
                role="document"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Fechar modal"
                    >
                        <CloseIcon />
                    </button>
                </div>
                {children}
            </Card>
        </div>
    );
};

export default Modal;