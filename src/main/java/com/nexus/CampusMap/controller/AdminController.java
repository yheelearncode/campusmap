package com.nexus.CampusMap.controller;

import com.nexus.CampusMap.entity.User;
import com.nexus.CampusMap.entity.Event;
import com.nexus.CampusMap.service.UserService;
import com.nexus.CampusMap.service.EventService;
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
    @Autowired
    private EventService eventService;

    // 1. 전체 회원 조회 API (ADMIN 권한만 접근 가능)
    @PreAuthorize("hasRole('ADMIN')") 
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 2. 회원 권한 수정 API
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable("userId") Long userId, @RequestBody Map<String, String> request) {
        try {
            String newRole = request.get("role");
            userService.updateUserRole(userId, newRole);
            return ResponseEntity.ok(Map.of("message", "권한이 변경되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 1. 승인 대기 목록 조회
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/events/pending")
    public ResponseEntity<List<Event>> getPendingEvents() {
        return ResponseEntity.ok(eventService.getPendingEvents());
    }

    // 2. 이벤트 승인하기
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/events/{eventId}/approve")
    public ResponseEntity<?> approveEvent(@PathVariable("eventId") Long eventId) {
        eventService.approveEvent(eventId);
        return ResponseEntity.ok(Map.of("message", "이벤트가 승인되었습니다."));
    }
}