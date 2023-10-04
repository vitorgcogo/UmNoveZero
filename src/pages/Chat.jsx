import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

function Chat() {
    const [currentRoom, setCurrentRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newRoom, setNewRoom] = useState('');

    const createRoom = async () => {
        if (newRoom.trim() !== '') {
            await addDoc(collection(db, 'conversations'), {
                name: newRoom
            });
            setNewRoom('');
        }
    };

    useEffect(() => {
        const q = query(collection(db, 'conversations'));
        const unsubscribe = onSnapshot(q, snapshot => {
            setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (currentRoom) {
            const q = query(collection(db, 'conversations', currentRoom, 'messages'), orderBy('timestamp', 'asc'));
            const unsubscribe = onSnapshot(q, snapshot => {
                setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            return unsubscribe;
        } else {
            setMessages([]);
        }
    }, [currentRoom]);

    const sendMessage = async (e) => {
        e.preventDefault();

        if (newMessage.trim() !== '' && currentRoom) {
            await addDoc(collection(db, 'conversations', currentRoom, 'messages'), {
                text: newMessage,
                timestamp: serverTimestamp()
            });
            setNewMessage('');
        }
    };

    return (
        <div>
            <div>
                <h3 className='text-white'>Salas de chat</h3>
                {rooms.map(room => (
                    <button 
                        key={room.id}
                        onClick={() => setCurrentRoom(room.id)}
                        style={{ background: currentRoom === room.id ? 'lightblue' : 'white' }}
                    >
                        {room.name}
                    </button>
                ))}
            </div>

            {currentRoom && (
                <>
                    <div>
                        {messages.map(message => (
                            <p key={message.id}>{message.text}</p>
                        ))}
                    </div>
                    <form onSubmit={sendMessage}>
                        <input value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                        <button type="submit">Enviar</button>
                    </form>
                </>
            )}

            
<div>
    <h3>Criar nova conversa</h3>
    <input value={newRoom} onChange={e => setNewRoom(e.target.value)} />
    <button onClick={createRoom}>Criar</button>
</div>
        </div>
    );
}

export default Chat;
