import React from 'react';
import { colors, spacing, borderRadius, typography, gradients, shadows } from '../../styles/design-tokens';
import { campusMapStyles, zIndex } from '../../styles/campus-map-styles';

interface EventFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    form: {
        title: string;
        description: string;
        startsAt: string;
        endsAt: string;
    };
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditMode: boolean;
    imageFile: File | null;
    t: any;
}

export default function EventFormModal({
    show,
    onClose,
    onSubmit,
    form,
    onFormChange,
    onImageChange,
    isEditMode,
    imageFile,
    t
}: EventFormModalProps) {
    if (!show) return null;

    return (
        <div style={{ ...campusMapStyles.modalOverlay, zIndex: zIndex.modalEdit }}>
            <div style={{
                background: colors.white,
                padding: spacing.xl,
                borderRadius: borderRadius.md,
                width: '450px',
                maxWidth: '90%',
                boxShadow: shadows.lg,
            }}>
                <h2 style={{
                    margin: `0 0 ${spacing.md} 0`,
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.textPrimary,
                    textAlign: 'center',
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    {isEditMode ? "이벤트 수정" : t.add.title}
                </h2>

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    {/* 제목 입력 */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: spacing.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                        }}>
                            제목 *
                        </label>
                        <input
                            name="title"
                            placeholder={isEditMode ? "제목" : t.add.title_placeholder}
                            value={form.title}
                            onChange={onFormChange}
                            required
                            style={{
                                width: '100%',
                                padding: spacing.md,
                                border: `2px solid ${colors.gray300}`,
                                borderRadius: borderRadius.md,
                                fontSize: typography.fontSize.md,
                                transition: 'all 0.2s ease',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                            onBlur={(e) => e.target.style.borderColor = colors.gray300}
                        />
                    </div>

                    {/* 설명 입력 */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: spacing.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                        }}>
                            내용 *
                        </label>
                        <textarea
                            name="description"
                            placeholder={isEditMode ? "내용" : t.add.description_placeholder}
                            value={form.description}
                            onChange={onFormChange}
                            required
                            rows={4}
                            style={{
                                width: '100%',
                                padding: spacing.md,
                                border: `2px solid ${colors.gray300}`,
                                borderRadius: borderRadius.md,
                                fontSize: typography.fontSize.md,
                                resize: 'vertical',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                                fontFamily: typography.fontFamily,
                            }}
                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                            onBlur={(e) => e.target.style.borderColor = colors.gray300}
                        />
                    </div>

                    {/* 이미지 업로드 */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: spacing.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                        }}>
                            {isEditMode ? "이미지 변경" : "이미지"}
                        </label>
                        <label style={{
                            display: 'block',
                            padding: spacing.lg,
                            border: `2px dashed ${colors.gray300}`,
                            borderRadius: borderRadius.md,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: colors.gray100,
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.background = colors.primaryLight + '20';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = colors.gray300;
                                e.currentTarget.style.background = colors.gray100;
                            }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                style={{ display: 'none' }}
                            />
                            <span style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                                {imageFile ? ` ${imageFile.name}` : (isEditMode ? '파일 선택' : '📁 파일 선택 또는 드래그')}
                            </span>
                        </label>
                    </div>

                    {/* 날짜 선택 */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: spacing.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.textSecondary,
                            fontSize: typography.fontSize.sm,
                        }}>
                            일정
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: spacing.xs,
                                    fontSize: typography.fontSize.xs,
                                    color: colors.textMuted,
                                }}>시작</label>
                                <input
                                    type="datetime-local"
                                    name="startsAt"
                                    value={form.startsAt}
                                    onChange={onFormChange}
                                    style={{
                                        width: '100%',
                                        padding: spacing.sm,
                                        border: `1px solid ${colors.gray300}`,
                                        borderRadius: borderRadius.md,
                                        fontSize: typography.fontSize.sm,
                                        outline: 'none',
                                        background: colors.white,
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: spacing.xs,
                                    fontSize: typography.fontSize.xs,
                                    color: colors.textMuted,
                                }}>종료</label>
                                <input
                                    type="datetime-local"
                                    name="endsAt"
                                    value={form.endsAt}
                                    onChange={onFormChange}
                                    style={{
                                        width: '100%',
                                        padding: spacing.sm,
                                        border: `1px solid ${colors.gray300}`,
                                        borderRadius: borderRadius.md,
                                        fontSize: typography.fontSize.sm,
                                        outline: 'none',
                                        background: colors.white,
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.md }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: `${spacing.md} ${spacing.xl}`,
                                border: `2px solid ${colors.gray300}`,
                                borderRadius: borderRadius.md,
                                background: colors.white,
                                color: colors.textSecondary,
                                fontSize: typography.fontSize.md,
                                fontWeight: typography.fontWeight.semibold,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = colors.gray100}
                            onMouseOut={(e) => e.currentTarget.style.background = colors.white}
                        >
                            {isEditMode ? "취소" : t.add.cancel}
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: `${spacing.md} ${spacing.xl}`,
                                border: 'none',
                                borderRadius: borderRadius.md,
                                background: gradients.primary,
                                color: colors.white,
                                fontSize: typography.fontSize.md,
                                fontWeight: typography.fontWeight.bold,
                                cursor: 'pointer',
                                boxShadow: shadows.primary,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = shadows.lg;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = shadows.primary;
                            }}
                        >
                            {isEditMode ? "수정 완료" : t.add.post}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
