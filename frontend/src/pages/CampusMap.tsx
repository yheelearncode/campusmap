// window kakao 선언부, React import 유지
import React, { useEffect, useRef, useState } from "react";
import Button from 'react-bootstrap/Button';
import ToggleButton from "react-bootstrap/ToggleButton";
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import {ui_translations} from './constants/translations'

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
      style={{ top: '56px', height: 'calc(100vh - 56px)' } }
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

  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedDescription, setTranslatedDescription] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const [showSchedule, setShowSchedule] = useState(false);

  const userLang = (localStorage.getItem('language') as 'ko' | 'en' | 'mn') || 'ko';
  const t = ui_translations[userLang];

  // 로그아웃 함수
  const handleLogout = () => {
    if (confirm(t.main.logout_check)) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }
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

  // 번역
  useEffect(() => {
    if (eventDetails && eventDetails.description) {
      setIsTranslating(true);
      setTranslatedTitle("");
      setTranslatedDescription("");
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventDetails.title,
          description: eventDetails.description,
          targetLang: userLang,
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.translatedTitle) {
          setTranslatedTitle(data.translatedTitle);
        }
        if (data.translatedDescription) {
          setTranslatedDescription(data.translatedDescription);
        }
      })
      .catch(err => console.error("번역 실패: ", err))
      .finally(() => setIsTranslating(false));
    }
  }, [eventDetails, userLang]);

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
                display: flex;
                justify-content: center;
                align-items: center;
                width: 60px; height: 60px;
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

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("lat", String(newEventPosition.lat));
    formData.append("lon", String(newEventPosition.lon));
    formData.append("creatorId", "1");

    if (form.startsAt) formData.append("startsAt", form.startsAt);
    if (form.endsAt) formData.append("endsAt", form.endsAt);
    if (imageFile) formData.append("image", imageFile);

    const res = await fetch("/api/events", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("등록 실패");
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
      <NavBar name={localStorage.getItem("username")} />
      {/* <div
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
        <h2 style={{ margin: 0 }}>{t.main.title}</h2>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Button
            onClick={() => setIsAddMode(!isAddMode)}
            variant="primary"
          >
            {isAddMode ? t.main.cancel : t.main.add_event}
          </Button>

          <span>{localStorage.getItem("username") || "사용자"}님</span>

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
            {t.main.logout}
          </button>
        </div>
      </div> */}
      <ScheduleSidebar
        show={showSchedule}
        events={eventList} // eventList를 ScheduleSidebar에 전달
        handleClose={() => setShowSchedule(false)}
        onEventClick={handleEventClickInSidebar} // 이벤트 클릭 핸들러 전달
        t={t}
      />
      {/* 지도 */}
      <div ref={mapRef} style={{ width: "100%", flex: 1 }} />

      {/* 이벤트 추가 모드 안내 메시지 */}
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
          {t.main.add_guide}
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
            <h2 style={{ marginBottom: 16 }}>{t.add.title}</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input
                name="title"
                placeholder={t.add.title_placeholder}
                value={form.title}
                onChange={onFormChange}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />

              <textarea
                name="description"
                placeholder={t.add.description_placeholder}
                rows={4}
                value={form.description}
                onChange={onFormChange}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />

              <Form.Control type="file" accept="image/*" onChange={onImageChange} />

              <div style={{ display: "flex", gap: 10 }}>
                <input name="startsAt" type="datetime-local" value={form.startsAt} onChange={onFormChange} />
                <input name="endsAt" type="datetime-local" value={form.endsAt} onChange={onFormChange} />
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
            <h3>{isTranslating ? "" : translatedTitle}</h3>

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

            <p style={{ color: '#666' }}>
              {eventDetails.startsAt ? t.detail.from_prefix + new Date(eventDetails.startsAt).toLocaleString() + t.detail.from_suffix : ""} <br />
              {eventDetails.endsAt ? t.detail.to_prefix + new Date(eventDetails.endsAt).toLocaleString() + t.detail.to_suffix : ""}
            </p>


            <p>{isTranslating ? 'Translating...' : translatedDescription/*eventDetails.description*/}</p>

            <div style={{ margin: "10px 0" }}>
              <b>{t.detail.likes}: {eventDetails.likes ?? 0}</b>
            </div>

            <Button
              onClick={() => setEventDetails(null)}
              variant="outline-secondary"
            >
              {t.detail.close}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
