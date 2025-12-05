// Design Tokens - 모던하고 세련된 디자인 시스템
export const colors = {
    // Primary Colors - 더 생동감 있는 보라/파랑 그라데이션
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',

    // Secondary Colors - 따뜻한 오렌지
    secondary: '#f59e0b',
    secondaryDark: '#d97706',

    // Status Colors - 더 선명한 색상
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Neutral Colors - 더 부드러운 회색
    white: '#ffffff',
    black: '#0f172a',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray300: '#cbd5e1',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1e293b',
    gray900: '#0f172a',

    // Text Colors - 더 선명한 대비
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textLight: '#cbd5e1',
};

export const gradients = {
    primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryDark} 100%)`,
    vibrant: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
};

export const spacing = {
    xs: '6px',
    sm: '10px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '32px',
    xxxl: '40px',
    huge: '48px',
};

export const borderRadius = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    round: '50%',
    pill: '9999px',
};

export const shadows = {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
    md: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
    xl: '0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.04)',
    primary: '0 4px 14px rgba(99, 102, 241, 0.4)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
};

export const typography = {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Inter', sans-serif`,
    fontSize: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        xxl: '24px',
        xxxl: '28px',
        huge: '32px',
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
};

export const transitions = {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
};

// Common Component Styles
export const commonStyles = {
    button: {
        primary: {
            background: gradients.primary,
            color: colors.white,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.md} ${spacing.xl}`,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: shadows.primary,
            letterSpacing: '0.3px',
        },
        secondary: {
            background: colors.white,
            color: colors.textPrimary,
            border: `2px solid ${colors.gray300}`,
            borderRadius: borderRadius.md,
            padding: `${spacing.md} ${spacing.xl}`,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        danger: {
            background: colors.danger,
            color: colors.white,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.md} ${spacing.xl}`,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
        },
        success: {
            background: colors.success,
            color: colors.white,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.md} ${spacing.xl}`,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
        },
    },
    input: {
        width: '100%',
        padding: spacing.md,
        border: `2px solid ${colors.gray300}`,
        borderRadius: borderRadius.md,
        fontSize: typography.fontSize.sm,
        boxSizing: 'border-box' as const,
        transition: transitions.fast,
    },
    modal: {
        overlay: {
            position: 'fixed' as const,
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(4px)',
        },
        content: {
            background: colors.white,
            padding: spacing.xl,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.xl,
            maxWidth: '550px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
        },
    },
    card: {
        background: colors.white,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md,
        padding: spacing.xl,
        transition: transitions.normal,
    },
};
