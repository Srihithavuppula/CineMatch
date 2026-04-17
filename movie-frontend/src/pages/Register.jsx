import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAPI } from "../api/api";
import "./Auth.css";

export default function Register() {
  const [uname, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");
    if (pwd !== confirmPwd) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerAPI({ username: uname, email, password: pwd });
      nav("/login");
    } catch {
      setErr("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-info">
          <h1>Welcome to CineMatch</h1>
          <p>Your intelligent, personalized movie theater.</p>
          <ul>
            <li>Determine AI-driven recommendations instantly.</li>
            <li>Browse a rich cinematic universe seamlessly.</li>
            <li>Save and review your curated favorites.</li>
          </ul>
        </div>

        <form className="auth-box" onSubmit={handleRegister}>
        <h2 className="auth-title">Create Account</h2>
        {err && <div className="auth-err">{err}</div>}
        
        <div className="auth-input-group">
          <span className="auth-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <input 
            className="auth-input" 
            placeholder="Username" 
            value={uname} 
            onChange={(e) => setUname(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <div className="auth-input-group">
          <span className="auth-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </span>
          <input 
            type="email" 
            className="auth-input" 
            placeholder="Email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <div className="auth-input-group">
          <span className="auth-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <input 
            type={showPwd ? "text" : "password"} 
            className="auth-input" 
            placeholder="Password" 
            value={pwd} 
            onChange={(e) => setPwd(e.target.value)} 
            required 
            disabled={loading}
          />
          <button type="button" className="auth-toggle-pwd" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password visibility" tabIndex="-1">
            {showPwd ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            )}
          </button>
        </div>

        <div className="auth-input-group">
          <span className="auth-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
          </span>
          <input 
            type={showPwd ? "text" : "password"} 
            className="auth-input" 
            placeholder="Confirm Password" 
            value={confirmPwd} 
            onChange={(e) => setConfirmPwd(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        <p className="auth-link">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
      </div>
    </div>
  );
}
