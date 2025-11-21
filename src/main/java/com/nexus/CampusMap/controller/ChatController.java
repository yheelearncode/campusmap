
package com.nexus.CampusMap.controller;
import com.google.gson.Gson;
import com.nexus.CampusMap.repository.BuildingRepository;
import com.nexus.CampusMap.service.LlamaService;
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
    private LlamaService llamaService;

    @Autowired
    private BuildingRepository buildingRepository;

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> req) {

        // 1) 사용자 질문 꺼내기
        String message = req.get("message");

        // 2) DB 건물정보 가져오기
        List<Building> data = buildingRepository.findAll();

        // 3) JSON 변환
        String buildingJson = new Gson().toJson(data);

        // 4) 프롬프트 완성
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

        // 5) Llama 모델 호출
        String answer = llamaService.ask(prompt);

        // 6) 응답 반환
        return Map.of("answer", answer);
    }
}