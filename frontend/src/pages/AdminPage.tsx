// src/pages/AdminPage.tsx

import React, { useEffect, useState } from "react";
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

  // 1. 사용자 목록 불러오기
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      // 관리자가 아니면 접근 차단
      if (userRole !== "ADMIN") {
        alert("관리자만 접근할 수 있습니다.");
        navigate("/map");
        return;
      }

      try {
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          alert("데이터를 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
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
        // 화면 목록 업데이트
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("권한 변경 실패");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>👮‍♂️ 관리자 페이지 (회원 관리)</h2>
        <button onClick={() => navigate("/map")} style={{ padding: "8px 16px", cursor: "pointer" }}>
          지도로 돌아가기
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>이름</th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>이메일</th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>현재 권한</th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>권한 변경</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{user.id}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{user.username}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{user.email}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                    background: user.role === "ADMIN" ? "#ff6b6b" : user.role === "STAFF" ? "#fca311" : "#28a745",
                  }}
                >
                  {user.role}
                </span>
              </td>
              <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
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
  );
}