import { useContext } from 'react';
import assets from '../assets/assets.js';
import { AppContext } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();
    return (
        <div className="text-center d-flex flex-column align-items-center justify-content-center py-5 px-3" style={{ minHeight: '80vh' }}>
            <img src={assets.header} alt="header" width={120} className="mb-4" />

            <h3 className="fw-semibold">
                Hey{' '}
                <span
                    style={{
                        background: "linear-gradient(90deg, #a56cff, #4f9fff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "bold"
                    }}
                >
                    {userData ? userData.name : "Developer"}
                </span>{' '}
                <span role="img" aria-label="wave">👋</span>
            </h3>

            <h1 className="fw-bold display-5 mb-3">Welcome to the Spring Security Vault App!</h1>
            <p className="text-muted fs-5 mb-4" style={{ maxWidth: "500px" }}>
                This is a simple application to demonstrate the integration of Spring Security with React.
                You can login, register, and manage your account securely.
            </p>

            <div className="d-flex flex-column">
                <button
                    className="btn btn-outline-dark rounded-pill px-4 py-2 mb-3"
                    onClick={() => navigate('/login')}
                >
                    Get Started <i className="bi bi-arrow-right ms-2"></i>
                </button>

                <button
                    className="btn btn-outline-dark rounded-pill px-4 py-2"
                    onClick={() => window.location.href = "https://likhithraj.netlify.app/"}
                >
                    View My Portfolio <i className="bi bi-arrow-right ms-2"></i>
                </button>
            </div>


        </div>
    );
}

export default Header;