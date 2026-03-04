package com.example.TodoList.Controller;

import com.example.TodoList.Entity.TodoEntity;
import com.example.TodoList.Entity.User;
import com.example.TodoList.Repository.TodoRepository;
import com.example.TodoList.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllTodos() {
        try {
            User currentUser = getCurrentUser();
            List<TodoEntity> todos = todoRepository.findByUser(currentUser);
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching todos: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody TodoEntity todo) {
        try {
            User currentUser = getCurrentUser();
            todo.setUser(currentUser);
            TodoEntity savedTodo = todoRepository.save(todo);
            return ResponseEntity.ok(savedTodo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating todo: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTodo(@PathVariable Long id, @RequestBody TodoEntity updatedTodo) {
        try {
            User currentUser = getCurrentUser();
            TodoEntity todo = todoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Todo not found"));

            // Check if the todo belongs to the current user
            if (!todo.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to update this todo");
            }

            todo.setTitle(updatedTodo.getTitle());
            todo.setCompleted(updatedTodo.isCompleted());
            todo.setDueDate(updatedTodo.getDueDate());

            TodoEntity savedTodo = todoRepository.save(todo);
            return ResponseEntity.ok(savedTodo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating todo: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            TodoEntity todo = todoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Todo not found"));

            // Check if the todo belongs to the current user
            if (!todo.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to delete this todo");
            }

            todoRepository.deleteById(id);
            return ResponseEntity.ok("Todo deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting todo: " + e.getMessage());
        }
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}