import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { enviarDados } from '../../Api/Ocorrencia';


const ChatComponent2 = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [awaitingDescription, setAwaitingDescription] = useState(false);
    const [showRestartButton, setShowRestartButton] = useState(false);

    const [description, setDescription] = useState('');

    const endOfChatRef = React.useRef(null);

    const scrollToBottom = () => {
        endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

            axios.get('http://localhost:5000/welcome_message')
                .then(response => {
                    setMessages(prevMessages => [...prevMessages, { text: response.data.response, sender: 'bot', timestamp: new Date() }]);
                });


            return () => unsubscribe();
        }
    }, [roomId]);

    const sendMessage = async () => {
        if (newMessage.trim() !== '') {
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: newMessage,
                sender: 'user',
                roomId: roomId,
                timestamp: new Date()
            });
            setDescription(newMessage)
            setNewMessage('');

            if (awaitingDescription) {
                await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                    text: "Por favor, permita a localização para prosseguir.",
                    sender: 'bot',
                    roomId: roomId,
                    timestamp: new Date()
                });
                setAwaitingDescription(false);
                setTimeout(handleLocationPermission, 1500);
            } else {
                axios.post('http://localhost:5000/chatbot', { message: newMessage })
                    .then(response => {
                        const botResponse = response.data.response;
                        const detectedIntent = response.data.intent;
                        addDoc(collection(db, 'conversations', roomId, 'messages'), {
                            text: botResponse,
                            sender: 'bot',
                            roomId: roomId,
                            timestamp: new Date()
                        });
                        if (detectedIntent === 'relatar_crime' || detectedIntent === 'emergencia') {
                            addDoc(collection(db, 'conversations', roomId, 'messages'), {
                                text: "Você gostaria de registrar um chamado?",
                                sender: 'bot',
                                type: 'option',
                                roomId: roomId,
                                timestamp: new Date()
                            });
                        }
                    });
            }
        }
    };

    const handleOptionClick = (option) => {
        if (option === "Sim") {
            setMessages(prevChat => [...prevChat, { text: "Sim", sender: 'user' }]);
            setMessages(prevChat => [...prevChat, { text: "Por favor, descreva o ocorrido.", sender: 'bot' }]);
            setAwaitingDescription(true);
        } else {
            setMessages(prevChat => [...prevChat, { text: "Não", sender: 'user' }]);
            setMessages(prevChat => [...prevChat, { text: "Obrigado pela conversa. ", sender: 'bot' }]);
            setShowRestartButton(true);


        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleLocationPermission = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {

                enviarDados(messages, description, position.coords.latitude, position.coords.longitude)

                setMessages(prevChat => [...prevChat, { text: "Localização registrada. Obrigado por informar.", sender: 'bot' }]);
            });
        } else {
            console.error("Geolocation nao suportada pelo navegador.");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header" onClick={() => navigate(-1)}>
                <i className=" back-icon bi bi-chevron-left"></i>
                <h3 >Ticket #{roomId}</h3>
            </div>
            <div className="message-list" id='t'>

                {messages.map((msg, index) => (
                    <div key={msg.id} className={msg.sender}>
                        {msg.text}
                        {msg.type === 'option' && (
                            <div className="options">
                                <button className='btn btn-primary mx-2' onClick={() => handleOptionClick("Sim")}>Sim</button>
                                <button className='btn btn-danger mx-2' onClick={() => handleOptionClick("Não")}>Não</button>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={endOfChatRef}></div>
            </div>
            <form className="message-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <input className="message-input" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Digite sua mensagem" />
                <button className="send-button" type="submit">Enviar</button>
            </form>
        </div>
    );
};

export default ChatComponent2;