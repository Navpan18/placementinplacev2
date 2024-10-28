import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    setError(""); // Clear previous error

    try {
      await login(email, password);
      navigate("/dashboard"); // Redirect to the dashboard after successful login
    } catch (err) {
      setError("Failed to log in: " + err.message);
    }

    setLoading(false); // Hide loader after login attempt
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
          sx={{ fontWeight: "700", color: "white" }}
        >
          Login
        </Typography>
        {error && (
          <Alert
            severity="error"
            sx={{
              width: "100%",
              mb: 2,
              color: "white",
              backgroundColor: "#b00020",
            }}
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
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{
              style: { color: "white" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
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
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{
              style: { color: "white" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading} // Disable button when loading
            sx={{
              mt: 2,
              color: "white",
              fontWeight: "600",
              backgroundColor: "#d1a3ff", // Light purple button color
              "&:hover": {
                backgroundColor: "#b892e0", // Slightly darker purple on hover
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#d1a3ff" }} /> // Light purple loader color
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
