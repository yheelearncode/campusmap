package com.nexus.CampusMap.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nexus.CampusMap.entity.Event;
import com.nexus.CampusMap.service.EventService;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    @Autowired
    private EventService eventService;

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<?> createEvent(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("lat") Double lat,
            @RequestParam("lon") Double lon,
            @RequestParam("creatorId") Long creatorId,
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
            event.setCreatorId(creatorId);

            // 날짜 파싱
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
            if (startsAt != null && !startsAt.isEmpty()) {
                event.setStartsAt(LocalDateTime.parse(startsAt, formatter));
            }
            if (endsAt != null && !endsAt.isEmpty()) {
                event.setEndsAt(LocalDateTime.parse(endsAt, formatter));
            }

            Event savedEvent = eventService.createEvent(event, image);

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
        eventService.deleteEvent(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "이벤트 삭제 성공");
        return ResponseEntity.ok(response);
    }
}