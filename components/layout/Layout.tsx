import React, { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-purple-50">
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
};

export default Layout;
