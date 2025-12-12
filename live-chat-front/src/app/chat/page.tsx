'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Sidebar from '@/src/components/sidebar';

export default function ChatPage() {
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('chat_token');
        if (!token) {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="flex h-screen bg-gray-950 text-white">
            <Sidebar />

            <main className="flex-1 flex flex-col items-center justify-center bg-gray-900 border-l border-gray-800">
                <div className="text-center p-10 opacity-50">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-bold mb-2">Bem-vindo ao LiveChat</h2>
                    <p>Selecione um amigo na barra lateral para começar a conversar.</p>
                    <p className="text-sm mt-4 text-gray-400">Ou adicione alguém buscando pelo email.</p>
                </div>
            </main>
        </div>
    );
}
