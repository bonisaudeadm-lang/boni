import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../types';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Mock data for payment methods
const mockPaymentMethods: PaymentMethod[] = [
    { id: '1', type: 'credit_card', last4: '4242', brand: 'Visa', isDefault: true },
    { id: '2', type: 'credit_card', last4: '5555', brand: 'Mastercard', isDefault: false },
];

const PaymentMethodsPage: React.FC = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate API call
        const fetchMethods = () => {
            setIsLoading(true);
            setError(null);
            setTimeout(() => {
                try {
                    setMethods(mockPaymentMethods);
                } catch (err) {
                    setError("Não foi possível carregar as formas de pagamento.");
                } finally {
                    setIsLoading(false);
                }
            }, 1000); // 1 second delay
        };
        fetchMethods();
    }, []);

    const renderMethodCard = (method: PaymentMethod) => (
        <Card key={method.id} className="flex justify-between items-center">
            <div>
                <p className="font-bold text-lg">{method.brand} **** **** **** {method.last4}</p>
                {method.isDefault && (
                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Padrão
                    </span>
                )}
            </div>
            <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                Remover
            </button>
        </Card>
    );

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Formas de Pagamento</h1>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Adicionar Novo Cartão
                </button>
            </div>
            <div className="space-y-4">
                {methods.length > 0 ? (
                    methods.map(renderMethodCard)
                ) : (
                    <Card>
                        <p className="text-center text-gray-600">Nenhuma forma de pagamento cadastrada.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PaymentMethodsPage;