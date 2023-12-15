import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Heatmap from "./pages/HeatMap";

import Principal from "./pages/Principal";
import AuthRoute from "./AuthRoute";
import Login from "./pages/Auth/Login";
import Layout from "./pages/Layout";
import ChatComponent2 from "./pages/Chat/ChatComponent";
import Historico from "./pages/Chat/Historico";
import PoliceDashboard from "./pages/PoliceDashboard";
import ChatPolice from "./pages/Chat/Policia/ChatPolice";
import Chamados from "./pages/Chat/Policia/Chamados";
import Cadastro from "./pages/Auth/Cadastro";
import Perfil from "./pages/Perfil";
import LayoutAdmin from "./pages/LayoutAdmin";
import AuthRouteAdmin from "./pages/AuthRouterAdmin";

const App = () => {
  return (
    <>
      <Router>
        <Routes>

          <Route path="login" element={<Login />} />
          <Route path="cadastro" element={<Cadastro />} />



          {/* <Route index path="/g" element={<Heatmap />} /> */}

          <Route path="/" element={<Layout />}>
            <Route index element={<Principal />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/police" element={<PoliceDashboard />} />
            <Route path="/perfil" element={<Perfil />} />

          </Route>
          <Route path="/chat/:roomId" element={<ChatComponent2 />} />

          <Route path="/admin" element={<AuthRouteAdmin><LayoutAdmin /></AuthRouteAdmin>}>
          {/* <Route path="/admin" element={<LayoutAdmin />}> */}
            <Route index element={<Heatmap />} />
            <Route path="/admin/chamado" element={<Chamados />} />
            <Route path="/admin/chamado/:roomId" element={<ChatPolice />} />

          </Route>
          {/* <Route path="/chamado" element={<Chamados />} />
          <Route path="/chamado/:roomId" element={<ChatPolice />} /> */}



          {/* <Route index path="/" element={<Principal />} /> */}


          {/* <Route path="/" element={<AuthRoute><Layout /></AuthRoute>}>
                        <Route index element={<Principal />} />

                        
                    </Route> */}
        </Routes>
      </Router>
    </>
  );
};

export default App;