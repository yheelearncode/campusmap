// window kakao 선언부, React import 유지
import React, { useEffect, useRef, useState } from "react";

// (필요 시 수정) 챗봇 위젯 import
import ChatWidget from "../components/ChatWidget";

import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    kakao: any;
    __openEventDetail: any;
  }
}

const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

// 이벤트 상세 타입
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

// UI 다국어
const ui_translations = {
  ko: {
    main: {
      title: "캠퍼스 이벤트 지도",
      add_event: "이벤트 추가",
      add_guide: "지도에서 이벤트 위치를 클릭하세요",
      logout: "로그아웃",
      logout_check: "로그아웃 하시겠습니까?",
      cancel: "취소",
    },
    add: {
      title: "이벤트 등록",
      title_placeholder: "제목 *",
      description_placeholder: "내용 *",
      post: "등록",
      cancel: "취소",
      success: "등록 완료!",
      fail: "등록 실패",
    },
    detail: {
      likes: "추천",
      close: "닫기",
    },
  },
  en: {
    main: {
      title: "Campus Event Map",
      add_event: "Add Event",
      add_guide: "Click the event location on the map",
      logout: "Logout",
      logout_check: "Logout?",
      cancel: "Cancel",
    },
    add: {
      title: "Post Event",
      title_placeholder: "Title *",
      description_placeholder: "Description *",
      post: "Post",
      cancel: "Cancel",
      success: "Post Done!",
      fail: "Post Failed",
    },
    detail: {
      likes: "Likes",
      close: "Close",
    },
  },
  mn: {
    main: {
      title: "캠퍼스 이벤트 지도(mn)",
      add_event: "이벤트 추가(mn)",
      add_guide: "지도에서 이벤트 위치를 클릭하세요(mn)",
      logout: "로그아웃(mn)",
      logout_check: "로그아웃 하시겠습니까?(mn)",
      cancel: "취소(mn)",
    },
    add: {
      title: "이벤트 등록(mn)",
      title_placeholder: "제목 *(mn)",
      description_placeholder: "내용 *(mn)",
      post: "등록(mn)",
      cancel: "취소(mn)",
      success: "등록 완료!(mn)",
      fail: "등록 실패(mn)",
    },
    detail: {
      likes: "추천(mn)",
      close: "닫기(mn)",
    },
  },
};

