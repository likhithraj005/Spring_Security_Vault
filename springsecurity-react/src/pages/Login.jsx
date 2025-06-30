import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import assets from '../assets/assets.js';
import axios from 'axios';
import { AppContext } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';


const Login = () => {

    const [isCreatedAccount, setIsCreatedAccount] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { BackendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        axios.defaults.withCredentials = true;
        setLoading(true);

        try {
            if (isCreatedAccount) {
                // Register new user
                const response = await axios.post(`${BackendUrl}/register`, {
                    name,
                    email,
                    password
                });
                console.log("Registration response:", response);

                if (response.status === 201) {
                    toast.success("Registered successfully! - Please login.");
                    navigate("/");
                } else {
                    toast.error(response.data.message || "Registration failed!");
                    return;
                }

            } else {
                // Login existing user
                const response = await axios.post(`${BackendUrl}/login`, {
                    email,
                    password
                });
                console.log("Login response:", response);

                if (response.status == 200) {
                    // Set user data and logged-in state
                    setIsLoggedIn(true);
                    toast.success(response.data.message || "Logged in successfully!");
                    getUserData(); // Fetch user data after login
                    navigate("/");
                } else {
                    toast.error(response.data.message || "Login failed!");
                    return;
                }
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
            console.error("Error during authentication:", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="position-relative min-vh-100 d-flex justify-content-center align-items-center"
            style={{ background: "linear-gradient(90deg, #6a5af9, #8268f9)", border: "none" }}>

            <div style={{ position: "absolute", top: "20px", left: "30px", display: "flex", alignItems: "center" }}>
                <Link to="/" style={{ display: "flex", gap: 5, alignItems: "center", fontWeight: "bold", fontSize: "24px", textDecoration: "none" }}>
                    <img src={assets.logo} alt="App Logo" width={50} height={50} />
                    <span className="fw-bold fs-4 text-light">Spring Security Vault</span>
                </Link>
            </div>

            <div className="card p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <h2 className="text-center mb-4">
                    {isCreatedAccount ? "Create Account" : "Login"}
                </h2>

                <form onSubmit={onSubmitHandler} className="d-flex flex-column gap-1">
                    {isCreatedAccount && (
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                placeholder="Enter your full name"
                                required
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                    )}

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email ID</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="Enter your Email ID"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Enter your password"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        {!isCreatedAccount && (
                            <Link to="/reset-password" className="text-decoration-none">
                                <small className="text">Forgot Password?</small>
                            </Link>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                        {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            isCreatedAccount ? "Create Account" : "Login"
                        )}
                    </button>

                    {!isCreatedAccount && (
                        <button
                            type="button"
                            className="btn btn-outline-dark w-100 mb-3"
                            onClick={() => window.location.href = `${BackendUrl}/oauth2/authorization/github`}
                        >
                            <img
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                                alt="GitHub"
                                width="20"
                                className="me-2"
                            />
                            Login with GitHub
                        </button>
                    )}

                    {!isCreatedAccount && (
                        <button
                            type="button"
                            className="btn btn-outline-danger w-100 mb-3"
                            onClick={() => window.location.href = `${BackendUrl}/oauth2/authorization/google`}
                        >
                            <img
                                src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                                alt="Google"
                                width="20"
                                className="me-2"
                            />
                            Login with Google
                        </button>

                    )}

                </form>

                <div className="text-center mt-3">
                    <p className="mb-0">
                        {isCreatedAccount ? "Already have an account?" : "Don't have an account?"}
                        <button
                            className="btn btn-link p-0 ms-1"
                            onClick={() => setIsCreatedAccount(!isCreatedAccount)}
                        >
                            {isCreatedAccount ? "Login" : "Create Account"}
                        </button>
                    </p>
                </div>

            </div>

        </div>
    );
};

export default Login;
