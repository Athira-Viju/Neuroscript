import React, { useState } from "react";
import axios from "axios";

/* -------------------- MAIN APP -------------------- */
function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div style={styles.body}>
      {!isLoggedIn ? (
        !showRegister ? (
          <LoginGrid
            onNewUser={() => setShowRegister(true)}
            onLoginSuccess={() => setIsLoggedIn(true)}
          />
        ) : (
          <RegisterGrid onRegisterSuccess={() => setShowRegister(false)} />
        )
      ) : (
        <NeuroScriptDashboard />
      )}
    </div>
  );
}

export default App;

/* -------------------- LOGIN GRID -------------------- */
function LoginGrid({ onNewUser, onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const login = async () => {
    if (!userId || !password) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/login", { userId, password }); // proxy handles port
      setLoading(false);

      if (res.data.success) {
        setMessage(res.data.message);
        onLoginSuccess();
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setLoading(false);
      setMessage("Login error: " + err.message);
    }
  };

  return (
    <div style={styles.gridContainer}>
      <h1 style={styles.projectTitle}>🧠 NeuroScript</h1>
      <div style={styles.grid}>
        <h2 style={styles.heading}>Login</h2>

        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={styles.input}
        />

        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <span
            style={styles.eye}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button onClick={login} style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.newUser} onClick={onNewUser}>
          New User?
        </p>
      </div>
    </div>
  );
}

/* -------------------- REGISTER GRID -------------------- */
function RegisterGrid({ onRegisterSuccess }) {
  const [newUserId, setNewUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isPasswordStrong = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const register = async () => {
    if (!newUserId || !newPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      setMessage(
        "Password must be 8+ chars and include uppercase, lowercase, number & special char."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/register", {
        userId: newUserId,
        password: newPassword,
      });
      setLoading(false);

      if (res.data.success) {
        setMessage(res.data.message);
        onRegisterSuccess();
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setLoading(false);
      setMessage("Registration error: " + err.message);
    }
  };

  return (
    <div style={styles.gridContainer}>
      <h1 style={styles.projectTitle}>🧠 NeuroScript</h1>
      <div style={styles.grid}>
        <h2 style={styles.heading}>Register</h2>

        <input
          placeholder="Create User ID"
          value={newUserId}
          onChange={(e) => setNewUserId(e.target.value)}
          style={styles.input}
        />

        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />
          <span
            style={styles.eye}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button onClick={register} style={styles.button} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

/* -------------------- NEUROSCRIPT DASHBOARD -------------------- */
function NeuroScriptDashboard() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    try {
      const res = await axios.post("/analyze", formData); // proxy handles port
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧠 NeuroScript</h1>
      <p>Upload Homework Image</p>

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <br />
      <br />

      <button onClick={uploadImage} style={styles.button} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <>
          <h3>Detected Markers</h3>
          <ul>
            {result.findings.map((f, i) => (
              <li key={i}>{f.type}</li>
            ))}
          </ul>

          <img
            src="/result/image"
            width="400"
            alt="Result"
          />
          <br />

          <a
            href="/result/pdf"
            target="_blank"
            rel="noreferrer"
            style={{ ...styles.button, textDecoration: "none" }}
          >
            Download Clinical Report
          </a>
        </>
      )}
    </div>
  );
}

/* -------------------- STYLES -------------------- */
const styles = {
  body: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1f1c2c, #928dab)",
    fontFamily: "Arial, sans-serif",
    color: "#fff",
  },
  gridContainer: {
    textAlign: "center",
  },
  projectTitle: {
    fontSize: "3rem",
    marginBottom: 20,
    textShadow: "0 0 10px #00fff7",
  },
  grid: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: 30,
    borderRadius: 15,
    width: 300,
    margin: "0 auto",
    display: "grid",
    gap: 15,
    boxShadow: "0 0 20px rgba(0,255,255,0.3)",
    backdropFilter: "blur(10px)",
    animation: "fadeIn 1s ease-in",
  },
  heading: {
    marginBottom: 10,
    fontSize: "1.5rem",
    color: "#00fff7",
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    outline: "none",
    background: "rgba(255, 255, 255, 1)",
    color: "#4a4545ff",
    fontSize: 16,
    transition: "0.3s",
    width: "100%",
  },
  button: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#00fff7",
    color: "#1f1c2c",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  newUser: {
    color: "#00fff7",
    cursor: "pointer",
    textAlign: "right",
    marginTop: 10,
  },
  passwordWrapper: {
    position: "relative",
  },
  eye: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  },
  message: {
    color: "#ff6666",
    fontSize: "0.9rem",
    marginTop: 5,
  },
};
