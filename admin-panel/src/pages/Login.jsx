import { useState } from "react";

import "../styles/login.css";
import Input from "../components/Input";
import Button from "../components/Button";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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

    console.log(response.data);

  } catch (error) {
    alert(
      error.response?.data?.message || "Login Failed"
    );
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Vinayak</h1>
        <h2>Interiors</h2>
        <p>ADMIN PANEL</p>

        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          text="Login"
          onClick={handleLogin}
        />
      </div>
    </div>
  );
}

export default Login;