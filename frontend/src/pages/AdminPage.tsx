// src/pages/AdminPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}



export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);

  // 1. 사용자 목록, 대기 중인 이벤트 불러오기
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      if (userRole !== "ADMIN") {
        alert("관리자만 접근할 수 있습니다.");
        navigate("/map");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const userRes = await fetch("/api/admin/users", { headers });
        if (userRes.ok) {
            setUsers(await userRes.json());
        }
        
        const eventRes = await fetch("/api/admin/events/pending", { headers });
        if (eventRes.ok) {
          setPendingEvents(await eventRes.json());
        }

      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };

    fetchUsers();
  }, [navigate]);

  // 2. 권한 변경 핸들러
  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem("token");
    if (!confirm(`해당 사용자의 권한을 ${newRole}로 변경하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        alert("권한이 변경되었습니다.");
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("권한 변경 실패");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // 3. 이벤트 승인 핸들러
  const handleApproveEvent = async (eventId: number) => {
    const token = localStorage.getItem("token");
    if (!confirm("이 이벤트를 승인하시겠습니까? (지도에 공개됩니다)")) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("이벤트가 승인되었습니다!");
        setPendingEvents(pendingEvents.filter((e) => e.id !== eventId));
      } else {
        alert("승인 실패");
      }
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  return (
    <div 
      style={{ 
        width: "100vw", 
        minHeight: "100vh", 
        background: "#f4f6f8", 
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box" 
      }}
    >
      
      <div 
        style={{ 
          width: "100%", 
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "50px"
        }}
      >
        
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "#333", fontSize: "28px" }}>👮‍♂️ 관리자 페이지</h2>
          <button
            onClick={() => navigate("/map")}
            style={{
              padding: "12px 24px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 4px 10px rgba(102, 126, 234, 0.3)"
            }}
          >
            지도로 돌아가기
          </button>
        </div>

        {/* 섹션 1: 회원 권한 관리 */}
        <div>
          <h3 style={{ margin: "0 0 20px 0", color: "#444", fontSize: "20px", borderLeft: "5px solid #667eea", paddingLeft: "15px" }}>
            👥 회원 리스트 및 권한 관리
          </h3>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", textAlign: "left", color: "#555" }}>
                <th style={{ padding: "16px", borderBottom: "2px solid #ddd", width: "10%" }}>ID</th>
                <th style={{ padding: "16px", borderBottom: "2px solid #ddd", width: "20%" }}>이름</th>
                <th style={{ padding: "16px", borderBottom: "2px solid #ddd", width: "30%" }}>이메일</th>
                <th style={{ padding: "16px", borderBottom: "2px solid #ddd", width: "20%" }}>현재 권한</th>
                <th style={{ padding: "16px", borderBottom: "2px solid #ddd", width: "20%" }}>권한 변경</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "16px" }}>{user.id}</td>
                  <td style={{ padding: "16px", fontWeight: "600" }}>{user.username}</td>
                  <td style={{ padding: "16px", color: "#666" }}>{user.email}</td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "white",
                        background:
                          user.role === "ADMIN" ? "#ff6b6b" : user.role === "STAFF" ? "#fca311" : "#28a745",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer", fontSize: "14px" }}
                    >
                      <option value="USER">USER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 섹션 2: 승인 대기 목록 */}
        <div>
          <h3 style={{ margin: "0 0 20px 0", color: "#444", fontSize: "20px", borderLeft: "5px solid #fca311", paddingLeft: "15px" }}>
            ⏳ 승인 대기 중인 이벤트 ({pendingEvents.length}건)
          </h3>

          {pendingEvents.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", background: "#f9f9f9", borderRadius: "12px", color: "#999", fontSize: "18px" }}>
              현재 승인 대기 중인 이벤트가 없습니다.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    background: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    padding: "25px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    boxSizing: "border-box",
                    transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div>
                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                       <span style={{ fontSize: "12px", background: "#eee", padding: "4px 8px", borderRadius: "4px", color: "#555"}}>ID: {event.id}</span>
                       <span style={{ fontSize: "12px", color: "#888"}}>{new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "20px", color: "#333" }}>{event.title}</h4>
                    <p style={{ margin: 0, color: "#666", fontSize: "15px", lineHeight: "1.6" }}>
                      <span style={{ fontWeight: "bold", color: "#667eea" }}>{event.creatorName}</span>님이 작성
                    </p>
                    <p style={{ margin: "10px 0 20px 0", color: "#888", fontSize: "14px", height: "40px", overflow: "hidden" }}>
                      {event.description.length > 60 ? event.description.substring(0, 60) + "..." : event.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleApproveEvent(event.id)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      transition: "background 0.2s",
                    }}
                  >
                    ✅ 승인하기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}