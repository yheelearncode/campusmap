package com.nexus.CampusMap.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.nio.charset.StandardCharsets;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.security.Key; 

@Slf4j
@Service 
public class JwtProvider {

    private final Key SECRET_KEY;
    
    // 👈 주목! 필드 레벨 @Value 대신 생성자 레벨에서 값을 주입받습니다.
    public JwtProvider(@Value("${jwt.secret-key}") String secretKeyString) {
        // 1. 여기서 바로 비밀키를 초기화합니다.
    	this.SECRET_KEY = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
        // 2. 혹시 몰라 로그 레벨에서 키 길이를 확인해봅니다.
        log.info("JWT Secret Key initialized with length: {}", secretKeyString.length()); 
    }

    public String createToken(Long userId) {
        // 토큰의 만료 시간을 설정
        Date expiryDate = Date.from(
            Instant.now().plus(1, ChronoUnit.DAYS));

        return Jwts.builder()
        		.signWith(this.SECRET_KEY) // 서명에 사용할 키와 알고리즘
                .setSubject(userId.toString()) // 토큰의 주인(Subject)으로 사용자 ID를 담습니다.
                .setIssuer("CampusMapApp") // 토큰 발급자
                .setIssuedAt(new Date()) // 토큰 발급 시간
                .setExpiration(expiryDate) // 토큰 만료 시간
                .compact(); // 토큰 생성 완료
    }

    public String validateAndGetUserId(String token) {
        try {
            // 서버의 비밀키로 서명을 검증하고, 유효하면 페이로드(데이터)를 가져옴
        	Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();

            // 페이로드에서 사용자 ID (Subject) 추출
            return claims.getSubject(); 
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.error("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.error("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.error("JWT 토큰이 잘못되었습니다.");
        } catch (Exception e) { // 모든 예외를 잡도록 추가
            log.error("JWT 검증 중 예기치 않은 오류 발생: {}", e.getMessage());
        }
        return null;
        
    }
}