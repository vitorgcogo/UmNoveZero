import { NavLink, Outlet } from 'react-router-dom';
import NavBar from '../Components/Navbar';

const LayoutAdmin = () => {
    return (
        <>  
            <NavBar />
            <Outlet />
        </>
    );
}

export default LayoutAdmin;