import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import assets from '../assets/assets.js';
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const MenuBar = () => {
    const navigate = useNavigate();

    const {userData, BackendUrl, setUserData, setIsLoggedIn} = useContext(AppContext);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef, setDropdownOpen, dropdownOpen, userData]); 

    const handleLogout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post(BackendUrl + "/logout");
            console.log("Logout response:", response);
            if (response.status === 200) {
                setIsLoggedIn(false);
                setUserData(null);
                localStorage.removeItem("userData");
                setDropdownOpen(false);
                navigate('/');
            }
        }catch (error) {
            toast.error(error.response.data.message || "Logout failed!");
            console.error("Logout error:", error);
            setDropdownOpen(false);
        }
    }

    const sendVerificationOTP = async () => {
        setLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post(BackendUrl + "/send-otp");
            console.log("Send OTP response:", response);
            if (response.status === 200) {
                navigate("/email-verify");
                toast.success("Verification OTP sent to your email!");
            } else {
                toast.error(response.data.message || "Failed to send OTP!");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast.error(error.response?.data?.message || "An error occurred while sending OTP.");
        } finally {
            setLoading(false);
        }       
    }

    return (
        <nav className="navbar bg-white px-5 py-4 d-flex justify-content-between align-items-center shadow-sm">
            <div className="d-flex align-items-center gap-2">
                <Link to="/" style={{ display: "flex", gap: "5px", alignItems: "center", fontWeight: "bold", fontSize: "24px", textDecoration: "none" }}>
                    <img src={assets.logo_home} alt="App Logo" width={50} height={50}/>
                    <span>Spring Security Vault</span>
                </Link>
            </div>

            { userData ? (
                <div className="position-relative" ref={dropdownRef}>
                    <div className="bg-dark text-white rounded-circle d-flex justify-content-center align-items-center"
                        style={{ width: "40px", height: "40px", cursor: "pointer", userSelect: "none" }}
                        onClick={() => setDropdownOpen((prev) => !prev)}>
                        {userData.name[0].toUpperCase()}
                    </div>
                    {dropdownOpen && (
                        <div className="position-absolute shadow bg-white rounded p-2"
                            style={{top: "50px", right: "0px", zIndex:100}}
                        >
                            {!userData.isAccountVerified && (
                                <div className="dropdown-item py-1 px-2" style={{cursor: "pointer"}} onClick={sendVerificationOTP}>
                                    Verify Account
                                </div>
                            )}

                            <div className="dropdown-item py-1 px-2 text-danger" style={{cursor: "pointer"}} onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right ms-2"> Logout</i>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='btn btn-outline-dark rounded-pill px-4' onClick={() => { navigate('/login');}}>
                    Login <i className="bi bi-box-arrow-in-right ms-2"></i>
                </div>
            )}

            
        </nav>
    );
};

export default MenuBar;
