package com.nexus.CampusMap.controller;

import com.nexus.CampusMap.dto.LoginRequest;
import com.nexus.CampusMap.dto.SignupRequest;
import com.nexus.CampusMap.entity.User;
import com.nexus.CampusMap.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    
    @Autowired
    private UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setUsername(request.getUsername());
            user.setLanguage(request.getLanguage());
            
            User savedUser = userService.registerUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "회원가입 성공");
            response.put("userId", savedUser.getId());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "회원가입 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.getEmail(), request.getPassword());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", "temp-token-" + user.getId());
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("language", user.getLanguage());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 사용자 정보 조회 (나중에 필요할 때)
    // @GetMapping("/users/{id}")
    // public ResponseEntity<User> getUserById(@PathVariable Long id) {
    //     return ResponseEntity.ok(userService.findById(id));
    // }
}