package com.nexus.CampusMap.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LlamaService {

    private final RestTemplate restTemplate = new RestTemplate();

    public String ask(String prompt) {

        String url = "http://localhost:11434/api/generate";

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama3.1:8b");
        body.put("prompt", prompt);
        body.put("stream", false);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, entity, Map.class);

        return (String) response.getBody().get("response");
    }
}