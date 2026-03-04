package com.example.TodoList.DTO;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
}