package com.nexus.CampusMap.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexus.CampusMap.entity.Comment;
import com.nexus.CampusMap.entity.Event;
import com.nexus.CampusMap.entity.User;
import com.nexus.CampusMap.repository.CommentRepository;
import com.nexus.CampusMap.repository.EventRepository;
import com.nexus.CampusMap.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    // 댓글 조회
    @GetMapping("/events/{eventId}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long eventId) {
        List<Comment> comments = commentRepository.findByEvent_IdOrderByCreatedAtAsc(eventId);
        
        List<Map<String, Object>> result = comments.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("content", c.getContent());
            map.put("userName", c.getUserName());
            map.put("createdAt", c.getCreatedAt().toString()); // ISO String으로 변환
            map.put("isMine", false); 
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 댓글 작성
    @PostMapping("/events/{eventId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addComment(@PathVariable Long eventId, @RequestBody Map<String, String> payload) {
        try {
            String content = payload.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "내용을 입력하세요."));
            }

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            Comment comment = new Comment();
            comment.setContent(content);
            comment.setUser(user);
            comment.setUserName(user.getUsername());
            comment.setEvent(event);

            Comment savedComment = commentRepository.save(comment);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedComment.getId());
            response.put("content", savedComment.getContent());
            response.put("userName", savedComment.getUserName());
            response.put("createdAt", savedComment.getCreatedAt().toString()); // ISO String으로 변환
            response.put("isMine", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!comment.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
                throw new AccessDeniedException("삭제 권한이 없습니다.");
            }

            commentRepository.delete(comment);
            return ResponseEntity.ok(Map.of("message", "삭제 완료"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
