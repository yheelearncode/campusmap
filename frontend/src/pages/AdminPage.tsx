// src/pages/AdminPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, spacing, borderRadius, shadows, typography, commonStyles } from '../styles/design-tokens';

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return colors.danger;
      case "STAFF": return colors.secondary;
      default: return colors.success;
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: colors.gray100,
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: spacing.huge,
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          background: colors.white,
          borderRadius: borderRadius.xl,
          boxShadow: shadows.md,
          padding: spacing.huge,
          display: "flex",
          flexDirection: "column",
          gap: spacing.xxxl,
        }}
      >

        {/* 헤더 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${colors.gray200}`,
          paddingBottom: spacing.xl
        }}>
          <h2 style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: typography.fontSize.xxxl,
            fontWeight: typography.fontWeight.semibold,
          }}>
            👮‍♂️ 관리자 페이지
          </h2>
          <button
            onClick={() => navigate("/map")}
            style={{
              ...commonStyles.button.primary,
              fontSize: typography.fontSize.md,
            }}
          >
            지도로 돌아가기
          </button>
        </div>

        {/* 섹션 1: 회원 권한 관리 */}
        <div>
          <h3 style={{
            margin: `0 0 ${spacing.xl} 0`,
            color: colors.textPrimary,
            fontSize: typography.fontSize.xl,
            borderLeft: `5px solid ${colors.primary}`,
            paddingLeft: spacing.lg,
            fontWeight: typography.fontWeight.semibold,
          }}>
            👥 회원 리스트 및 권한 관리
          </h3>

          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: typography.fontSize.md
          }}>
            <thead>
              <tr style={{
                background: colors.gray100,
                textAlign: "left",
                color: colors.textSecondary
              }}>
                <th style={{
                  padding: spacing.lg,
                  borderBottom: `2px solid ${colors.gray300}`,
                  width: "10%"
                }}>ID</th>
                <th style={{
                  padding: spacing.lg,
                  borderBottom: `2px solid ${colors.gray300}`,
                  width: "20%"
                }}>이름</th>
                <th style={{
                  padding: spacing.lg,
                  borderBottom: `2px solid ${colors.gray300}`,
                  width: "30%"
                }}>이메일</th>
                <th style={{
                  padding: spacing.lg,
                  borderBottom: `2px solid ${colors.gray300}`,
                  width: "20%"
                }}>현재 권한</th>
                <th style={{
                  padding: spacing.lg,
                  borderBottom: `2px solid ${colors.gray300}`,
                  width: "20%"
                }}>권한 변경</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${colors.gray200}` }}>
                  <td style={{ padding: spacing.lg }}>{user.id}</td>
                  <td style={{
                    padding: spacing.lg,
                    fontWeight: typography.fontWeight.semibold
                  }}>{user.username}</td>
                  <td style={{
                    padding: spacing.lg,
                    color: colors.textSecondary
                  }}>{user.email}</td>
                  <td style={{ padding: spacing.lg }}>
                    <span
                      style={{
                        padding: `${spacing.xs} ${spacing.md}`,
                        borderRadius: borderRadius.pill,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.white,
                        background: getRoleBadgeColor(user.role),
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: spacing.lg }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{
                        padding: spacing.sm,
                        borderRadius: borderRadius.sm,
                        border: `1px solid ${colors.gray300}`,
                        cursor: "pointer",
                        fontSize: typography.fontSize.sm
                      }}
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
          <h3 style={{
            margin: `0 0 ${spacing.xl} 0`,
            color: colors.textPrimary,
            fontSize: typography.fontSize.xl,
            borderLeft: `5px solid ${colors.secondary}`,
            paddingLeft: spacing.lg,
            fontWeight: typography.fontWeight.semibold,
          }}>
            ⏳ 승인 대기 중인 이벤트 ({pendingEvents.length}건)
          </h3>

          {pendingEvents.length === 0 ? (
            <div style={{
              padding: spacing.huge,
              textAlign: "center",
              background: colors.gray100,
              borderRadius: borderRadius.lg,
              color: colors.textMuted,
              fontSize: typography.fontSize.lg
            }}>
              현재 승인 대기 중인 이벤트가 없습니다.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: spacing.xl
            }}>
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    ...commonStyles.card,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    border: `1px solid ${colors.gray200}`,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: spacing.sm
                    }}>
                      <span style={{
                        fontSize: typography.fontSize.xs,
                        background: colors.gray200,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.sm,
                        color: colors.textSecondary
                      }}>
                        ID: {event.id}
                      </span>
                      <span style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.textMuted
                      }}>
                        {new Date(event.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{
                      margin: `0 0 ${spacing.sm} 0`,
                      fontSize: typography.fontSize.xl,
                      color: colors.textPrimary,
                      fontWeight: typography.fontWeight.semibold,
                    }}>
                      {event.title}
                    </h4>
                    <p style={{
                      margin: 0,
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.md,
                      lineHeight: "1.6"
                    }}>
                      <span style={{
                        fontWeight: typography.fontWeight.bold,
                        color: colors.primary
                      }}>
                        {event.creatorName}
                      </span>님이 작성
                    </p>
                    <p style={{
                      margin: `${spacing.sm} 0 ${spacing.lg} 0`,
                      color: colors.textMuted,
                      fontSize: typography.fontSize.sm,
                      height: "40px",
                      overflow: "hidden"
                    }}>
                      {event.description.length > 60 ? event.description.substring(0, 60) + "..." : event.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApproveEvent(event.id)}
                    style={{
                      ...commonStyles.button.success,
                      width: "100%",
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