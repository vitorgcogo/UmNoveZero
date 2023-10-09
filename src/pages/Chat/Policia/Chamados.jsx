import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';  // Ajuste para o seu caminho de configuração

const Chamados = () => {
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState('');

    useEffect(() => {
        const roomsCollection = query(
            collection(db, 'conversations'),
            orderBy('timestamp', 'desc') // Ordenando pela timestamp em ordem decrescente
        );
    
        const unsubscribe = onSnapshot(roomsCollection, (snapshot) => {
            const updatedRooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRooms(updatedRooms);
        });
    
        return () => unsubscribe();
    }, []);
    

    

    return (
        <div className="conversation-list">
            <h3>Chamados</h3>
            {rooms.map(room => (
                <div key={room.id} className="conversation-item">
                    <a className="conversation-link" href={`/admin/chamado/${room.id}`}>
                        <span className="conversation-text">Chamado {room.id} </span>
                    </a>
                </div>
            ))}
            
        </div>
    );
};
export default Chamados;
