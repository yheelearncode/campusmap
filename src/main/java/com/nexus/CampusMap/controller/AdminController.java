package com.nexus.CampusMap.controller;

import com.nexus.CampusMap.entity.User;
import com.nexus.CampusMap.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    // 1. 전체 회원 조회 API (ADMIN 권한만 접근 가능)
    @PreAuthorize("hasRole('ADMIN')") 
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 2. 회원 권한 수정 API
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String newRole = request.get("role");
            userService.updateUserRole(userId, newRole);
            return ResponseEntity.ok(Map.of("message", "권한이 변경되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}