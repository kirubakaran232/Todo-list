import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      setUser({ username });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          username,
          password,
        },
      );

      const { token, username: userName } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("username", userName);
      setUser({ username: userName });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/signup",
        {
          username,
          email,
          password,
        },
      );

      const { token, username: userName } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("username", userName);
      setUser({ username: userName });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
