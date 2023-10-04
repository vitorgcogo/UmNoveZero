import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const PoliceDashboard = () => {
    const [currentRoom, setCurrentRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    
    useEffect(() => {
        const q = query(collection(db, 'conversations'));
        const unsubscribe = onSnapshot(q, snapshot => {
            setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, []);

    const sendMessageAsPolice = async (response) => {
        if (currentRoom) {
            await addDoc(collection(db, 'conversations', currentRoom, 'messages'), {
                text: response,
                timestamp: serverTimestamp(),
                sender: 'police'
            });
        }
    };

    return (
        <div>
            <h3>Police Dashboard</h3>

            {/* Lista todos os tickets */}
            <div>
                <h4>Chamados Ativos</h4>
                {rooms.map(room => (
                    <div key={room.id}>
                        <button className="ticket-actions"
                            onClick={() => setCurrentRoom(room.id)}
                            style={{ background: currentRoom === room.id ? 'lightblue' : 'white' }}
                        >
                            {room.name}
                        </button>
                    </div>
                ))}
            </div>

            {/* Permite a interação da polícia com o ticket selecionado */}
            {currentRoom && (
                <div>
                    <h4>Ações: </h4>
                    <button className="ticket-actions" onClick={() => sendMessageAsPolice("Enviando viatura")}>Enviar Viatura</button>
                    <button className="ticket-actions" onClick={() => sendMessageAsPolice("Chamado recusado")}>Recusar Chamado</button>
                </div>
            )}
        </div>
    );
}

export default PoliceDashboard;
