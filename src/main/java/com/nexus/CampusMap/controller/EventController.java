package com.nexus.CampusMap.controller;

import com.nexus.CampusMap.entity.Event;
import com.nexus.CampusMap.service.EventService;
import com.nexus.CampusMap.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            Long currentUserId = userService.getUserIdByUsername(currentUsername);

            // 날짜 파싱
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
            if (startsAt != null && !startsAt.isEmpty()) {
                event.setStartsAt(LocalDateTime.parse(startsAt, formatter));
            }
            if (endsAt != null && !endsAt.isEmpty()) {
                event.setEndsAt(LocalDateTime.parse(endsAt, formatter));
            }

            Event savedEvent = eventService.createEvent(event, image, currentUserId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "이벤트 등록 성공");
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
            // -------------------------------------------------------------
            // 2. 현재 로그인된 사용자 ID 획득 로직 (Create 메서드와 동일)
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            Long currentUserId = userService.getUserIdByUsername(currentUsername);
        
            // 3. eventService 호출 시 currentUserId 전달
            // (EventService의 메서드 시그니처를 수정해야 함)
            eventService.deleteEvent(id, currentUserId); // 👈 ID 전달하도록 수정
            // -------------------------------------------------------------
        
            Map<String, String> response = new HashMap<>();
            response.put("message", "이벤트 삭제 성공");
            return ResponseEntity.ok(response);
        
        // 4. catch 블록: 권한 없음 예외 처리
        } catch (AccessDeniedException e) {
            // 권한이 없는 경우, HTTP 403 Forbidden 상태 코드를 반환합니다.
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage()); // 서비스에서 던진 오류 메시지를 포함
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        
        // 5. catch 블록: 그 외 예외 처리 (예: 이벤트가 존재하지 않는 경우)
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "이벤트 삭제 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 이벤트 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        try {
            // 현재 로그인된 사용자 ID 획득 로직
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            Long currentUserId = userService.getUserIdByUsername(currentUsername);
        
            // 획득한 ID를 서비스로 전달
            Event updatedEvent = eventService.updateEvent(id, event, currentUserId); // 👈 currentUserId 추가!
        
            Map<String, Object> response = new HashMap<>();
            response.put("message", "이벤트 수정 성공");
            response.put("eventId", updatedEvent.getId());
        
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