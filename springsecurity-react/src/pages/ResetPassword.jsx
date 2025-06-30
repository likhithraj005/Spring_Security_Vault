import React, { useContext, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import assets from '../assets/assets.js';
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const inputRef = useRef([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [password, setPassword] = useState('');

    const { BackendUrl, isLoggedIn, userData } = useContext(AppContext);
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

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

    const onSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(BackendUrl + "/send-reset-otp?email="+email);
            console.log("Reset email response:", response);

            if (response.status === 200) {
                setIsEmailSent(true);
                toast.success("Reset email sent successfully!");
            } else {
                toast.error(response.data.message || "Failed to send reset email.");       
            }
        } catch (error) {
            console.error("Reset email error:", error);
            toast.error(error.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    }   

    const handleVerify = async (e) => {
        e.preventDefault();
        const otp = inputRef.current.map(input => input.value).join("");

        if (otp.length < 6 || otp.length > 6 || !/^\d{6}$/.test(otp)) {
            toast.error("Please enter a valid 6-digit OTP.");
            return;
        }

        setOtp(otp); 
        setIsOtpVerified(true);
    }

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(BackendUrl + "/reset-password", {
                email: email,
                otp: otp,
                newPassword: password
            });
            console.log("Reset password response:", response);
            
            if (response.status === 200) {
                toast.success("Password reset successfully!");
                navigate("/login");
            } else {
                toast.error(response.data.message || "Failed to reset password.");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error(error.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="email-verify-container d-flex align-items-center justify-content-center vh-100 position-relative"
            style={{ background: "linear-gradient(90deg, #6a5af9, #8268f9)" }}>

            <Link to="/" className="position-absolute top-0 start-0 p-4 d-flex align-items-center gap-2 text-decoration-none">
                <img src={assets.logo} alt="logo" height={32} width={32} />
                <span className="fw-bold fs-4 text-light">Spring Security Vault</span>
            </Link>

            {/* Reset Password - Email Entry */}
            {!isEmailSent && (
                <div className="reset-password-form bg-white p-4 rounded shadow-sm" style={{ width: "400px" }}>
                    <h2 className="text-center mb-3">Reset Password</h2>
                    <p className="text-muted text-center mb-4">Enter your email to receive a reset password OTP.</p>

                    <form onSubmit={onSubmitEmail}>
                        <div className="input-group mb-4 bg-light rounded-pill">
                            <span className="input-group-text bg-transparent border-0 ps-4">
                                <i className="bi bi-envelope-fill text-secondary"></i>
                            </span>
                            <input
                                type="email"
                                className="form-control bg-transparent border-0 ps-1 pe-4 rounded-end"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ height: '50px' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={loading} >
                            {loading ? "Sending..." : "Send Reset Email"}
                        </button>
                    </form>
                </div>
            )}

            {/* Add OTP Verification & New Password Section Below This */}
            {!isOtpVerified && isEmailSent && (
                <div className="p-5 rounded-4 shadow bg-white" style={{ width: "400px" }}>
                    <h4 className="text-center fw-bold mb-2">Verify Your Email</h4>
                    <p className="text-center text-muted mb-4">
                        Enter the OTP sent to your email and set a new password to complete the reset process.
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
            )}
            {/* New Password Form */}
            {isOtpVerified && isEmailSent && (
                <div className="rounded-4 p-4 text-center bg-white" style={{ width: "100%", maxWidth: "400px" }}>
                    <h5 className="mb-3">Set New Password</h5>
                    <p className="text-muted mb-4">
                        Enter a new password to complete the reset process.
                    </p>
                    <form onSubmit={onSubmitNewPassword}>
                        <div className="input-group mb-4 bg-secondary bg-opacity-10 rounded-pill">
                            <span className="input-group-text bg-transparent border-0 ps-4">
                                <i className="bi bi-lock-fill text-secondary"></i>
                            </span>
                            <input
                                type="password"
                                className="form-control bg-transparent border-0 ps-1 pe-4 rounded-end"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ height: '50px' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Setting Password..." : "Set New Password"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;
