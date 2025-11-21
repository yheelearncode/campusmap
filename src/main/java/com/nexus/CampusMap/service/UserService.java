package com.nexus.CampusMap.service;

import java.util.Optional;

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
    
    public com.nexus.CampusMap.entity.User registerUser(com.nexus.CampusMap.entity.User user) {
        // 1️⃣ 중복 이메일 확인
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        
        // 2️⃣ 중복 사용자명 확인
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다.");
        }

        // 3️⃣ 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 4️⃣ DB에 저장
        return userRepository.save(user);
    }
    
    // 로그인 메서드 추가
    /* public User login(String email, String password) {
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
    } */

    public Long getUserIdByUsername(String email) {
    	com.nexus.CampusMap.entity.User user = findUserByEmail(email);
        return user.getId();
    }
    
    // 이메일로 User 엔티티를 찾아 반환하는 메서드 (로그인 토큰 생성에 필요)
    /*public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                             .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }*/
    
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

}
