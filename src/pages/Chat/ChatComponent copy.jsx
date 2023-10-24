import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { enviarDados } from '../../Api/Ocorrencia';
import { db } from '../../config/firebase';

const ChatComponent2 = () => {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [awaitingDescription, setAwaitingDescription] = useState(false);
    const [showRestartButton, setShowRestartButton] = useState(false);
    const [awaitingTypeOfCrime, setAwaitingTypeOfCrime] = useState(false);

    const handleTypeOfCrime = (type) => {
        setChat(prevChat => [...prevChat, { text: type, sender: 'user' }]);
        setChat(prevChat => [...prevChat, { text: "Por favor, descreva o ocorrido.", sender: 'bot' }]);
        setAwaitingTypeOfCrime(false);
        setAwaitingDescription(true);
    };

    const renderTypeSelection = () => {
        if (awaitingTypeOfCrime) {
            return (
                <div className="options">
                    <button className='btn btn-primary mx-2' onClick={() => handleTypeOfCrime("Acidente")}>Acidente</button>
                    <button className='btn btn-primary mx-2' onClick={() => handleTypeOfCrime("Assalto")}>Assalto</button>
                    <button className='btn btn-primary mx-2' onClick={() => handleTypeOfCrime("Roubo")}>Roubo</button>
                    <button className='btn btn-primary mx-2' onClick={() => handleTypeOfCrime("Outros")}>Outros</button>
                </div>
            );
        }
        return null;
    };

    const endOfChatRef = React.useRef(null);

    const scrollToBottom = () => {
        endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    useEffect(() => {
        axios.get('http://localhost:5000/welcome_message')
            .then(response => {
                setChat([...chat, { text: response.data.response, sender: 'bot' }]);
            });
    }, []);

    const handleSendMessage = () => {
        if (message.trim()) {
            setChat(prevChat => [...prevChat, { text: message, sender: 'user' }]);
            setMessage('');

            if (awaitingDescription) {
                setChat(prevChat => [...prevChat, { text: "Por favor, permita a localização para prosseguir.", sender: 'bot' }]);
                setAwaitingDescription(false);
                setTimeout(() => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async position => {
                            enviarDados(message, position.coords.latitude, position.coords.longitude);
                            setChat(prevChat => [...prevChat, { text: "Localização registrada. Obrigado por informar.", sender: 'bot' }]);
                        });
                    } else {
                        console.error("Geolocation não suportada pelo navegador.");
                        setChat(prevChat => [...prevChat, { text: "Seu navegador não suporta geolocalização. Tente novamente em outro dispositivo.", sender: 'bot' }]);
                    }
                }, 1500);
                return;
            }

            axios.post('http://localhost:5000/chatbot', { message })
                .then(response => {
                    const botResponse = response.data.response;
                    const detectedIntent = response.data.intent;
                    const action = response.data.action;

                    setChat(prevChat => [...prevChat, { text: botResponse, sender: 'bot' }]);

                    if (detectedIntent === 'relatar_crime' || detectedIntent === 'emergencia' || action === 'prompt_call') {
                        setChat(prevChat => [...prevChat,
                        { text: "Você gostaria de registrar um chamado?", sender: 'bot', type: 'option' }]);
                    }
                });
        }
    };

    const handleRestartConversation = () => {
        setChat(prevChat => [...prevChat, { text: "Olá! Como posso ajudar?", sender: 'bot' }]);
        setShowRestartButton(false);
    };

    const handleOptionClick = (option) => {
        if (option === "Sim") {
            setChat(prevChat => [...prevChat, { text: "Sim", sender: 'user' }]);
            setChat(prevChat => [...prevChat, { text: "Qual o tipo da ocorrência?", sender: 'bot' }]);
            setAwaitingTypeOfCrime(true);
        } else {
            setChat(prevChat => [...prevChat, { text: "Não", sender: 'user' }]);
            setChat(prevChat => [...prevChat, { text: "Obrigado pela conversa. ", sender: 'bot' }]);
            setShowRestartButton(true);
        }
    };
    

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className='container mt-1'>
            <div className="chat-box">
                {chat.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        {msg.text}
                        {msg.type === 'option' && (
                            <div>
                                <button onClick={() => handleOptionClick("Sim")}>Sim</button>
                                <button onClick={() => handleOptionClick("Não")}>Não</button>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={endOfChatRef}></div>
            </div>

            {renderTypeSelection()}

            {showRestartButton && <button onClick={handleRestartConversation}>Iniciar nova conversa</button>}

            <div className="chat-input">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} />
                <button onClick={handleSendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default ChatComponent2;
