// window kakao 선언부, React import 유지
import React, { useEffect, useRef, useState } from "react";
import Button from 'react-bootstrap/Button';
import ToggleButton from "react-bootstrap/ToggleButton";
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import { ui_translations } from './constants/translations'
import { useNavigate } from "react-router-dom";

// (필요 시 수정) 챗봇 위젯 import
import ChatWidget from "../components/ChatWidget";

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

interface Comment {
  id: number;
  content: string;
  userName: string;
  createdAt: string;
  isMine: boolean;
}

interface ScheduleSidebarProps {
  show: boolean;
  handleClose: () => void;
  events: EventDetail[];
  onEventClick: (event: EventDetail) => void;
  t: any;
}

// 일정 사이드바
function ScheduleSidebar({ show, handleClose, events, onEventClick, t }: ScheduleSidebarProps) {
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.startsAt ? new Date(a.startsAt).getTime() : new Date(9999, 12);
    const dateB = b.startsAt ? new Date(b.startsAt).getTime() : new Date(9999, 12);
    return dateA - dateB;
  });

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      key="end"
      placement="end"
      name="end"
      scroll={true}
      backdrop={false}
      style={{ top: '56px', height: 'calc(100vh - 56px)' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{t.main.event}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {sortedEvents.length === 0 ? (
          <p>이벤트가 없습니다.</p>
        ) : (
          <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
            {sortedEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: 'white', // Ensure background is white for visibility
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f8f8')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                <h5>{event.title}</h5>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                  {event.startsAt ? t.detail.from_prefix + new Date(event.startsAt).toLocaleString() + t.detail.from_suffix : t.detail.no_date}<br />
                  {event.endsAt ? t.detail.to_prefix + new Date(event.endsAt).toLocaleString() + t.detail.to_suffix : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default function CampusMap() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

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
  const [comments, setComments] = useState<Comment[]>([]);

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

  const [showSchedule, setShowSchedule] = useState(false);

  // ===========================
  // ⭐ 추가된 프로필 수정 state
  // ===========================
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
  });

  // 유저 정보 로드
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("userRole");

    if (userId && username && role) {
      setCurrentUserInfo({ id: userId, name: username, role });
      setProfileForm((prev) => ({ ...prev, username }));
    }
  }, []);

  // ===========================
  // ⭐ 프로필 입력 핸들러
  // ===========================
  const onProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // 전역 함수 등록 (커스텀 오버레이 클릭 시 실행됨)
  useEffect(() => {
    window.__openEventDetail = (id: number) => {
      const ev = eventList.find((e) => e.id === id);
      if (ev) {
        setEventDetails(ev);
        if (mapInstance && window.kakao) {
          mapInstance.panTo(new window.kakao.maps.LatLng(ev.lat, ev.lon));
        }
      }
    };
  }, [eventList, mapInstance]);
  // ===========================
  // ⭐ 닉네임 변경 API
  // ===========================
  const handleUpdateNickname = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: profileForm.username }),
    });

    if (res.ok) {
      alert("닉네임이 변경되었습니다!");
      localStorage.setItem("username", profileForm.username);
      window.location.reload();
    } else {
      alert("닉네임 변경 실패!");
    }
  };

  // ===========================
  // ⭐ 비밀번호 변경 API
  // ===========================
  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    if (!profileForm.currentPassword || !profileForm.newPassword) {
      return alert("비밀번호를 입력하세요.");
    }

    const res = await fetch("/api/users/me/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword,
      }),
    });

    if (res.ok) {
      alert("비밀번호가 변경되었습니다!");
      setShowProfileModal(false);
      setProfileForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } else {
      alert("비밀번호 변경 실패!");
    }
  };

  // 권한 체크
  const canEditOrDelete = (event: EventDetail | null) => {
    if (!event || !currentUserInfo) return false;

    const isOwner = event.creatorName === currentUserInfo.name;
    const isAdmin = currentUserInfo.role === "ADMIN";

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

    setIsEditMode(true);
    setShowForm(false);
    setEventDetails(null);
  };

  // 수정 폼 입력 핸들러
  const onEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  // 수정 제출
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

  // 번역
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

  // 댓글 불러오기
  useEffect(() => {
    if (eventDetails) {
      console.log("Fetching comments for event:", eventDetails.id);
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      fetch(`/api/events/${eventDetails.id}/comments`, {
        cache: "no-store",
        headers
      })
        .then((res) => {
          console.log("Comment fetch response status:", res.status);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Received comment data:", data);
          if (!Array.isArray(data)) {
            console.error("Expected array but got:", data);
            setComments([]);
            return;
          }
          // 내 댓글 여부 판단
          const myName = localStorage.getItem("username");
          const processed = data.map((c: any) => ({
            ...c,
            isMine: c.userName === myName || currentUserInfo?.role === "ADMIN",
          }));
          console.log("Processed comments:", processed);
          setComments(processed);
        })
        .catch((err) => {
          console.error("Failed to fetch comments:", err);
          setComments([]);
        });
    } else {
      setComments([]);
    }
  }, [eventDetails, currentUserInfo]);

  // 댓글 작성
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    if (!eventDetails) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");

    const res = await fetch(`/api/events/${eventDetails.id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: comment }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComment("");
      setComments((prev) => [...prev, newComment]);
    } else {
      if (res.status === 403) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      try {
        const err = await res.json();
        alert(`댓글 작성 실패: ${err.error || JSON.stringify(err)}`);
      } catch (e) {
        alert(`댓글 작성 실패: ${res.status} ${res.statusText}`);
      }
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      alert("삭제 실패");
    }
  };

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
    return () => { document.head.removeChild(script) };
  }, [isAddMode]);

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (confirm(t.main.logout_check)) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // 네비게이션 바
  function NavBar({ name }: { name: string | null }) {
    return (
      <Navbar className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
        <Container fluid>
          <Navbar.Brand><strong>{t.main.title}</strong></Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <ToggleButton
              id="toggle-check"
              type="checkbox"
              variant="secondary"
              value="1"
              className="me-2"
              checked={showSchedule}
              onChange={(e) => setShowSchedule(e.currentTarget.checked)}
            >
              {t.main.event_list}
            </ToggleButton>
            <Button variant="primary" onClick={() => setIsAddMode(!isAddMode)}>
              {isAddMode ? t.main.cancel : t.main.add_event}
            </Button>
            <Navbar.Text className="ms-5">
              <strong>{name}</strong>
            </Navbar.Text>
            {currentUserInfo && currentUserInfo.role === "ADMIN" && (
              <Button onClick={() => navigate("/admin")} variant="warning" className="ms-2">
                관리자 페이지
              </Button>
            )}
            <Button onClick={handleLogout} variant="dark" className="ms-2">
              {t.main.logout}
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  const handleEventClickInSidebar = (event: EventDetail) => {
    setEventDetails(event);
    if (mapInstance && window.kakao) {
      mapInstance.panTo(new window.kakao.maps.LatLng(event.lat, event.lon));
    }
  };


  // 오버레이 불러오기
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
              style="
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 60px; height: 60px;
                cursor: pointer;
                transition: transform 0.2s;
              "
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

  useEffect(() => {
    window.__openEventDetail = (id: number) => {
      const ev = eventList.find((e) => e.id === id);
      if (ev) setEventDetails(ev);
    };
  }, [eventList]);

  const onFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

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
      const data = await res.json();

      if (data.isApproved) {
        alert("등록이 완료되었습니다! 지도에 바로 표시됩니다.");
      } else {
        alert("등록 요청이 완료되었습니다.\n관리자 승인 후 지도에 표시됩니다.");
      }
      setShowForm(false);
      setForm({ title: "", description: "", startsAt: "", endsAt: "" });
      setImageFile(null);
      setNewEventPosition(null);
      if (mapInstance) loadOverlays(mapInstance);
    } else {
      alert("등록 실패");
    }
  };

  // 좋아요 핸들러
  const handleLike = async () => {
    if (!eventDetails) return;

    // 낙관적 업데이트 (Optimistic Update)
    setEventDetails((prev) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null));

    try {
      const res = await fetch(`/api/events/${eventDetails.id}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        // 서버 응답값으로 확정
        setEventDetails((prev) => (prev ? { ...prev, likes: data.likes } : null));

        // 목록에도 반영
        setEventList((prev) =>
          prev.map((e) => (e.id === eventDetails.id ? { ...e, likes: data.likes } : e))
        );
      }
    } catch (e) {
      console.error("Like failed", e);
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
      <NavBar name={localStorage.getItem("username")} />

      <ScheduleSidebar
        show={showSchedule}
        events={eventList}
        handleClose={() => setShowSchedule(false)}
        onEventClick={handleEventClickInSidebar}
        t={t}
      />

      {/* 지도 */}
      <div ref={mapRef} style={{ flex: 1, width: "100%" }} />

      {/* 이벤트 추가 모드 안내 메시지 */}
      {
        isAddMode && (
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
            {t.main.add_guide}
          </div>
        )
      }

      {/* 이벤트 등록 모달 */}
      {/* ================== 등록 모달 ================== */}
      {
        showForm && (
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

                <Form.Control type="file" accept="image/*" onChange={onImageChange} />

                <div style={{ display: "flex", gap: 10 }}>
                  <input type="datetime-local" name="startsAt" value={form.startsAt} onChange={onFormChange} />
                  <input type="datetime-local" name="endsAt" value={form.endsAt} onChange={onFormChange} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <Button type="button" variant="light" onClick={() => setShowForm(false)}>
                    {t.add.cancel}
                  </Button>
                  <Button type="submit" variant="primary">
                    {t.add.post}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ================== 상세 모달 ================== */}
      {
        eventDetails && (
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

              <p style={{ color: '#666' }}>
                {eventDetails.startsAt ? t.detail.from_prefix + new Date(eventDetails.startsAt).toLocaleString() + t.detail.from_suffix : ""} <br />
                {eventDetails.endsAt ? t.detail.to_prefix + new Date(eventDetails.endsAt).toLocaleString() + t.detail.to_suffix : ""}
              </p>


              <p>{isTranslating ? 'Translating...' : translatedDescription/*eventDetails.description*/}</p>
              <p>{isTranslating ? "..." : translatedDescription}</p>

              <p style={{ color: "#666", marginTop: 10 }}>
                작성자: <b>{eventDetails.creatorName || "정보 없음"}</b>
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <span>{t.detail.likes}: <b>{eventDetails.likes ?? 0}</b></span>
                <button
                  onClick={handleLike}
                  style={{
                    background: "none",
                    border: "1px solid #ff4d4f",
                    color: "#ff4d4f",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    paddingBottom: 2,
                  }}
                  title="좋아요"
                >
                  ♥
                </button>
              </div>

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

              <hr style={{ margin: "20px 0" }} />

              {/* 댓글 섹션 */}
              <div>
                <h5>댓글 ({comments.length})</h5>
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    background: "#f8f9fa",
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  {comments.length === 0 ? (
                    <p style={{ color: "#aaa", textAlign: "center" }}>첫 댓글을 남겨보세요!</p>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "8px 0",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold", fontSize: "0.9em" }}>
                            {c.userName}
                            <span style={{ fontWeight: "normal", color: "#aaa", marginLeft: 8, fontSize: "0.8em" }}>
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div>{c.content}</div>
                        </div>
                        {c.isMine && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            style={{
                              border: "none",
                              background: "none",
                              color: "#dc3545",
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    style={{
                      flex: 1,
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    style={{
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    등록
                  </button>
                </div>
              </div>

              <Button
                onClick={() => setEventDetails(null)}
                variant="outline-secondary"
                style={{
                  marginTop: 20,
                  padding: "10px 15px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "white",
                }}
              >
                {t.detail.close}
              </Button>
            </div>
          </div>
        )
      }

      {/* ================== 수정 모달 ================== */}
      {
        isEditMode && (
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
        )
      }

      {/* ===========================
          ⭐ 프로필 수정 모달 
      =========================== */}
      {
        showProfileModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: 20,
                borderRadius: 12,
                width: 380,
              }}
            >
              <h3 style={{ marginBottom: 16 }}>프로필 수정</h3>

              {/* 닉네임 변경 */}
              <div style={{ marginBottom: 20 }}>
                <label>닉네임</label>
                <input
                  name="username"
                  value={profileForm.username}
                  onChange={onProfileChange}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    marginTop: 5,
                  }}
                />

                <button
                  onClick={handleUpdateNickname}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 8,
                    border: "none",
                    background: "#667eea",
                    color: "white",
                  }}
                >
                  닉네임 변경
                </button>
              </div>

              <hr style={{ margin: "20px 0" }} />

              {/* 비밀번호 변경 */}
              <div>
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={profileForm.currentPassword}
                  onChange={onProfileChange}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    marginTop: 5,
                  }}
                />

                <label style={{ marginTop: 10, display: "block" }}>새 비밀번호</label>
                <input
                  type="password"
                  name="newPassword"
                  value={profileForm.newPassword}
                  onChange={onProfileChange}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    marginTop: 5,
                  }}
                />

                <button
                  onClick={handleChangePassword}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 8,
                    border: "none",
                    background: "#28a745",
                    color: "white",
                  }}
                >
                  비밀번호 변경
                </button>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "white",
                }}
              >
                닫기
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}
