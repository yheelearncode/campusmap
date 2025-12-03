package com.nexus.CampusMap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nexus.CampusMap.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByEvent_IdOrderByCreatedAtAsc(Long eventId);
}
