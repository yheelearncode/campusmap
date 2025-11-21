package com.nexus.CampusMap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;

import java.util.HashMap;
import java.util.Map;

import com.google.cloud.translate.*;

@RestController
@RequestMapping("/api")
public class TranslateController {
	private final String api_key = loadAPIKeyFromJson();
	private final Translate translate = TranslateOptions.newBuilder()
			.setApiKey(api_key)
			.build()
			.getService();
	
	private String loadAPIKeyFromJson() {
		ObjectMapper mapper = new ObjectMapper();
		
		// src/main/resources 디렉터리에서 credentials.json 파일 열기
		try (InputStream inputStream = TranslateController.class.getResourceAsStream("/credentials.json")) {
			if (inputStream == null) {
				throw new RuntimeException("Credentials.json 파일을 찾을 수 없습니다.");
			}
			JsonNode rootNode = mapper.readTree(inputStream);
			return rootNode.get("keyString").asText();
		} catch (IOException e) {
			throw new RuntimeException("API 키 로드 중 오류 발생");
		}
	}
	
	@PostMapping("/translate")
	public ResponseEntity<?> translateText(@RequestBody Map<String, String> payload) {
		try {
			String title = payload.get("title");
			String description = payload.get("description");
			String targetLang = payload.get("targetLang");
			
			if (title == null || description == null || targetLang == null) {
				return ResponseEntity.badRequest().body(Map.of("error", "title, description, targetLang 필드 필요"));
			}
			
			Detection detectedLang = translate.detect(title);
			if (detectedLang.getLanguage().equals(targetLang)) {
				Map<String, String> responseBody = new HashMap<>();
				responseBody.put("translatedTitle", title);
				responseBody.put("translatedDescription", description);
				return ResponseEntity.ok(responseBody);
			}
			else {
				Translation translation;
				translation = translate.translate(title, Translate.TranslateOption.targetLanguage(targetLang));
				String translatedTitle = translation.getTranslatedText();
				
				translation = translate.translate(description, Translate.TranslateOption.targetLanguage(targetLang));
				String translatedDescription = translation.getTranslatedText();
				
				Map<String, String> responseBody = new HashMap<>();
				responseBody.put("translatedTitle", translatedTitle);
				responseBody.put("translatedDescription", translatedDescription);
				return ResponseEntity.ok(responseBody);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().body(Map.of("error", "번역 중 오류: " + e.getMessage()));
		}
	}


//	Translation translation = translate.translate("¡Hola Mundo!");
//	System.out.printf("Translated Text:\n\t%s\n", translation.getTranslatedText());
}
