import React from 'react';
import Card from '../components/ui/Card';
import { BellIcon } from '../components/icons';

const NotificationsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Notificações</h1>
            <Card>
                <div className="text-center text-gray-600 p-8">
                    <div className="inline-block bg-purple-100 text-purple-600 rounded-full p-4 mb-4">
                        <BellIcon />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Tudo em dia!</h2>
                    <p>Você não tem nenhuma notificação nova no momento.</p>
                </div>
            </Card>
        </div>
    );
};

export default NotificationsPage;
