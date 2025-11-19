package com.nexus.CampusMap.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity 
@EnableGlobalMethodSecurity(prePostEnabled = true) 
public class SecurityConfig {

    // 1. 비밀번호 암호화 방식 정의
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); 
    }

    // 2. HTTP 보안 규칙 정의
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests()
                // 로그인이나 회원가입 등 인증이 필요 없는 경로는 모두 허용
                // 예: "/api/users/login", "/api/users/signup" 경로는 모두 접근 허용
                .requestMatchers("/api/users/**").permitAll() 
                
                // 그 외 모든 요청은 인증(로그인)이 필요함
                .anyRequest().authenticated() 
                .and()
            .formLogin() // 폼 기반 로그인 설정
                // 실제 프로젝트 환경에 맞게 로그인 엔드포인트 등을 설정해야 합니다.
                .and()
            .httpBasic();

        return http.build();
    }
    
    @Autowired
    private UserDetailsService userDetailsService; 

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}