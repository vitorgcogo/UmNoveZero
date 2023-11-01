import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, orderBy, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

const Historico = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            if(auth.currentUser) {
                const userId = auth.currentUser.uid; 
    
                const roomsCollection = query(
                    collection(db, 'conversations'),
                    where('userId', '==', userId),
                    orderBy('timestamp', 'desc')
                );
    
                const roomsSnapshot = await getDocs(roomsCollection);
                setRooms(roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else {
                console.error("Nenhum usuário autenticado.");
            }
        };
    
        // Observador para mudanças no estado de autenticação
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchRooms();
            } else {
                console.error("Nenhum usuário autenticado.");
            }
            setIsLoaded(true); // Marcar que o estado de autenticação foi verificado
        });
    
        // Limpar o observador quando o componente for desmontado
        return () => unsubscribe();
    }, []);
    

    const createNewConversation = async () => {
        if (!auth.currentUser) {
            console.error("Nenhum usuário autenticado.");
            return;
        }

        const userId = auth.currentUser.uid;

        const newRoomRef = await addDoc(collection(db, 'conversations'), {
            name: "Chamado " + (rooms.length + 1),
            timestamp: new Date(),
            userId: userId
        });

        const roomId = newRoomRef.id;

        await addDoc(collection(db, 'conversations', roomId, 'messages'), {
            text: "Olá! Como posso ajudar?",
            sender: 'bot',
            timestamp: new Date()
        });

        window.location.href = `/chat/${newRoomRef.id}`;
    };
    if (!isLoaded) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="conversation-list">
            <h3>Conversas</h3>
            {rooms.map(room => (
                <div key={room.id} className="conversation-item">
                    <a className="conversation-link" href={`/chat/${room.id}`}>
                        <span className="conversation-text">Chamado - {room.id}</span>
                    </a>
                </div>
            ))}
            <div className="add-conversation-button" onClick={createNewConversation}>
                <span>+</span>
            </div>
        </div>
    );
};

export default Historico;
