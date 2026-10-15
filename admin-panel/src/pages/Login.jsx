import { useLayoutEffect, useRef, useState } from "react";

import "../styles/login.css";
import Button from "../components/Button";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

/** One message per failure kind; never says whether the email or the password was wrong. */
function loginErrorMessage(error) {
  const status = error.response?.status;
  if (status === 401) return "Invalid email or password.";
  if (status === 429) return "Too many attempts. Please wait about 15 minutes and try again.";
  if (!error.response || status >= 500) return "Can't reach the server right now. Please try again in a minute.";
  return error.response.data?.message || "Login failed. Please try again.";
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.9 3.9" />
      <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);
  const selectionRef = useRef(null);
  const navigate = useNavigate();

  // Switching the input type can reset the caret: put the saved selection back. Chromium resets it
  // once more after the type change has been applied, so restore again on the next frame.
  useLayoutEffect(() => {
    const input = passwordRef.current;
    const selection = selectionRef.current;
    selectionRef.current = null;
    if (!input || !selection) return undefined;
    const restore = () => {
      if (document.activeElement !== input) return;
      try {
        input.setSelectionRange(selection.start, selection.end, selection.direction);
      } catch {
        // setSelectionRange is unsupported for this input type; leave the caret as is.
      }
    };
    restore();
    const frame = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(frame);
  }, [showPassword]);

  const togglePassword = () => {
    const input = passwordRef.current;
    if (input) {
      selectionRef.current = {
        start: input.selectionStart,
        end: input.selectionEnd,
        direction: input.selectionDirection || "none",
      };
    }
    setShowPassword((shown) => !shown);
  };

  const handleLogin = async () => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "token",
      response.data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    navigate("/dashboard");

  } catch (error) {
    alert(loginErrorMessage(error));
  } finally {
    setShowPassword(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Vinayak</h1>
        <h2>Interiors</h2>
        <p>ADMIN PANEL</p>

        <input
          className="admin-input"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="login-password">
          <input
            ref={passwordRef}
            id="login-password"
            className="admin-input"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="login-password__toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            aria-controls="login-password"
            // Keep focus (and the caret) in the password field when the button is clicked or tapped.
            onMouseDown={(e) => e.preventDefault()}
            onClick={togglePassword}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <Button
          text="Login"
          onClick={handleLogin}
        />
      </div>
    </div>
  );
}

export default Login;