export default function CampusMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // 추가 모달용 상태
  const [showForm, setShowForm] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [newEventPosition, setNewEventPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startsAt: "", endsAt: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 수정 모달용 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<{
    id: number | null;
    title: string;
    description: string;
    startsAt: string;
    endsAt: string;
    lat: number;
    lon: number;
  }>({
    id: null,
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    lat: 0,
    lon: 0,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // 지도/오버레이
  const [overlays, setOverlays] = useState<any[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // 이벤트 목록 & 상세
  const [eventList, setEventList] = useState<EventDetail[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetail | null>(null);
  const [comment, setComment] = useState("");

  // 유저 정보
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  // 언어
  const userLang = (localStorage.getItem("language") as "ko" | "en" | "mn") || "ko";
  const t = ui_translations[userLang] || ui_translations["ko"];

  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedDescription, setTranslatedDescription] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // 유저 정보 로드
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("userRole");

    if (userId && username && role) {
      setCurrentUserInfo({ id: userId, name: username, role });
    }
  }, []);

  // 권한 체크
  const canEditOrDelete = (event: EventDetail | null) => {
    if (!event || !currentUserInfo) return false;

    const isOwner = event.creatorName === currentUserInfo.name;
    const isAdmin = currentUserInfo.role === "ADMIN" || currentUserInfo.role === "STAFF";

    return isOwner || isAdmin;
  };

  // 삭제
  const handleDeleteEvent = async () => {
    if (!eventDetails) return;
    if (!confirm(`이벤트 '${eventDetails.title}'을 삭제하시겠습니까?`)) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`/api/events/${eventDetails.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("삭제되었습니다");
      setEventDetails(null);
      if (mapInstance) loadOverlays(mapInstance);
    } else {
      alert("삭제 실패");
    }
  };

  // 수정 버튼 클릭 -> 수정 모달 열기
  const handleEditEvent = () => {
    if (!eventDetails) return;

    // datetime-local 형식 맞추기 (YYYY-MM-DDTHH:mm)
    const startsAt = eventDetails.startsAt ? eventDetails.startsAt.substring(0, 16) : "";
    const endsAt = eventDetails.endsAt ? eventDetails.endsAt.substring(0, 16) : "";

    setEditForm({
      id: eventDetails.id,
      title: eventDetails.title,
      description: eventDetails.description,
      startsAt,
      endsAt,
      lat: eventDetails.lat,
      lon: eventDetails.lon,
    });
    setEditImageFile(null);
    setCurrentImageUrl(eventDetails.imageUrl || null);

    setIsEditMode(true);     // 수정 모달 열기
    setShowForm(false);      // 등록 모달 닫기
    setEventDetails(null);   // 상세 모달 닫기
  };

  // 수정 폼 입력 핸들러
  const onEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 수정 이미지 변경 핸들러
  const onEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  // 수정 제출 (PUT)
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("title", editForm.title);
    formData.append("description", editForm.description);

    formData.append("lon", String(editForm.lon));
    formData.append("lat", String(editForm.lat));
    if (editForm.startsAt) formData.append("startsAt", editForm.startsAt);
    if (editForm.endsAt) formData.append("endsAt", editForm.endsAt);
    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    const res = await fetch(`/api/events/${editForm.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("수정 완료!");
      setIsEditMode(false);
      setEditImageFile(null);
      setCurrentImageUrl(null);
      if (mapInstance) loadOverlays(mapInstance);
    } else {
      try {
        const data = await res.json();
        alert(`수정 실패: ${data.error || "알 수 없는 오류"}`);
      } catch {
        alert("수정 실패(서버 응답 오류)");
      }
    }
  };

  // 번역 (상세 모달 열릴 때)
  useEffect(() => {
    if (!eventDetails) return;

    setIsTranslating(true);

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: eventDetails.title,
        description: eventDetails.description,
        targetLang: userLang,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTranslatedTitle(data.translatedTitle || eventDetails.title);
        setTranslatedDescription(data.translatedDescription || eventDetails.description);
      })
      .finally(() => setIsTranslating(false));
  }, [eventDetails, userLang]);

  // Kakao map loader
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(36.632473, 127.453143),
          level: 4,
        });

        setMapInstance(map);
        loadOverlays(map);

        window.kakao.maps.event.addListener(map, "click", (e: any) => {
          if (isAddMode) {
            const latlng = e.latLng;
            setNewEventPosition({ lat: latlng.getLat(), lon: latlng.getLng() });
            setShowForm(true);
            setIsAddMode(false);
          }
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddMode]);

  // 오버레이 로드
  function loadOverlays(map: any) {
    fetch("/api/events")
      .then((res) => res.json())
      .then((events: EventDetail[]) => {
        setEventList(events);
        overlays.forEach((o) => o.setMap(null));

        const newOverlays: any[] = [];

        events.forEach((ev) => {
          const position = new window.kakao.maps.LatLng(ev.lat, ev.lon);

          const content = `
            <div class="campus-marker"
              onclick="window.__openEventDetail(${ev.id})"
              style="cursor:pointer;width:60px;height:60px;"
            >
              ${ev.imageUrl
              ? `<img src="${ev.imageUrl}" style="width:100%;height:100%;border-radius:12px;object-fit:cover;" />`
              : `<div style="background:#667eea;color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;">${ev.title[0]}</div>`
            }
            </div>
          `;

          const overlay = new window.kakao.maps.CustomOverlay({
            position,
            content,
            yAnchor: 1,
            clickable: true,
          });

          newOverlays.push(overlay);
          overlay.setMap(map);
        });

        setOverlays(newOverlays);
      });
  }

  // 전역 상세보기 열기
  useEffect(() => {
    window.__openEventDetail = (id: number) => {
      const ev = eventList.find((e) => e.id === id);
      if (ev) setEventDetails(ev);
    };
  }, [eventList]);

  // 입력 핸들러 (등록 모달)
  const onFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  // 이벤트 등록 (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventPosition) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("lat", String(newEventPosition.lat));
    formData.append("lon", String(newEventPosition.lon));
    if (form.startsAt) formData.append("startsAt", form.startsAt);
    if (form.endsAt) formData.append("endsAt", form.endsAt);
    if (imageFile) formData.append("image", imageFile);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      alert("등록 완료!");
      setShowForm(false);
      setForm({ title: "", description: "", startsAt: "", endsAt: "" });
      setImageFile(null);
      setNewEventPosition(null);
      if (mapInstance) loadOverlays(mapInstance);
    } else {
      alert("등록 실패");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* 🔹 챗봇 */}
      <ChatWidget />

      {/* 헤더 */}
      <div
        style={{
          padding: "12px 24px",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>{t.main.title}</h2>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: isAddMode ? "#ff6b6b" : "rgba(255,255,255,0.2)",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isAddMode ? t.main.cancel : t.main.add_event}
          </button>

          <span>
            {currentUserInfo ? `${currentUserInfo.name}님` : "사용자"}
            {currentUserInfo && (
              <span
                style={{
                  marginLeft: 8,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: currentUserInfo.role === "ADMIN" ? "#ffc107" : "#28a745",
                  fontSize: 12,
                }}
              >
                {currentUserInfo.role}
              </span>
            )}
          </span>

          {currentUserInfo && currentUserInfo.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                background: "#2d3436",
                color: "white",
              }}
            >
              관리자 페이지
            </button>
          )}

          <button
            onClick={() => {
              if (confirm(t.main.logout_check)) {
                localStorage.clear();
                window.location.href = "/login";
              }
            }}
            style={{
              padding: "8px 20px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              border: "none",
              color: "white",
            }}
          >
            {t.main.logout}
          </button>
        </div>
      </div>

      {/* 지도 */}
      <div ref={mapRef} style={{ flex: 1, width: "100%" }} />

      {/* =============== 이벤트 등록 모달 =============== */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              width: 400,
            }}
          >
            <h2>{t.add.title}</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                name="title"
                placeholder={t.add.title_placeholder}
                value={form.title}
                onChange={onFormChange}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              />

              <textarea
                name="description"
                placeholder={t.add.description_placeholder}
                value={form.description}
                onChange={onFormChange}
                rows={4}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              />

              <input type="file" accept="image/*" onChange={onImageChange} />

              <div style={{ display: "flex", gap: 10 }}>
                <input type="datetime-local" name="startsAt" value={form.startsAt} onChange={onFormChange} />
                <input type="datetime-local" name="endsAt" value={form.endsAt} onChange={onFormChange} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)}>
                  {t.add.cancel}
                </button>

                <button
                  type="submit"
                  style={{ background: "#667eea", color: "white", padding: "8px 15px" }}
                >
                  {t.add.post}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============== 상세 모달 =============== */}
      {eventDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              width: "90%",
              maxWidth: 550,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>{isTranslating ? "번역 중..." : translatedTitle}</h3>

            {eventDetails.imageUrl && (
              <img
                src={eventDetails.imageUrl}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              />
            )}

            <p>{isTranslating ? "..." : translatedDescription}</p>

            <p style={{ color: "#666", marginTop: 10 }}>
              작성자: <b>{eventDetails.creatorName || "정보 없음"}</b>
            </p>

            <p>
              {t.detail.likes}: <b>{eventDetails.likes ?? 0}</b>
            </p>

            {canEditOrDelete(eventDetails) && (
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
                <button
                  onClick={handleEditEvent}
                  style={{
                    background: "#007bff",
                    color: "white",
                    padding: "8px 15px",
                    borderRadius: 8,
                    border: "none",
                  }}
                >
                  수정
                </button>

                <button
                  onClick={handleDeleteEvent}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    padding: "8px 15px",
                    borderRadius: 8,
                    border: "none",
                  }}
                >
                  삭제
                </button>
              </div>
            )}

            <button
              onClick={() => setEventDetails(null)}
              style={{
                marginTop: 20,
                padding: "10px 15px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "white",
              }}
            >
              {t.detail.close}
            </button>
          </div>
        </div>
      )}

      {/* =============== 이벤트 수정 모달 =============== */}
      {isEditMode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2500,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              width: 400,
            }}
          >
            <h2>이벤트 수정</h2>

            <form onSubmit={handleUpdateSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                name="title"
                placeholder="제목"
                value={editForm.title}
                onChange={onEditFormChange}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              />

              <textarea
                name="description"
                placeholder="내용"
                value={editForm.description}
                onChange={onEditFormChange}
                rows={4}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              />

              {currentImageUrl && (
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>현재 이미지:</p>
                  <img
                    src={currentImageUrl}
                    style={{
                      width: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}

              <input type="file" accept="image/*" onChange={onEditImageChange} />

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="datetime-local"
                  name="startsAt"
                  value={editForm.startsAt}
                  onChange={onEditFormChange}
                />
                <input
                  type="datetime-local"
                  name="endsAt"
                  value={editForm.endsAt}
                  onChange={onEditFormChange}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setIsEditMode(false)}>
                  취소
                </button>

                <button
                  type="submit"
                  style={{ background: "#007bff", color: "white", padding: "8px 15px" }}
                >
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
