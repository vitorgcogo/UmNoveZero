import { db } from '../config/firebase';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";  // Importe os métodos necessários do Firestore


export const enviarDados = async (roomId, descricao, latitude, longitude) => {
    try {
        const docRef = doc(db, "conversations", roomId);
        await updateDoc(docRef, {
            descricao: descricao,
            latitude: latitude,
            longitude: longitude
        });
        console.log("Dados salvos com sucesso no ID: ", docRef.id);
    } catch (e) {
        console.error("Erro ao salvar os dados: ", e);
        setErro("Erro ao salvar os dados");
    }
};

export const obterDadosId = async (roomId, setData) => {
    const docRef = doc(db, "conversations", roomId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        console.log("Detalhes da conversa:", docSnapshot.data());
        setData(docSnapshot.data()); // Retorna os dados da conversa
    } else {
        console.log("Nenhum documento encontrado com esse ID!");
        setData(null); // Retorna null se nenhum documento foi encontrado
    }
}

export const obterDados = async (setData) => {
    const dataCollection = collection(db, 'conversations'); // substitua 'nomeDaSuaColecao' pelo nome da sua coleção
    const dataSnapshot = await getDocs(dataCollection);
    const dataList = dataSnapshot.docs.map(doc => doc.data());
    setData(dataList);
};


export const updateStatus = async (roomId, status) => {
    try {
        const docRef = doc(db, "conversations", roomId);
        await updateDoc(docRef, {
            status: status,
        });
        console.log("Dados salvos com sucesso no ID: ", docRef.id);
    } catch (e) {
        console.error("Erro ao salvar os dados: ", e);
        setErro("Erro ao salvar os dados");
    }
};
