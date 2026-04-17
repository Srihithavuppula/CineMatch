import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAPI } from "../api/api";
import "./Auth.css";

export default function Login() {
  const [uname, setUname] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await loginAPI({ username: uname, password: pwd });
      localStorage.setItem("token", res.data.token || res.data); // Adjust depending on precisely what the API returns
      localStorage.setItem("username", uname); // helpful for dash
      nav("/");
    } catch {
      setErr("Invalid login credentials.");
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

        <form className="auth-box" onSubmit={handleLogin}>
        <h2 className="auth-title">Login</h2>
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

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Authenticating..." : "Log In"}
        </button>
        <p className="auth-link">Not registered? <Link to="/register">Sign up</Link></p>
      </form>
      </div>
    </div>
  );
}
