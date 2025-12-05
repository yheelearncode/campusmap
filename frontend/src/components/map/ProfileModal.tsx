import React from 'react';
import { campusMapStyles, zIndex } from '../../styles/campus-map-styles';

interface ProfileModalProps {
    show: boolean;
    onClose: () => void;
    form: {
        username: string;
        currentPassword?: string;
        newPassword?: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpdateNickname: () => void;
    onUpdatePassword: () => void;
}

export default function ProfileModal({
    show,
    onClose,
    form,
    onChange,
    onUpdateNickname,
    onUpdatePassword
}: ProfileModalProps) {
    if (!show) return null;

    return (
        <div style={{ ...campusMapStyles.modalOverlay, zIndex: zIndex.modalProfile }}>
            <div style={{ ...campusMapStyles.modalContentSmall, width: '380px' }}>
                <h3 style={{ marginBottom: 16 }}>프로필 수정</h3>

                {/* 닉네임 변경 */}
                <div style={{ marginBottom: 20 }}>
                    <label>닉네임</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            marginTop: 5,
                        }}
                    />

                    <button
                        onClick={onUpdateNickname}
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
                        value={form.currentPassword || ""}
                        onChange={onChange}
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
                        value={form.newPassword || ""}
                        onChange={onChange}
                        style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            marginTop: 5,
                        }}
                    />

                    <button
                        onClick={onUpdatePassword}
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
                    onClick={onClose}
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
        </div >
    );
}
