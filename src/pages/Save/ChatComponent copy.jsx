import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, onSnapshot, orderBy , query } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ChatComponent2 = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (roomId) {
            const messagesCollection = query(
                collection(db, 'conversations', roomId, 'messages'),
                orderBy('timestamp', 'asc')
            );
            const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
                const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(fetchedMessages);
            });
            return () => unsubscribe();
        }
    }, [roomId]);
    

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() !== '') {
            await addDoc(collection(db,'conversations', roomId, 'messages'), {
                text: newMessage,
                roomId: roomId,
                timestamp: new Date()
            });
            setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            <h3>Chat</h3>
            <div className="message-list">
                {messages.map(message => (
                    <div key={message.id} className={`message ${message.sender}`}>{message.text}</div>
                ))}
            </div>
            <form className="message-form" onSubmit={sendMessage}>
                <input className="message-input" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Digite sua mensagem" />
                <button className="send-button" type="submit">Enviar</button>
            </form>
        </div>
    );
};

export default ChatComponent2;
