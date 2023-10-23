import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const Chamados = () => {
    const [rooms, setRooms] = useState([]);
    const [filterStatus, setFilterStatus] = useState(null);  // null = mostrar pendentes, "all" = mostrar todos

    useEffect(() => {
        const roomsCollection = query(
            collection(db, 'conversations'),
            orderBy('timestamp', 'desc')
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

            <div className="filter-section">
                <button className="ticket-actions2 btn btn-success mx-2" onClick={() => setFilterStatus("Espera")}>Mostrar Pendentes</button>
                <button className="ticket-actions2 btn btn-success mx-2" onClick={() => setFilterStatus("all")}>Mostrar Todos</button>
                <p></p>
            </div>

            {rooms.filter(room => (filterStatus === "all" ? true : room.status === "Espera")).map(room => (
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
