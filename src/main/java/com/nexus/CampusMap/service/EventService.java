package com.nexus.CampusMap.service;

import com.nexus.CampusMap.entity.Event;
import com.nexus.CampusMap.entity.User;
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
    public Event updateEvent(Long eventId, User currentUser, Event updatedEvent, MultipartFile imageFile) throws IOException {
        // 1. 수정할 이벤트가 존재하는지 확인
        Event existingEvent = eventRepository.findById(eventId)
                                       .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
    
        // 2. 소유자 검증
        String currentUsername = currentUser.getUsername();
        String currentRole = currentUser.getRole();
        boolean isOwner = existingEvent.getCreatorName().equals(currentUsername);
        boolean isAdmin = "ADMIN".equals(currentRole);
        
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("수정 권한이 없습니다. 작성자 또는 관리자만 수정 가능합니다.");
        }
    
        // 3. 검증 통과: 업데이트 진행
        existingEvent.setTitle(updatedEvent.getTitle());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setLat(updatedEvent.getLat());
        existingEvent.setLon(updatedEvent.getLon());
        
        // 날짜 업데이트
        if (updatedEvent.getStartsAt() != null) {
            existingEvent.setStartsAt(updatedEvent.getStartsAt());
        }
        if (updatedEvent.getEndsAt() != null) {
            existingEvent.setEndsAt(updatedEvent.getEndsAt());
        }
        
        // 이미지 업데이트
        if (imageFile != null && !imageFile.isEmpty()) {
            // 기존 이미지 삭제 (선택사항)
            if (existingEvent.getImageUrl() != null) {
                deleteOldImage(existingEvent.getImageUrl());
            }
            
            // 새 이미지 저장
            String newImageUrl = saveImage(imageFile);
            existingEvent.setImageUrl(newImageUrl);
        }

        return eventRepository.save(existingEvent);
    }
    
    // 기존 이미지 파일 삭제 메서드
    private void deleteOldImage(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
                String filename = imageUrl.substring("/uploads/".length());
                Path filePath = Paths.get(uploadDir + filename);
                Files.deleteIfExists(filePath);
                System.out.println("✅ 기존 이미지 삭제: " + filePath.toString());
            }
        } catch (IOException e) {
            System.err.println("⚠️ 이미지 삭제 실패: " + e.getMessage());
            // 삭제 실패해도 계속 진행
        }
    }

    // 이벤트를 삭제하는 메서드
    public void deleteEvent(Long eventId, User currentUser) { 
        // 1. 삭제할 이벤트가 존재하는지 확인
        Event existingEvent = eventRepository.findById(eventId)
                                       .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // 2. 소유자 검증
        String currentUsername = currentUser.getUsername();
        String currentRole = currentUser.getRole();
        
        boolean isOwner = existingEvent.getCreatorName().equals(currentUsername);
        boolean isAdmin = "ADMIN".equals(currentRole);
        
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("삭제 권한이 없습니다. 작성자 또는 관리자만 삭제 가능합니다.");
        }
    
        // 3. 검증 통과: 삭제 진행
        eventRepository.delete(existingEvent);
    }
}