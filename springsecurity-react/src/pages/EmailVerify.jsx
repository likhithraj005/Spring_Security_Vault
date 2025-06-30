import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import assets from '../assets/assets.js';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const EmailVerify = () => {
    const inputRef = useRef([]);
    const [loading, setLoading] = useState(false);
    const { getUserData, isLoggedIn, userData, BackendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        e.target.value = value;

        if (value && index < 5) {
            inputRef.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && index > 0 && !e.target.value) {
            inputRef.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
        pasteData.forEach((digit, i) => {
            if (inputRef.current[i]) {
                inputRef.current[i].value = digit;
                inputRef.current[i].focus();
            }
        });
        const next = pasteData.length < 6 ? pasteData.length : 5;
        inputRef.current[next].focus();
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        const otp = inputRef.current.map(input => input.value).join("");

        if (otp.length < 6 || otp.length > 6 || !/^\d{6}$/.test(otp)) {
            toast.error("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(BackendUrl + "/verify-otp", { otp })
            console.log("Verification response:", response);
            if (response.status === 200) {
                toast.success("Email verified successfully!");
                getUserData();
                navigate("/");
            } else {
                toast.error(response.data.message || "Verification failed!");
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error(error.response?.data?.message || "An error occurred during verification.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isLoggedIn && userData?.isAccountVerified) {
            navigate("/");
        }
    }, [isLoggedIn, userData, navigate]);


    return (
        <div className="email-verify-container d-flex align-items-center justify-content-center vh-100 position-relative"
            style={{ background: "linear-gradient(90deg, #6a5af9, #8268f9)" }}>

            <Link to="/" className="position-absolute top-0 start-0 p-4 d-flex align-items-center gap-2 text-decoration-none">
                <img src={assets.logo} alt="logo" height={32} width={32} />
                <span className="fw-bold fs-4 text-light">Spring Security Vault</span>
            </Link>

            <div className="p-5 rounded-4 shadow bg-white" style={{ width: "400px" }}>
                <h4 className="text-center fw-bold mb-2">Verify Your Email</h4>
                <p className="text-center text-muted mb-4">
                    We've sent an OTP to your email. Please enter it to verify your account. If you don't see it, check your spam folder.
                </p>

                <div className="d-flex justify-content-between gap-2 mb-4 text-center text-white-50 mb-2">
                    {[...Array(6)].map((_, index) => (
                        <input
                            type="text"
                            maxLength={1}
                            className="form-control text-center fs-4 otp-input"
                            key={index}
                            ref={(el) => inputRef.current[index] = el}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            style={{ width: "50px", height: "50px", fontSize: "1.5rem", textAlign: "center", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "8px" }}
                            autoFocus={index === 0}
                            disabled={loading || (isLoggedIn && userData?.isAccountVerified)}
                            placeholder="0"
                            aria-label={`OTP digit ${index + 1}`}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            title="Please enter a digit from 0 to 9"
                            onFocus={(e) => e.target.select()}
                            onBlur={(e) => {
                                if (!e.target.value) {
                                    e.target.value = "";
                                }
                            }}
                            onCut={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            onDrop={(e) => e.preventDefault()}
                        />
                    ))}
                </div>

                <button className="btn btn-primary w-100 fw-semibold" disabled={loading} onClick={handleVerify}>
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        "Verify Email"
                    )}
                </button>
            </div>
        </div>
    );
};

export default EmailVerify;
