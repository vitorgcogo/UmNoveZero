import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { addDoc, collection, doc, getDocs, getFirestore, query, getDoc, where, setDoc } from 'firebase/firestore'
import { config } from './config';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import VerifyErroCode from './VerifyErroCode'

// Initialize Firebase
const app = initializeApp(config);
const storage = getStorage(app);
const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);


const getUserData = async (uid) => {
  try {
      const userDocRef = doc(db, 'usuarios', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
          return userDoc.data();
      } else {
          return null;
      }
  } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return null;
  }
};

const logInWithEmailAndPassword = async (email, password, setResponse) => {
  try {
    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const docs = await getDocs(q);
    if (docs.docs.length === 1) {
      await signInWithEmailAndPassword(auth, email, password);
      const data = docs.docs[0].data();
      setResponse({
        status: 200,
        message: "Sucesso!",
        isAdmin: data.isAdmin
      });
    } else {
      setResponse({
        status: 400,
        message: "Credenciais inválidas.",
      });
      signOut(getAuth());
    }
  } catch (e) {
    setResponse({
      status: 400,
      message: VerifyErroCode(e.code),
    });
    signOut(getAuth());
  }
};

// const logInWithEmailAndPassword = async (email, password, setResponse) => {
//   try {
//     await signInWithEmailAndPassword(auth, email, password);
//     setResponse({
//       status: 200,
//       message: "Sucesso!"
//     });
//   } catch (e) {
//     console.error("Erro ao fazer login:", e); // Mostrar o erro completo
//     setResponse({
//       status: 400,
//       message: VerifyErroCode(e.code),
//     });
//   }
// };


const logInWithEmailAndPasswordAdmin = async (email, password, setResponse) => {
  const auth = getAuth();

  try {
    const q = query(collection(db, "usuarios"), where("email", "==", email), where('isAdmin', '==', true));
    const docs = await getDocs(q);

    if (docs.docs.length === 1) {
      await signInWithEmailAndPassword(auth, email, password);
      return docs.docs[0].data(); // retornar dados do usuário

    } else {
      setResponse({
        status: 400,
        message: "Você não tem permissão para acessar essa área.",
      });
      signOut(getAuth());
    }
  } catch (e) {

    setResponse({
      status: 400,
      message: VerifyErroCode(e.code),
    });
    signOut(getAuth());
  }
};

//Cadastramento
const registerWithEmailAndPassword = async (nome, email, password, telefone, setResponse) => {
  try {

    const q = query(collection(db, "usuarios"), where("telefone", "==", telefone), where("email", "==", email));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      updateProfile(user, {
        displayName: nome,

      }).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      });

      await setDoc(doc(db, "usuarios", user.uid), {
        authProvider: "local",
        uid: user.uid,
        nome: nome,
        telefone: telefone,
        email: email,
        isAdmin: false,
        tipoUser: 'padrao',
      });

      setResponse({
        status: 200,
        message: "Usuário cadastrado com Sucesso!",
      });

    } else {
      setResponse({
        status: 400,
        message: "O número de telefone ou o e-mail já está cadastrado no sistema, não é possível cadastrar com esses dados! Em caso de dúvida entre em contato com o suporte.",
      });
    }

  } catch (e) {
    setResponse({
      status: 400,
      message: VerifyErroCode(e.code),
    });
  }
};

const sendPasswordReset = async (email, setResponse) => {
  try {
    await sendPasswordResetEmail(auth, email);
    setResponse({
      status: 200,
      message: "Sucesso!",
    });
  } catch (e) {
    setResponse({
      status: 400,
      message: VerifyErroCode(e.code),
    });
  }
};

export {
  auth,
  storage,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  logInWithEmailAndPasswordAdmin,
  getUserData
};
