package com.nexus.CampusMap.controller;

import com.nexus.CampusMap.dto.LoginRequest;
import com.nexus.CampusMap.dto.SignupRequest;
import com.nexus.CampusMap.entity.User;
import com.nexus.CampusMap.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nexus.CampusMap.security.JwtProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.authentication.AuthenticationManager;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    
    // JWT 관련
    @Autowired
    private JwtProvider jwtProvider; 
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager; 

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setUsername(request.getUsername());
            
            User savedUser = userService.registerUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "회원가입 성공");
            response.put("userId", savedUser.getId());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "회원가입 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(error);
        }
    }

 // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        
        try {
            // 1. Spring Security의 인증 처리 (AuthenticationManager 사용)
            // ID와 비밀번호를 AuthenticationManager에게 전달하여 인증을 시도합니다.
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(), // 👈 LoginRequest에서 이메일을 사용한다고 가정
                    request.getPassword()
                )
            );
            
            // 2. 인증 성공 후, 사용자 정보를 가져와 JWT 토큰 생성
            // DB에서 사용자 엔티티(User)를 찾습니다.
            User user = userService.findByEmail(request.getEmail()); // 👈 UserService에 이 메서드가 필요함!
            
            // 사용자 ID를 기반으로 토큰을 생성합니다.
            String token = jwtProvider.createToken(user.getId()); 
            
            // 3. 토큰을 응답 본문에 담아 클라이언트에게 전달
            Map<String, Object> response = new HashMap<>();
            response.put("token", token); // 👈 핵심: 클라이언트가 앞으로 사용할 토큰
            response.put("userId", user.getId());
            response.put("username", user.getUsername());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // 인증 실패 (ID/PW 불일치, 사용자 없음 등) 시 예외 처리
            // BadCredentialsException 등이 발생할 수 있습니다.
            String message = "로그인 실패: ID 또는 비밀번호가 일치하지 않습니다.";
            return ResponseEntity.badRequest().body(Map.of("error", message));
        }
    }

    // 사용자 정보 조회 (나중에 필요할 때)
    // @GetMapping("/users/{id}")
    // public ResponseEntity<User> getUserById(@PathVariable Long id) {
    //     return ResponseEntity.ok(userService.findById(id));
    // }
}