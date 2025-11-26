package com.nexus.CampusMap.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nexus.CampusMap.entity.Event;
import com.nexus.CampusMap.entity.User;
import com.nexus.CampusMap.service.EventService;
import com.nexus.CampusMap.service.UserService;

@RestController
@RequestMapping("/api/events")
// @CrossOrigin(origins = "*", allowedHeaders = "*") ← 제거!
public class EventController {
    
    @Autowired
    private EventService eventService;

    @Autowired
    private UserService userService;

    // 모든 이벤트 조회
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // 이벤트 생성 (FormData로 받음)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> createEvent(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("lat") Double lat,
            @RequestParam("lon") Double lon,
            //@RequestParam("creatorId") Long creatorId,
            @RequestParam(value = "startsAt", required = false) String startsAt,
            @RequestParam(value = "endsAt", required = false) String endsAt,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {

            Event event = new Event();
            event.setTitle(title);
            event.setDescription(description);
            event.setLat(lat);
            event.setLon(lon);
            //event.setCreatorId(creatorId);
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userService.findUserByEmail(userEmail);
            String currentUsername = currentUser.getUsername();
            Long currentUserId = currentUser.getId();

            // 날짜 파싱
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
            if (startsAt != null && !startsAt.isEmpty()) {
                event.setStartsAt(LocalDateTime.parse(startsAt, formatter));
            }
            if (endsAt != null && !endsAt.isEmpty()) {
                event.setEndsAt(LocalDateTime.parse(endsAt, formatter));
            }

            Event savedEvent = eventService.createEvent(event, image, currentUserId, currentUsername);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "이벤트 등록 성공");
            response.put("creatorName", currentUsername);
            response.put("eventId", savedEvent.getId());
            response.put("imageUrl", savedEvent.getImageUrl());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "이벤트 등록 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 이벤트 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    // 이벤트 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            // 현재 로그인된 사용자 ID 획득 로직
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userService.findUserByEmail(email);
            String currentUsername = currentUser.getUsername();

            eventService.deleteEvent(id, currentUsername);

            Map<String, String> response = new HashMap<>();
            response.put("message", "이벤트 삭제 성공");
            return ResponseEntity.ok(response);

        // 권한 없음 예외 처리
        } catch (AccessDeniedException e) {
            // 권한이 없는 경우, HTTP 403 Forbidden 상태 코드를 반환
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);

        // 그 외 예외 처리 (예: 이벤트가 존재하지 않는 경우)
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "이벤트 삭제 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 이벤트 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("lat") Double lat,
            @RequestParam("lon") Double lon,
            @RequestParam(value = "startsAt", required = false) String startsAt,
            @RequestParam(value = "endsAt", required = false) String endsAt,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            // 현재 로그인된 사용자 ID 획득 로직
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userService.findUserByEmail(email);
            String currentUsername = currentUser.getUsername();

            // 업데이트할 이벤트 객체 생성
            Event updatedEvent = new Event();
            updatedEvent.setTitle(title);
            updatedEvent.setDescription(description);
            updatedEvent.setLat(lat);
            updatedEvent.setLon(lon);

            // 날짜 파싱
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
            if (startsAt != null && !startsAt.isEmpty()) {
                updatedEvent.setStartsAt(LocalDateTime.parse(startsAt, formatter));
            }
            if (endsAt != null && !endsAt.isEmpty()) {
                updatedEvent.setEndsAt(LocalDateTime.parse(endsAt, formatter));
            }

            // 획득한 ID를 서비스로 전달
            Event updated = eventService.updateEvent(id, currentUsername, updatedEvent, image);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "이벤트 수정 성공");
            response.put("eventId", updated.getId());
            response.put("creatorName", updated.getCreatorName());
            response.put("imageUrl", updated.getImageUrl());
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException e) {
            // 권한 거부 시 403 응답
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // 기타 오류 처리
            return ResponseEntity.badRequest().body(Map.of("error", "이벤트 수정 실패: " + e.getMessage()));
        }
    }
}