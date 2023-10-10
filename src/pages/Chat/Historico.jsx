import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';  // Ajuste para o seu caminho de configuração

const Historico = () => {
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            const roomsCollection = query(
                collection(db, 'conversations'),
                orderBy('timestamp', 'desc') // Ordenando pela timestamp em ordem decrescente
            );

            const roomsSnapshot = await getDocs(roomsCollection);
            setRooms(roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchRooms();
    }, []);


    const createNewConversation = async () => {
        const newRoomRef = await addDoc(collection(db, 'conversations'), {
            name: "Ticket " + (rooms.length + 1),
            timestamp: new Date()  // Adicione isso para ajudar na ordenação
        });

        // Quando você cria uma nova sala de chat (ou ticket):

        const roomId = newRoomRef.id;

        // Adicione imediatamente a mensagem inicial do bot a essa sala de chat:
        await addDoc(collection(db, 'conversations', roomId, 'messages'), {
            text: "Olá! Como posso ajudar?",  // ou sua mensagem de boas-vindas padrão
            sender: 'bot',
            timestamp: new Date()
        });

        // Redireciona o usuário para a nova conversa
        window.location.href = `/chat/${newRoomRef.id}`;
    };

    return (
        <div className="conversation-list">
            <h3>Conversas</h3>
            <p></p>
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
