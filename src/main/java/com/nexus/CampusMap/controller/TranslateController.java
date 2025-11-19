package com.nexus.CampusMap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.google.cloud.translate.*;

@RestController
@RequestMapping("/api")
public class TranslateController {
	private final Translate translate = TranslateOptions.getDefaultInstance().getService();
	
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
