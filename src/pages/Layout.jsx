import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <>
            <Outlet />

            <div className="">
                <nav className="navbar fixed-bottom fixed-bot">
                    <div className="container justify-content-around">
                        <NavLink to="/" exact className="navbar-brand" activeClassName="active-link">
                            <i className="fa fa-home"></i>
                        </NavLink>
                        <NavLink to="/historico" className="navbar-brand" activeClassName="active-link">
                            <i className="bi bi-chat-left-text"></i>
                        </NavLink> 
                        
                     </div>
                </nav>
            </div>
        </>
    );
}

export default Layout;