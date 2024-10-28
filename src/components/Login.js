import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard"); // Redirect to the dashboard after successful login
    } catch (err) {
      setError("Failed to log in: " + err.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight:"700", color: "white" }} // Make heading text color white
        >
          Login
        </Typography>
        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 2, color: "white", backgroundColor: "#b00020" }} // White text for error message
          >
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputLabelProps={{ style: { color: "white" } }} // White color for label
            InputProps={{
              style: { color: "white" }, // White color for input text
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // White outline color
                },
                "&:hover fieldset": {
                  borderColor: "white", // White outline color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // White outline color when focused
                },
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputLabelProps={{ style: { color: "white" } }} // White color for label
            InputProps={{
              style: { color: "white" }, // White color for input text
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white", // White outline color
                },
                "&:hover fieldset": {
                  borderColor: "white", // White outline color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // White outline color when focused
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              color: "white",
              fontWeight:"600",
              backgroundColor: "#bb86fc",
              "&:hover": {
                backgroundColor: "#9f6ae1", // Slightly darker shade on hover
              },
            }}
          >
            Log In
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;