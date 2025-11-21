package com.nexus.CampusMap.service;

import com.nexus.CampusMap.entity.Event;
import com.nexus.CampusMap.repository.EventRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;

    // ✅ 절대 경로 사용
    private final String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/uploads/";

    public List<Event> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc();
    }

    public Event createEvent(Event event, MultipartFile imageFile, Long creatorId, String creatorName)throws IOException {
        
    	event.setCreatorId(creatorId);
    	event.setCreatorName(creatorName);
    	
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = saveImage(imageFile);
                event.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패: " + e.getMessage());
            }
        }
        
        return eventRepository.save(event);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다."));
    }

    // 이미지 저장 메서드
    private String saveImage(MultipartFile file) throws IOException {
        // ✅ 업로드 디렉토리 생성
        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
            System.out.println("✅ 업로드 디렉토리 생성: " + uploadDir);
        }

        // 파일명 생성 (UUID + 원본 확장자)
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : ".jpg";
        String savedFilename = UUID.randomUUID().toString() + extension;

        // ✅ 파일 저장
        Path filePath = Paths.get(uploadDir + savedFilename);
        Files.write(filePath, file.getBytes());
        
        System.out.println("✅ 이미지 저장 완료: " + filePath.toString());
        System.out.println("✅ 반환 URL: /uploads/" + savedFilename);

        // URL 반환
        return "/uploads/" + savedFilename;
    }

    // 이벤트를 수정하는 메서드
    public Event updateEvent(Long eventId, String currentUsername, Event updatedEvent) {
        // 1. 수정할 이벤트가 존재하는지 확인
        Event existingEvent = eventRepository.findById(eventId)
                                       .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
    
        // 2. 소유자 검증
        if (!existingEvent.getCreatorName().equals(currentUsername)) {
            // 작성자 ID와 현재 사용자 ID가 다르면 접근 거부 예외 발생
            throw new AccessDeniedException("You are not authorized to update this event. Only the author can modify it.");
        }
    
        // 3. 검증 통과: 업데이트 진행
        existingEvent.setTitle(updatedEvent.getTitle());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setLat(updatedEvent.getLat());
        existingEvent.setLon(updatedEvent.getLon());

        return eventRepository.save(existingEvent);
    }

    // 이벤트를 삭제하는 메서드
    public void deleteEvent(Long eventId, String currentUsername) { 
        // 1. 삭제할 이벤트가 존재하는지 확인
        Event existingEvent = eventRepository.findById(eventId)
                                       .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // 2. 소유자 검증
        if (!existingEvent.getCreatorName().equals(currentUsername)) {
            // 작성자 ID와 현재 사용자 ID가 다르면 접근 거부 예외 발생
            throw new AccessDeniedException("You are not authorized to delete this event. Only the author can delete it.");
        }
    
        // 3. 검증 통과: 삭제 진행
        eventRepository.delete(existingEvent);
    }
}