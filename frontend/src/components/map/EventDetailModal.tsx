import React, { useState } from 'react';
import { colors, spacing, borderRadius, typography, gradients, shadows } from '../../styles/design-tokens';
import { campusMapStyles, zIndex } from '../../styles/campus-map-styles';
import { EventDetail, Comment } from '../../types/mapTypes';

interface EventDetailModalProps {
    event: EventDetail | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    currentUser: { id: string; name: string; role: string } | null;
    comments: Comment[];
    onAddComment: (content: string) => void;
    onDeleteComment: (id: number) => void;
    t: any;
    isTranslating: boolean;
    translatedTitle: string;
    translatedDescription: string;
}

export default function EventDetailModal({
    event,
    onClose,
    onEdit,
    onDelete,
    currentUser,
    comments,
    onAddComment,
    onDeleteComment,
    t,
    isTranslating,
    translatedTitle,
    translatedDescription
}: EventDetailModalProps) {
    const [comment, setComment] = useState("");

    if (!event) return null;

    const canEditOrDelete = () => {
        if (!currentUser) return false;
        const isOwner = event.creatorName === currentUser.name;
        const isAdmin = currentUser.role === "ADMIN";
        return isOwner || isAdmin;
    };

    const handleAddCommentClick = () => {
        if (comment.trim()) {
            onAddComment(comment);
            setComment("");
        }
    };

    return (
        <div style={{ ...campusMapStyles.modalOverlay, zIndex: zIndex.modalDetail }}>
            <div style={{
                background: colors.white,
                padding: spacing.xxxl,
                borderRadius: borderRadius.lg,
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: shadows.xl,
            }}>
                {/* 제목 */}
                <h3 style={{
                    margin: `0 0 ${spacing.md} 0`,
                    fontSize: typography.fontSize.xxl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.textPrimary,
                    lineHeight: 1.4,
                }}>
                    {isTranslating ? "번역 중..." : translatedTitle}
                </h3>

                {/* 이미지 */}
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        style={{
                            width: '100%',
                            borderRadius: borderRadius.md,
                            marginBottom: spacing.md,
                            objectFit: 'cover',
                            maxHeight: '300px',
                        }}
                        alt={event.title}
                    />
                )}

                {/* 날짜 정보 */}
                {(event.startsAt || event.endsAt) && (
                    <div style={{
                        background: colors.gray100,
                        padding: spacing.md,
                        borderRadius: borderRadius.md,
                        marginBottom: spacing.md,
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary,
                        lineHeight: 1.6,
                    }}>
                        {event.startsAt && (
                            <div>{t.detail.from_prefix}{new Date(event.startsAt).toLocaleString()}{t.detail.from_suffix}</div>
                        )}
                        {event.endsAt && (
                            <div>{t.detail.to_prefix}{new Date(event.endsAt).toLocaleString()}{t.detail.to_suffix}</div>
                        )}
                    </div>
                )}

                {/* 설명 */}
                <p style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.md,
                    lineHeight: 1.6,
                    marginBottom: spacing.md,
                    whiteSpace: 'pre-wrap',
                }}>
                    {isTranslating ? '번역 중...' : translatedDescription}
                </p>

                {/* 작성자 */}
                <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginBottom: spacing.md,
                }}>
                    작성자: <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>{event.creatorName || "정보 없음"}</span>
                </div>

                {/* 길찾기 버튼 */}
                {event.lat && event.lon && (
                    <button
                        onClick={() => {
                            const url = `https://map.kakao.com/link/to/${encodeURIComponent(event.title)},${event.lat},${event.lon}`;
                            window.open(url, '_blank');
                        }}
                        style={{
                            width: '100%',
                            padding: spacing.md,
                            border: 'none',
                            borderRadius: borderRadius.md,
                            background: '#FEE500',
                            color: '#000000',
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginBottom: spacing.lg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: spacing.sm,
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#FDD835'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#FEE500'}
                    >
                        로 길찾기
                    </button>
                )}

                {/* 수정/삭제 버튼 */}
                {canEditOrDelete() && (
                    <div style={{
                        display: 'flex',
                        gap: spacing.sm,
                        marginBottom: spacing.lg,
                    }}>
                        <button
                            onClick={onEdit}
                            style={{
                                flex: 1,
                                padding: `${spacing.sm} ${spacing.md}`,
                                border: `1px solid ${colors.primary}`,
                                borderRadius: borderRadius.md,
                                background: colors.white,
                                color: colors.primary,
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = colors.primary;
                                e.currentTarget.style.color = colors.white;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = colors.white;
                                e.currentTarget.style.color = colors.primary;
                            }}
                        >
                            수정
                        </button>

                        <button
                            onClick={onDelete}
                            style={{
                                flex: 1,
                                padding: `${spacing.sm} ${spacing.md}`,
                                border: `1px solid ${colors.danger}`,
                                borderRadius: borderRadius.md,
                                background: colors.white,
                                color: colors.danger,
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = colors.danger;
                                e.currentTarget.style.color = colors.white;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = colors.white;
                                e.currentTarget.style.color = colors.danger;
                            }}
                        >
                            삭제
                        </button>
                    </div>
                )}

                {/* 구분선 */}
                <div style={{
                    height: '1px',
                    background: colors.gray200,
                    margin: `${spacing.md} 0`,
                }} />

                {/* 댓글 섹션 */}
                <div>
                    <h5 style={{
                        margin: `0 0 ${spacing.md} 0`,
                        fontSize: typography.fontSize.md,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.textPrimary,
                    }}>
                        댓글 ({comments.length})
                    </h5>

                    {/* 댓글 목록 */}
                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginBottom: spacing.md,
                    }}>
                        {comments.length === 0 ? (
                            <div style={{
                                padding: spacing.lg,
                                textAlign: 'center',
                                color: colors.textMuted,
                                fontSize: typography.fontSize.sm,
                                background: colors.gray100,
                                borderRadius: borderRadius.md,
                            }}>
                                첫 댓글을 남겨보세요
                            </div>
                        ) : (
                            comments.map((c) => (
                                <div
                                    key={c.id}
                                    style={{
                                        padding: spacing.md,
                                        borderBottom: `1px solid ${colors.gray200}`,
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: spacing.xs,
                                    }}>
                                        <div>
                                            <span style={{
                                                fontWeight: typography.fontWeight.semibold,
                                                fontSize: typography.fontSize.sm,
                                                color: colors.textPrimary,
                                            }}>
                                                {c.userName}
                                            </span>
                                            <span style={{
                                                marginLeft: spacing.sm,
                                                fontSize: typography.fontSize.xs,
                                                color: colors.textMuted,
                                            }}>
                                                {new Date(c.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {c.isMine && (
                                            <button
                                                onClick={() => onDeleteComment(c.id)}
                                                style={{
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: colors.danger,
                                                    fontSize: typography.fontSize.xs,
                                                    cursor: 'pointer',
                                                    padding: spacing.xs,
                                                }}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: typography.fontSize.sm,
                                        color: colors.textPrimary,
                                        lineHeight: 1.5,
                                    }}>
                                        {c.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* 댓글 입력 */}
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                        <input
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            style={{
                                flex: 1,
                                padding: spacing.sm,
                                border: `1px solid ${colors.gray300}`,
                                borderRadius: borderRadius.md,
                                fontSize: typography.fontSize.sm,
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                            onBlur={(e) => e.target.style.borderColor = colors.gray300}
                            onKeyDown={(e) => e.key === "Enter" && handleAddCommentClick()}
                        />
                        <button
                            onClick={handleAddCommentClick}
                            style={{
                                padding: `${spacing.sm} ${spacing.lg}`,
                                border: 'none',
                                borderRadius: borderRadius.md,
                                background: colors.primary,
                                color: colors.white,
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            등록
                        </button>
                    </div>
                </div>

                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        marginTop: spacing.lg,
                        padding: spacing.sm,
                        border: `1px solid ${colors.gray300}`,
                        borderRadius: borderRadius.md,
                        background: colors.white,
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = colors.gray100}
                    onMouseOut={(e) => e.currentTarget.style.background = colors.white}
                >
                    {t.detail.close}
                </button>
            </div>
        </div>
    );
}
