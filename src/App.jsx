import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Heatmap from "./pages/HeatMap";

import Principal from "./pages/Principal";
import AuthRoute from "./AuthRoute";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import ChatComponent from "./pages/ChatComponent";
import Chat from "./pages/Chat";
import ChatComponent2 from "./pages/Chat/ChatComponent";
import Historico from "./pages/Chat/Historico";
import PoliceDashboard from "./pages/PoliceDashboard";

const App = () => {
  return (
    <>
      <Router>
        <Routes>

          <Route path="login" element={<Login />} />

          <Route path="/admin" element={<AuthRoute><Heatmap /></AuthRoute>} />

          <Route index path="/g" element={<Heatmap />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Principal />} />
            <Route path="/historico" element={<Historico />} />

            <Route path="/police" element={<PoliceDashboard />} />

          </Route>
          <Route index path="/chat/:roomId" element={<ChatComponent2 />} />


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