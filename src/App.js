import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import Login from "./Login";
import Signup from "./Signup";
import axios from "./axiosConfig";
import "./App.css";

function App() {
  const { user, logout, loading } = useAuth();

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (user) {
      console.log("User authenticated:", user);
      console.log("Token from localStorage:", localStorage.getItem("token"));
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching todos...");
      const response = await axios.get("/todos");
      console.log("Todos fetched successfully:", response.data);
      setTodos(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching todos - Full error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      setError(
        `Failed to fetch todos: ${error.response?.data || error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addOrUpdateTodo = async () => {
    if (!title.trim() || !dueDate) {
      setError("Please enter both title and due date");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Saving todo - Title:", title, "Due Date:", dueDate);
      console.log("Token being used:", localStorage.getItem("token"));

      const todoData = {
        title: title.trim(),
        completed: false,
        dueDate: dueDate,
      };
      console.log("Todo data being sent:", todoData);

      let response;
      if (editingId) {
        console.log("Updating todo with ID:", editingId);
        response = await axios.put(`/todos/${editingId}`, todoData);
        console.log("Update response:", response.data);
        setEditingId(null);
      } else {
        console.log("Creating new todo");
        response = await axios.post("/todos", todoData);
        console.log("Create response:", response.data);
      }

      setTitle("");
      setDueDate("");
      await fetchTodos();
      setError("");
    } catch (error) {
      console.error("Error saving todo - Full error:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to save todo. ";
      if (error.response?.status === 401) {
        errorMessage += "Unauthorized. Please login again.";
        logout();
      } else if (error.response?.status === 403) {
        errorMessage += "You don't have permission.";
      } else if (error.response?.data) {
        errorMessage += error.response.data;
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const editTodo = (todo) => {
    setTitle(todo.title);
    setDueDate(todo.dueDate);
    setEditingId(todo.id);
    setError("");
  };

  const deleteTodo = async (id) => {
    setIsLoading(true);
    try {
      console.log("Deleting todo with ID:", id);
      await axios.delete(`/todos/${id}`);
      console.log("Todo deleted successfully");
      await fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Failed to delete todo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = async (todo) => {
    setIsLoading(true);
    try {
      console.log("Toggling todo:", todo.id);
      await axios.put(`/todos/${todo.id}`, {
        ...todo,
        completed: !todo.completed,
      });
      console.log("Todo toggled successfully");
      await fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
      setError("Failed to update todo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedTodos = [...todos].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return showLogin ? (
      <Login onSwitchToSignup={() => setShowLogin(false)} />
    ) : (
      <Signup onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>My Todo List</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <h2 className="dateHeader">📅 {today}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="inputBox">
        <input
          type="text"
          placeholder="Enter task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          disabled={isLoading}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input"
          disabled={isLoading}
        />

        <button
          onClick={addOrUpdateTodo}
          className="addBtn"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : editingId ? "Update" : "Add"}
        </button>
      </div>

      {isLoading && !todos.length ? (
        <p className="loading-text">Loading todos...</p>
      ) : sortedTodos.length === 0 ? (
        <p className="no-todos">No todos yet. Add one above!</p>
      ) : (
        sortedTodos.map((todo) => (
          <div key={todo.id} className="card">
            <div className="todoContent" onClick={() => toggleComplete(todo)}>
              <h3 className={todo.completed ? "completed" : ""}>
                {todo.title}
              </h3>
              <p className="dueDate">Due: {todo.dueDate}</p>
            </div>

            <div className="icons">
              <FaEdit
                className="icon"
                onClick={() => editTodo(todo)}
                style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
              />
              <FaTrash
                className="icon"
                onClick={() => deleteTodo(todo.id)}
                style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
