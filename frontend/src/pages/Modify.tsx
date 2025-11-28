import React, { useState } from "react";

export default function Modify() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleNicknameChange = async () => {
    const token = localStorage.getItem("token");
    await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });
    alert("닉네임 변경 완료!");
  };

  const handlePasswordChange = async () => {
    const token = localStorage.getItem("token");
    await fetch("/api/users/me/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: currentPassword,
        newPassword,
      }),
    });
    alert("비밀번호 변경 완료!");
  };

  return (
    <div>
      <h1>Modify Page</h1>
      <div>
        <h3>닉네임 변경</h3>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="새 닉네임"
        />
        <button onClick={handleNicknameChange}>닉네임 변경</button>
      </div>
      <div>
        <h3>비밀번호 변경</h3>
        <input
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          placeholder="현재 비밀번호"
        />
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="새 비밀번호"
        />
        <button onClick={handlePasswordChange}>비밀번호 변경</button>
      </div>
    </div>
  );
}