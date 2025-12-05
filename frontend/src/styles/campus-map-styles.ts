// CampusMap specific styles using design tokens
import { colors, gradients, spacing, borderRadius, shadows, typography, commonStyles } from './design-tokens';

export const campusMapStyles = {
    // Modal styles
    modalOverlay: {
        position: 'fixed' as const,
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        background: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.lg,
    },

    modalContentSmall: {
        background: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        width: '400px',
        maxWidth: '90%',
    },

    modalContentLarge: {
        background: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        width: '90%',
        maxWidth: '550px',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
    },

    // Form styles
    formContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: spacing.md,
    },

    input: {
        ...commonStyles.input,
        fontSize: typography.fontSize.sm,
    },

    textarea: {
        ...commonStyles.input,
        fontSize: typography.fontSize.sm,
        resize: 'vertical' as const,
        minHeight: '100px',
    },

    // Button styles
    buttonPrimary: {
        ...commonStyles.button.primary,
    },

    buttonSecondary: {
        ...commonStyles.button.secondary,
    },

    buttonDanger: {
        ...commonStyles.button.danger,
    },

    buttonSuccess: {
        ...commonStyles.button.success,
    },

    // Comment section
    commentSection: {
        background: colors.gray100,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },

    commentInput: {
        flex: 1,
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        border: `1px solid ${colors.gray300}`,
        fontSize: typography.fontSize.sm,
    },

    // Event detail styles
    eventImage: {
        width: '100%',
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        objectFit: 'cover' as const,
    },

    eventTitle: {
        margin: `0 0 ${spacing.md} 0`,
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },

    eventDescription: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.md,
        lineHeight: '1.6',
        marginBottom: spacing.md,
    },

    // Label styles
    label: {
        display: 'block',
        marginBottom: spacing.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
    },

    // Divider
    divider: {
        margin: `${spacing.lg} 0`,
        border: 'none',
        borderTop: `1px solid ${colors.gray300}`,
    },

    // Add mode guide
    addModeGuide: {
        position: 'fixed' as const,
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: gradients.primary,
        color: colors.white,
        padding: `${spacing.md} ${spacing.xxl}`,
        borderRadius: borderRadius.md,
        boxShadow: shadows.md,
        zIndex: 700,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
    },

    // Like button
    likeButton: {
        background: 'none',
        border: `1px solid ${colors.danger}`,
        color: colors.danger,
        borderRadius: borderRadius.round,
        width: 32,
        height: 32,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        paddingBottom: 2,
        transition: 'all 0.2s ease',
    },

    // Button group
    buttonGroup: {
        display: 'flex',
        gap: spacing.sm,
        justifyContent: 'flex-end',
        marginTop: spacing.lg,
    },

    buttonGroupCenter: {
        display: 'flex',
        gap: spacing.sm,
        justifyContent: 'center',
        marginTop: spacing.lg,
    },
};

// Z-index layers
export const zIndex = {
    chatWidget: 2000,
    addModeGuide: 700,
    modalEdit: 2500,
    modalDetail: 3000,
    modalProfile: 5000,
};
