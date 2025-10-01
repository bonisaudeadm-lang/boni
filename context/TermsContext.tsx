import React, { useState, useEffect, useContext, createContext, useMemo, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import TermsModal from '../components/ui/TermsModal';

interface TermsContextType {
  isTermsAccepted: boolean;
  promptForTerms: () => Promise<boolean>;
}

const TermsContext = createContext<TermsContextType | null>(null);

export const TermsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [isAccepted, setIsAccepted] = useState(() => {
    try {
        return localStorage.getItem('boni_terms_accepted') === 'true';
    } catch (e) {
        return false;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Holds the resolver for the promise returned by promptForTerms
  const resolver = useRef<((accepted: boolean) => void) | null>(null);

  // Automatically show the modal after login if terms have not been accepted yet.
  useEffect(() => {
    if (token && !isAccepted) {
        // A small delay to allow the main UI to settle before showing the modal.
        const timer = setTimeout(() => setIsModalOpen(true), 500);
        return () => clearTimeout(timer);
    }
  }, [token, isAccepted]);

  const promptForTerms = useCallback((): Promise<boolean> => {
    if (isAccepted) {
      return Promise.resolve(true);
    }
    
    // If a prompt is already open, return the same promise.
    if (isModalOpen && resolver.current) {
        return new Promise<boolean>(resolve => {
            resolver.current = resolve;
        });
    }

    setIsModalOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, [isAccepted, isModalOpen]);

  const handleAccept = useCallback(async () => {
    setIsLoading(true);
    try {
      // On acceptance, first request camera and microphone permissions.
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      // If permissions are granted, we can proceed.
      localStorage.setItem('boni_terms_accepted', 'true');
      setIsAccepted(true);
      setIsModalOpen(false);
      if (resolver.current) {
        resolver.current(true); // User can proceed.
      }
    } catch (error: any) {
      console.error("Permission for camera/microphone was denied or dismissed.", error);

      // If permissions are denied or the prompt is dismissed, the user cannot proceed.
      // We provide a helpful message based on the error type.
      let alertMessage = "O acesso à câmera e ao microfone é necessário para a teleconsulta. Por favor, tente novamente e conceda as permissões quando solicitado pelo navegador.";

      if (error.name === 'NotAllowedError') {
          alertMessage = "Você bloqueou o acesso à câmera e ao microfone. Para usar a teleconsulta, você precisará permitir o acesso nas configurações do seu navegador para este site.";
      }

      alert(alertMessage);
      
      // Close the modal, but DO NOT set terms as accepted.
      setIsModalOpen(false);
      if (resolver.current) {
        resolver.current(false); // User cannot proceed.
      }
    } finally {
      setIsLoading(false);
      resolver.current = null;
    }
  }, []);

  const handleDecline = useCallback(() => {
    setIsModalOpen(false);
    if (resolver.current) {
      resolver.current(false);
      resolver.current = null;
    }
  }, []);

  const value = useMemo(() => ({ isTermsAccepted: isAccepted, promptForTerms }), [isAccepted, promptForTerms]);

  return (
    <TermsContext.Provider value={value}>
      {children}
      <TermsModal 
        isOpen={isModalOpen}
        isLoading={isLoading}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </TermsContext.Provider>
  );
};

export const useTerms = () => {
  const context = useContext(TermsContext);
  if (!context) {
    throw new Error('useTerms must be used within a TermsProvider');
  }
  return context;
};