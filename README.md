#  CampusMap (Spring Boot Project)

> 충북대학교 소프트웨어학과 오픈소스 개발 프로젝트   

## 프로젝트 개요
챗봇을 이용한 다국어 지원 캠퍼스 맵---

## 팀 구성 및 역할
- **팀장: 이용희**
  - 프로젝트 뼈, 브랜치 관리, 기본 라우팅, 전체 아키텍처 설계  
- **팀원: BATKHISHIG**
  - 문서 작업
- **팀원: 김가원**
  - 로그인/회원가입 기능 (Spring Security)
  - 게시판 CRUD, 댓글 기능  
- **팀원: 이현승**
  - AI 기능 (번역/요약 등)
  - UI 개선   

---

## 기술 스택
- **Backend**: Spring Boot, Spring MVC, Spring Security  
- **Frontend**: React, HTML/CSS/JavaScript  
- **Database**: H2 (개발용), MySQL (운영 예정)  
- **Tools**: GitHub, IntelliJ, VScode, Gradle  

---

## 주차별 팀 활동일지

| Week | Report |
|---|---|
| 1주차 | OT |
| 2주차 | [Week 2](docs/weekly-log/week1.md) |
| 3주차 | [Week 3](docs/weekly-log/week3.md) |
| 4주차 | [Week 4](docs/weekly-log/week4.md) |
| 5주차 | 휴강 |
| 6주차 | [Week 6](docs/weekly-log/week5.md) |
| 7주차 | [Week 7](docs/weekly-log/week7.md) |

## SpringBoot 개인 공부
| 이름 | Study 링크 |
|---|---|
| 김가원 | [김가원](study/Gawon/) |
| 이용희 | [이용희](study/Yonghee/) |
| 이현승 | [이현승](study/Hyunseong/) |
| Batkhishig | [Batkhishig](study/Batkhishgig/) |

## 팀 프로젝트 Notion 일지
[(https://www.notion.so/9040/campus-map-2c0ba49a995f800395bdc5e350f3fb48?source=copy_link)]

## 프로젝트 시연 동영상
- **YouTube Link**: [(https://www.youtube.com/watch?v=iBgV2MzA5lo)]
- **File**: Demo 폴더 내 `demo_video.mp4` 참조

## 프로젝트 진행 소감 및 후기
- **팀장: 이용희**
  - 책임감을 가지고 프로젝트를 진행하며 역할분배 및 시스템을 처음부터 끝까지 설계하고 구현하는 경험을 할 수 있었다.  
- **팀원: BATKHISHIG**
  - 프로젝트 전반을 이해하고 협업의 중요성을 느꼈다.
- **팀원: 김가원**
  - 백엔드와 시스템 설계를 맡으며 JWT 기반 권한 관리와 API 구조를  이해할 수 있었다. Spring Boot, MySQL, API 연동 등 개발의 기술적 흐름을 깊이 있게 이해할 수 있었습니다 . 특히 개발 중 발생하는 다양한 오류를 해결하며 문제 해결 능력을 길렀고, GitHub와 Notion을 활용한 협업 경험을 통해 팀원 간 긴밀한 의사소통이 프로젝트의 완성도를 높이는 핵심임을 깨달았습니다.  
- **팀원: 이현승**
  - AI 챗봇과 외부 API 연동을 통해 실제 AI 서비스 적용 과정을 경험했다.
  - 이번 프로젝트는 저에게 Java 웹 환경과 팀 협업을 처음 경험해 본 의미 있는 시간이었습니다. 저는 AI API 연동과 부트스트랩을 활용한 사이드바 UI 구현 등의 프론트엔드 기여를 맡았습니다. 낯선 기술들을 하나씩 익혀가며 기능이 동작할 때 큰 보람을 느꼈고, 무엇보다 팀원들과 소통하며 하나의 결과물을 완성해가는 과정 자체가 즐거운 경험이었습니다.

## 향후 발전 방향
1. **모바일 최적화**: 모바일 환경에 최적화된 UI를 추가할 예정이다.
2. **시설 안내 확장**: 현재는 충북대 위주이나, 데이터만 변경하면 향후 교내 시설물 안내(편의점, 복사실 등)나 배달 존 안내 등으로 기능을 확장 가능
