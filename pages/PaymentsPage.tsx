import React, { useState, useEffect } from 'react';
import { Payment } from '../types';
import Card from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Mock data for payments
const mockPayments: Payment[] = [
    { id: '1', date: '2024-07-20T10:00:00Z', description: 'Consulta Cardiologia', amount: 150.00, status: 'paid' },
    { id: '2', date: '2024-07-15T14:30:00Z', description: 'Plano Mensal - Julho', amount: 250.00, status: 'paid' },
    { id: '3', date: '2024-08-01T09:00:00Z', description: 'Plano Mensal - Agosto', amount: 250.00, status: 'pending' },
];

const PaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate API call
        const fetchPayments = () => {
            setIsLoading(true);
            setError(null);
            setTimeout(() => {
                try {
                    // Sort by date descending
                    const sortedPayments = mockPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setPayments(sortedPayments);
                } catch (err) {
                    setError("Não foi possível carregar o histórico de pagamentos.");
                } finally {
                    setIsLoading(false);
                }
            }, 1000); // 1 second delay
        };
        fetchPayments();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Histórico de Pagamentos</h1>
            <Card className="overflow-x-auto">
                 {payments.length > 0 ? (
                    <table className="min-w-full divide-y divide-purple-100">
                        <thead className="bg-purple-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Descrição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-purple-100">
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(payment.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-600 p-4">Nenhum pagamento encontrado.</p>
                )}
            </Card>
        </div>
    );
};

export default PaymentsPage;