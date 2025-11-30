package com.nexus.CampusMap.repository;

import com.nexus.CampusMap.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByCreatedAtDesc();
    List<Event> findByApprovedTrueOrderByCreatedAtDesc();
    List<Event> findByApprovedFalseOrderByCreatedAtDesc();
}