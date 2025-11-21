package com.nexus.CampusMap.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.nexus.CampusMap.service.UserService;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 1. HTTP 요청 헤더에서 JWT 토큰 가져오기
            String token = getJwtFromRequest(request);

            // 2. 토큰 유효성 검사 및 사용자 ID 추출
            if (token != null && jwtProvider.validateAndGetUserId(token) != null) {
                
                String userIdString = jwtProvider.validateAndGetUserId(token);
                //Long userId = Long.valueOf(userIdString);
                
                // 3. 사용자 ID로 DB에서 사용자 정보 (UserDetails) 로드
                // ⚠️ 주의: userDetailsService는 String username으로 로드해야 하므로, 
                //      실제로는 User Entity를 찾아서 username을 추출해야 합니다.
                //      여기서는 일단 userIdString을 username처럼 사용한다고 가정합니다.
                UserDetails userDetails = userService.loadUserByUsername(userIdString);

                // 4. Spring Security에 인증 정보 설정 (로그인 처리)
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Security Context에 사용자 인증 정보를 설정할 수 없습니다.", ex);
        }

        // 5. 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    // Authorization 헤더에서 "Bearer " 부분을 제외한 토큰 문자열을 추출합니다.
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}