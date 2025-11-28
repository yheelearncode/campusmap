package com.nexus.CampusMap.service;

import java.util.Optional;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;


import com.nexus.CampusMap.repository.UserRepository;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    // 1. [관리자용] 모든 사용자 목록 조회
    public List<com.nexus.CampusMap.entity.User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. [관리자용] 사용자 권한 변경
    public void updateUserRole(Long userId, String newRole) {
    	com.nexus.CampusMap.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        user.setRole(newRole);
        userRepository.save(user); // 변경된 권한 저장
    }

    public com.nexus.CampusMap.entity.User registerUser(com.nexus.CampusMap.entity.User user) {
        // 1️. 중복 이메일 확인
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        // 2️. 중복 사용자명 확인
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다.");
        }

        // 3️. 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 4️. DB에 저장
        return userRepository.save(user);
    }

    public Long getUserIdByUsername(String email) {
        com.nexus.CampusMap.entity.User user = findUserByEmail(email);
        return user.getId();
    }

    // 사용자 이름(username)으로 User 엔티티를 찾아 반환하는 메서드
    public com.nexus.CampusMap.entity.User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // 1. UserRepository를 사용해 DB에서 사용자 찾기
        com.nexus.CampusMap.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        // 2. DB에서 찾은 사용자 정보로 Spring Security용 UserDetails 객체 생성
        return new User(
                user.getEmail(),
                user.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }

    public UserDetails loadUserById(String userIdString) throws UsernameNotFoundException {
        Long userId = Long.valueOf(userIdString);
        com.nexus.CampusMap.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole())
                .build();

    }
}