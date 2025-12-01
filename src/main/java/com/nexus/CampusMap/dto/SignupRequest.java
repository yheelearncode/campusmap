package com.nexus.CampusMap.dto;

public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String language;
    private String role;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}