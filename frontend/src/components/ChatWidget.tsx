import { useState } from "react";
import { colors, gradients, spacing, borderRadius, shadows, typography } from '../styles/design-tokens';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();

      const botMsg = { role: "bot", text: data.answer || "(응답 없음)" };
      setMessages((prev) => [...prev, botMsg]);

    } catch (e) {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠ 서버 오류" }]);
    }

    setLoading(false);
  };

  return (
    <div>
      {/* 아이콘(오른쪽 아래) */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: spacing.xl,
          right: spacing.xl,
          width: 60,
          height: 60,
          borderRadius: borderRadius.round,
          background: gradients.primary,
          color: colors.white,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: typography.fontSize.xxxl,
          cursor: "pointer",
          boxShadow: shadows.lg,
          zIndex: 2000,
          transition: 'transform 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </div>

      {/* 채팅창 */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: spacing.xl,
            width: 320,
            height: 420,
            background: colors.white,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.xl,
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              background: gradients.primary,
              color: colors.white,
              padding: `${spacing.md} ${spacing.lg}`,
              borderTopLeftRadius: borderRadius.lg,
              borderTopRightRadius: borderRadius.lg,
              fontWeight: typography.fontWeight.bold,
              fontSize: typography.fontSize.md,
            }}
          >
            캠퍼스 챗봇
          </div>

          {/* 메시지 영역 */}
          <div
            style={{
              flex: 1,
              padding: spacing.md,
              overflowY: "auto",
              background: colors.gray100,
            }}
          >
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: colors.textMuted,
                fontSize: typography.fontSize.sm,
                marginTop: spacing.xl,
              }}>
                무엇이든 물어보세요!
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: spacing.sm,
                  textAlign: m.role === "user" ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: spacing.sm,
                    background: m.role === "user" ? gradients.primary : colors.white,
                    color: m.role === "user" ? colors.white : colors.textPrimary,
                    maxWidth: "75%",
                    boxShadow: shadows.sm,
                    fontSize: typography.fontSize.sm,
                    lineHeight: '1.4',
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.textMuted,
                fontStyle: 'italic',
              }}>
                ⏳ 답변 생성 중...
              </div>
            )}
          </div>

          {/* 입력창 */}
          <div
            style={{
              borderTop: `1px solid ${colors.gray300}`,
              padding: spacing.sm,
              display: "flex",
              gap: spacing.xs,
              background: colors.white,
              borderBottomLeftRadius: borderRadius.lg,
              borderBottomRightRadius: borderRadius.lg,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지를 입력하세요"
              style={{
                flex: 1,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: borderRadius.sm,
                border: `1px solid ${colors.gray300}`,
                fontSize: typography.fontSize.sm,
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: gradients.primary,
                color: colors.white,
                border: "none",
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: borderRadius.sm,
                cursor: "pointer",
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.sm,
              }}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
