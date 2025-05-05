// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useNotification } from "../context/NotificationContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      showNotification("Connexion réussie !", "success");
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Erreur de connexion",
        "error"
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Connexion à TaskFlow
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Mot de passe"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Se connecter
        </Button>
      </form>
    </Container>
  );
};

export default Login;