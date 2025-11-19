package com.nexus.CampusMap.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.nexus.CampusMap.entity.User;
import com.nexus.CampusMap.repository.UserRepository;

@Service
@Transactional
public class UserService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User registerUser(User user) {
        // 1️⃣ 중복 이메일 확인
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        
        // 2️⃣ 중복 사용자명 확인
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다.");
        }

        // 3️⃣ (선택) 비밀번호 암호화
        // user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 4️⃣ DB에 저장
        return userRepository.save(user);
    }
    
    // 로그인 메서드 추가
    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않는 이메일입니다.");
        }
        
        User user = userOpt.get();
        
        // 비밀번호 확인 (암호화 전 임시)
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        
        return user;
    }

    public Long getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username)
                              .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        
        return user.getId();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // 1. UserRepository를 사용해 DB에서 사용자 찾기
        com.nexus.CampusMap.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 2. DB에서 찾은 사용자 정보로 Spring Security용 UserDetails 객체 생성
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword()) // 암호화된 비밀번호
                
                // 3. 사용자의 역할을 권한 목록으로 변환하여 추가
                .roles(user.getRole())
                
                .build();
    }

}
