import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./VerifyOtpRegister.css";

const VerifyOtpRegister = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const { emailid } = useParams();
  const navigate = useNavigate();

  const handleChange = (index, event) => {
    const value = event.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus(); // Move to next input
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus(); // Move to previous input
    }
    if (event.key === "Enter") {
      verifyOtp(); // Submit OTP when Enter is pressed
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (!enteredOtp || enteredOtp.length !== 6) {
      alert("Please enter the complete OTP.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/auth/verify-register/${emailid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/signin"); // Redirect to login page
      } else {
        handleFailedAttempt(data.message || "Invalid OTP. Try again.");
      }
    } catch (error) {
      handleFailedAttempt("Network error. Please try again.");
    }
  };

  const handleFailedAttempt = (message) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= 3) {
      alert("Too many failed attempts. Please register again.");
      navigate("/signup");
    } else {
      alert(message);
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <h2>OTP Verification</h2>
        <p>
          A One-Time Password (OTP) has been sent to your email: <br />
          <strong>{emailid}</strong>
        </p>
        <p>Enter the OTP below to verify your account.</p>
        <div className="otp-input-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
            />
          ))}
        </div>
        <button className="verify-otp-btn" onClick={verifyOtp}>
          Verify OTP
        </button>
        <p className="attempts-info">
          Attempts remaining: {3 - attempts}
        </p>
      </div>
    </div>
  );
};

export default VerifyOtpRegister;