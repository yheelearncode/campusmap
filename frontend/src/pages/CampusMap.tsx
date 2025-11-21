// window kakao 선언부, React import 유지
import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
    __openEventDetail: any;
  }
}

const KAKAO_MAP_API_KEY = "08a2de71046acd72f7f1c67a474c9e17";

// 상세 정보 모달용 타입
interface EventDetail {
  id: number;
  title: string;
  description: string;
  startsAt?: string;
  endsAt?: string;
  lat: number;
  lon: number;
  likes?: number;
  comments?: { user: string; content: string }[];
  imageUrl?: string;
  creatorId?: number;
  creatorName?: string;
}

export default function CampusMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [newEventPosition, setNewEventPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startsAt: "", endsAt: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [overlays, setOverlays] = useState<any[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const [eventList, setEventList] = useState<EventDetail[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetail | null>(null);
  const [comment, setComment] = useState("");
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  // 컴포넌트 로드 시 로컬 스토리지에서 사용자 정보 가져오기
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("username");
    const userRole = localStorage.getItem("userRole"); 

    if (userId && userName && userRole) {
      setCurrentUserInfo({ id: userId, name: userName, role: userRole });
    }
  }, []);


  // 수정/삭제 버튼 표시 권한 확인 함수
  const canEditOrDelete = (event: EventDetail | null) => {
    if (!event || !currentUserInfo) return false;

    const currentUserName = localStorage.getItem("userName");
    const currentRole = currentUserInfo.role;

    // 1. 작성자 ID 비교
    // DB에서 Long으로 받으므로, event.creatorId는 number이고 currentUserId는 string입니다.
    const isOwner = event.creatorName === currentUserName;
    
    // 2. 관리자 역할 확인
    const isAdmin = currentRole === "ADMIN" || currentRole === "STAFF";

    return isOwner || isAdmin;
  };


  // 이벤트 삭제 함수 (DELETE API 호출)
  const handleDeleteEvent = async () => {
    if (!eventDetails || !confirm(`이벤트 '${eventDetails.title}'을(를) 삭제하시겠습니까?`)) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`/api/events/${eventDetails.id}`, {
      method: 'DELETE',
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (res.ok) {
        alert("이벤트가 삭제되었습니다.");
        setEventDetails(null); // 모달 닫기
        if (mapInstance) loadOverlays(mapInstance); // 지도 마커 새로고침
    } else {
        const errorBody = await res.json().catch(() => ({ message: '알 수 없는 오류' }));
        alert(`삭제 실패: ${res.status} ${errorBody.message || errorBody.error || '권한이 없습니다.'}`);
    }
  };

  // 이벤트 수정 함수 (수정 폼 띄우기)
  const handleEditEvent = () => {
    alert(`이벤트 ${eventDetails?.title}을 수정합니다. (PUT API 호출 필요)`);
    // 여기에 수정 폼을 띄우는 로직을 구현합니다.
  };

  // 로그아웃 함수
  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
  };

  // 전역 함수 등록 (커스텀 오버레이 클릭 시 실행됨)
  useEffect(() => {
    window.__openEventDetail = (id: number) => {
      const ev = eventList.find((e) => e.id === id);
      if (ev) {
        setEventDetails(ev);
      }
    };
  }, [eventList]);

  // 지도 초기화
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao) {
        window.kakao.maps.load(() => {
          const map = new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(36.632473, 127.453143),
            level: 4,
          });

          setMapInstance(map);
          loadOverlays(map);

          // 추가 모드일 때만 위치를 선택할 수 있도록
          window.kakao.maps.event.addListener(map, "click", (e: any) => {
            if (isAddMode) {
              const latlng = e.latLng;
              setNewEventPosition({ lat: latlng.getLat(), lon: latlng.getLng() });
              setShowForm(true);
              setIsAddMode(false);
            }
          });
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isAddMode]);

  // 오버레이 불러오기
  function loadOverlays(map: any) {
    fetch("/api/events")
      .then((res) => res.json())
      .then((events: EventDetail[]) => {
        setEventList(events); // ← 전역에서 접근 가능하도록 저장

        overlays.forEach((o) => o.setMap(null));

        const newOverlays: any[] = [];

        events.forEach((ev) => {
          const position = new window.kakao.maps.LatLng(ev.lat, ev.lon);

          // onclick은 절대 style 안에 넣으면 안 됨!!
          const content = `
            <div class="campus-marker"
              style="
                position: relative;
                width: 60px; height: 60px;
                margin-left: -30px; margin-top: -60px;
                cursor: pointer;
                transition: transform 0.2s;
              "
              onclick="window.__openEventDetail(${ev.id})"
              onmouseover="this.style.transform='scale(1.2)'; this.style.zIndex='10';"
              onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1';"
            >
              ${
                ev.imageUrl
                  ? `
                <div style="
                  width: 50px; height: 50px;
                  border-radius: 14px; overflow: hidden;
                  border: 3px solid white;
                  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                ">
                  <img src="${ev.imageUrl}" alt="${ev.title}"
                    style="width:100%; height:100%; object-fit:cover;"
                  />
                </div>`
                  : `
                <div style="
                  width: 44px; height: 44px;
                  background: #667eea; color: white;
                  border-radius: 50%; border: 3px solid white;
                  display: flex; align-items: center; justify-content: center;
                  font-weight: bold; font-size: 14px;
                  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                ">${ev.title[0]}</div>`
              }

              <div style="
                position: absolute;
                bottom: -8px; left: 50%;
                transform: translateX(-50%);
                width: 0; height: 0;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-top: 9px solid white;
              "></div>
            </div>
          `;

          const overlay = new window.kakao.maps.CustomOverlay({
            position,
            content,
            yAnchor: 1,
            clickable: true,
          });

          overlay.setMap(map);
          newOverlays.push(overlay);
        });

        setOverlays(newOverlays);
      })
      .catch((err) => console.error("이벤트 로드 실패:", err));
  }

  // form 입력 핸들러
  const onFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 이미지 업로드
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // 이벤트 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventPosition) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("lat", String(newEventPosition.lat));
    formData.append("lon", String(newEventPosition.lon));

    if (form.startsAt) formData.append("startsAt", form.startsAt);
    if (form.endsAt) formData.append("endsAt", form.endsAt);
    if (imageFile) formData.append("image", imageFile);

    const headers = {
        "Authorization": `Bearer ${token}` 
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!res.ok) {
      let errorMessage = "등록 실패";
      try {
        // 서버가 보낸 JSON 응답 본문을 읽으려고 시도
        const errorBody = await res.json(); 
        
        if (errorBody && errorBody.error) {
          errorMessage = errorBody.error; 
        } else {
          // JSON 본문이 없거나 다른 형식일 때 상태 코드를 표시
          errorMessage = `등록 실패 (HTTP ${res.status})`; 
        }
      } catch (e) {
        // JSON 파싱 자체가 실패한 경우 (서버가 빈 응답이나 HTML을 보냈을 때)
        errorMessage = `등록 실패 (HTTP ${res.status} 응답 본문 없음)`;
      }
      
      alert(errorMessage);
      return;
    }

    alert("등록 완료!");
    setShowForm(false);
    setForm({ title: "", description: "", startsAt: "", endsAt: "" });
    setNewEventPosition(null);
    setImageFile(null);

    if (mapInstance) loadOverlays(mapInstance);
  };

  const handleAddComment = () => {
    if (!eventDetails || !comment.trim()) return;

    setEventDetails({
      ...eventDetails,
      comments: [...(eventDetails.comments ?? []), { user: "me", content: comment }],
    });

    setComment("");
  };

  // ============================
  //   렌더링
  // ============================

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div
        style={{
          padding: "12px 24px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: 0 }}>캠퍼스 이벤트 지도</h2>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
              background: isAddMode ? "#ff6b6b" : "rgba(255,255,255,0.2)",
              color: "white",
            }}
          >
            {isAddMode ? "취소" : "이벤트 추가"}
          </button>

          <span>
              {currentUserInfo ? `${currentUserInfo.name}님` : "사용자"}
              {currentUserInfo && (
                  <span style={{ marginLeft: 8, padding: '2px 6px', borderRadius: 4, background: currentUserInfo.role === 'ADMIN' ? '#ffc107' : '#28a745', fontSize: 12, fontWeight: 'bold' }}>
                      {currentUserInfo.role} 
                  </span>
              )}
          </span>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 지도 */}
      <div ref={mapRef} style={{ width: "100%", flex: 1 }} />

      {/* 추가 모드 안내 */}
      {isAddMode && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#667eea",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 700,
          }}
        >
          지도에서 이벤트 위치를 클릭하세요
        </div>
      )}

      {/* 이벤트 등록 모달 */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 28,
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginBottom: 16 }}>이벤트 등록</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input
                name="title"
                placeholder="제목 *"
                value={form.title}
                onChange={onFormChange}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />

              <textarea
                name="description"
                placeholder="내용 *"
                rows={4}
                value={form.description}
                onChange={onFormChange}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />

              <input type="file" accept="image/*" onChange={onImageChange} />

              <div style={{ display: "flex", gap: 10 }}>
                <input name="startsAt" type="datetime-local" value={form.startsAt} onChange={onFormChange} />
                <input name="endsAt" type="datetime-local" value={form.endsAt} onChange={onFormChange} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)}>
                  취소
                </button>
                <button type="submit" style={{ background: "#667eea", color: "white" }}>
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상세정보 모달 */}
      {eventDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              width: "90%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>{eventDetails.title}</h3>

            {eventDetails.imageUrl && (
              <img
                src={eventDetails.imageUrl}
                alt=""
                style={{
                  width: "100%",
                  borderRadius: 12,
                  marginBottom: 12,
                  objectFit: "cover",
                  maxHeight: 350,
                }}
              />
            )}

            {/* 작성자 이름 표시 */}
            <p style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
                작성자: <b>{eventDetails.creatorName || "정보 없음"}</b>
            </p>

            <p>{eventDetails.description}</p>

            <div style={{ margin: "10px 0" }}>
              <b>추천: {eventDetails.likes ?? 0}</b>
            </div>

            {/* 수정/삭제 버튼 (조건부 렌더링) */}
            {canEditOrDelete(eventDetails) && (
                <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
                    <button 
                        onClick={handleEditEvent} 
                        style={{ background: "#007bff", color: "white", padding: "8px 15px", borderRadius: 8, border: 'none' }}
                    >
                        수정
                    </button>
                    <button 
                        onClick={handleDeleteEvent} 
                        style={{ background: "#dc3545", color: "white", padding: "8px 15px", borderRadius: 8, border: 'none' }}
                    >
                        삭제
                    </button>
                </div>
            )}

            <button
              onClick={() => setEventDetails(null)}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "white",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
