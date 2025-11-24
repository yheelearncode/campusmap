import React, { useState } from "react";

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
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#667eea",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 28,
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          zIndex: 2000,
        }}
      >
        💬
      </div>

      {/* 채팅창 */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 320,
            height: 420,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              background: "#667eea",
              color: "white",
              padding: "12px 16px",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              fontWeight: "bold",
            }}
          >
            캠퍼스 챗봇
          </div>

          {/* 메시지 영역 */}
          <div
            style={{
              flex: 1,
              padding: 12,
              overflowY: "auto",
              background: "#f7f7fb",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  textAlign: m.role === "user" ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: m.role === "user" ? "#667eea" : "#ececec",
                    color: m.role === "user" ? "white" : "black",
                    maxWidth: "75%",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && <div style={{ fontSize: 12 }}>⏳ 답변 생성 중...</div>}
          </div>

          {/* 입력창 */}
          <div
            style={{
              borderTop: "1px solid #ddd",
              padding: 8,
              display: "flex",
              gap: 6,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지를 입력하세요"
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: "#667eea",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
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
