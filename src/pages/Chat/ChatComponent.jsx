import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { collection, addDoc, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { enviarDados, updateStatus } from '../../Api/Ocorrencia';
import { FaRobot } from 'react-icons/fa';


const ChatComponent2 = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [awaitingDescription, setAwaitingDescription] = useState(false);
    const [showRestartButton, setShowRestartButton] = useState(false);
    const [status, setStatus] = useState(null);
    const [awaitingType, setAwaitingType] = useState(false);

    const [description, setDescription] = useState('');

    const endOfChatRef = React.useRef(null);

    const scrollToBottom = () => {
        endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {

        const roomRef = doc(db, 'conversations', roomId);
        const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
            setStatus(snapshot.data().status);
        });

        const messagesCollection = query(
            collection(db, 'conversations', roomId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribeMessages = onSnapshot(messagesCollection, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fetchedMessages);
        });

        if (status === null) {
            axios.get('http://localhost:5000/welcome_message')
                .then(response => {
                    setMessages(prevMessages => [...prevMessages, { text: response.data.response, sender: 'bot', timestamp: new Date() }]);
                });
        }

        return () => {
            unsubscribeRoom();
            unsubscribeMessages();
        };
    }, [roomId, status]);

    const sendMessage = async () => {
        if (newMessage.trim() !== '') {
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: newMessage,
                sender: 'user',
                roomId: roomId,
                timestamp: new Date()
            });
    
            setNewMessage('');
    
            if (awaitingDescription) {
                setDescription(newMessage);
                setAwaitingDescription(false);
    
                await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                    text: "Por favor, permita a localização para prosseguir.",
                    sender: 'bot',
                    roomId: roomId,
                    timestamp: new Date()
                });
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

    const handleOptionClick = async (option) => {
        if (option === "Sim" && !awaitingType) {
            // Perguntar o tipo da ocorrência
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: "Qual o tipo da ocorrência?",
                sender: 'bot',
                roomId: roomId,
                timestamp: new Date()
            });
            setAwaitingType(true);
        } else if (awaitingType) {
            // Salvar o tipo de ocorrência escolhido pelo usuário
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: option, // O tipo de ocorrência escolhido pelo usuário
                sender: 'user',
                roomId: roomId,
                timestamp: new Date()
            });
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: "Por favor, descreva o ocorrido.",
                sender: 'bot',
                roomId: roomId,
                timestamp: new Date()
            });
            setAwaitingType(false);
            setAwaitingDescription(true);
        } else if (option === "Não") {
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: "Não",
                sender: 'user',
                roomId: roomId,
                timestamp: new Date()
            });
            await addDoc(collection(db, 'conversations', roomId, 'messages'), {
                text: "Obrigado pela conversa.",
                sender: 'bot',
                roomId: roomId,
                timestamp: new Date()
            });
            updateStatus(roomId, 'cancel');
            setShowRestartButton(true);
        }
    };

    const handleOcorrenciaTypeSelection = async (ocorrenciaType) => {
        const roomRef = doc(db, 'conversations', roomId);
        
        // Update the 'TipoOcorrencia' in the database
        await updateDoc(roomRef, { TipoOcorrencia: ocorrenciaType });
        
        await addDoc(collection(db, 'conversations', roomId, 'messages'), {
            text: ocorrenciaType,
            sender: 'user',
            roomId: roomId,
            timestamp: new Date()
        });
        
        // After storing the type of occurrence, prompt for description
        await addDoc(collection(db, 'conversations', roomId, 'messages'), {
            text: "Por favor, descreva o ocorrido.",
            sender: 'bot',
            roomId: roomId,
            timestamp: new Date()
        });
        
        setAwaitingDescription(true);
    };
    
    

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleLocationPermission = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {

                setDescription(newMessage);

                enviarDados(roomId, newMessage, position.coords.latitude, position.coords.longitude)
                updateStatus(roomId, 'Espera')
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
                <h3 >Chamados #{roomId}</h3>
            </div>
            <div className="message-list" id='t'>

            {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.sender === 'bot' && <FaRobot className="bot-icon" />}
                        {msg.text}
                        {msg.type === 'option' && status == null && !awaitingType && (
                            <div className="options">
                                <button className='btn btn-primary mx-2' onClick={() => handleOptionClick("Sim")}>Sim</button>
                                <button className='btn btn-danger mx-2' onClick={() => handleOptionClick("Não")}>Não</button>
                            </div>
                        )}
                        {msg.text === "Qual o tipo da ocorrência?" && (
                            <div className="options2">
                                <div className="options-row">
                                    <button className='btn btn-primary mx-2' onClick={() => handleOcorrenciaTypeSelection("Assalto")}>Assalto</button>
                                    <button className='btn btn-primary mx-2' onClick={() => handleOcorrenciaTypeSelection("Roubo")}>Roubo</button>
                                    <button className='btn btn-primary mx-2' onClick={() => handleOcorrenciaTypeSelection("Acidente")}>Acidente</button>
                                    <button className='btn btn-primary mx-2' onClick={() => handleOcorrenciaTypeSelection("Invasão")}>Invasão</button>
                                    <button className='btn btn-primary mx-2' onClick={() => handleOcorrenciaTypeSelection("Agressão")}>Agressão</button>
                                    <button className='btn btn-primary mx-2' onClick={() => handleOcorrenciaTypeSelection("Perturbação da Paz")}>Perturbação da Paz</button>
                                    <button className='btn btn-primary mx-2' onClick={() => handleOcorrenciaTypeSelection("Outro")}>Outro</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}



                <div ref={endOfChatRef}></div>
            </div>

            <form className="message-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                {status == null ?
                    <>
                        <input className="message-input" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Digite sua mensagem" />
                        <button className="send-button" type="submit">Enviar</button>
                    </>
                    :
                    status == 'Espera' ?
                        <p>Seu chamado foi enviado com Sucesso. Aguarde a Resposta.</p>
                        :
                        <p>Esse chat foi encerrado!</p>
                }
            </form>
        </div>
    );
};
export default ChatComponent2;