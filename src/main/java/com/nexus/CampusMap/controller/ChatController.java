
package com.nexus.CampusMap.controller;
import com.google.gson.Gson;
import com.nexus.CampusMap.repository.BuildingRepository;
import com.nexus.CampusMap.service.GeminiService;
import com.nexus.CampusMap.entity.Building;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private BuildingRepository buildingRepository;

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> req) {

        String message = req.get("message");

        List<Building> data = buildingRepository.findAll();

        String buildingJson = new Gson().toJson(data);

        String prompt = """
        너는 충북대학교 교내 안내 챗봇이야.
        아래 JSON에 교내 건물 정보가 담겨 있다.
        반드시 이 데이터만 기반으로 정확하게 답변해.

        --- 교내 건물 데이터 JSON ---
        """ + buildingJson + """

        --- 사용자 질문 ---
        """ + message + """

        --- 답변 ---
        """;

        String answer = geminiService.ask(prompt);

        // 6) 응답 반환
        return Map.of("answer", answer);
    }
}