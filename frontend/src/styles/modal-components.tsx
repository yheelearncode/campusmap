// Modal component helpers
import React from 'react';
import { colors, spacing, borderRadius, shadows, typography, commonStyles } from './design-tokens';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
    zIndex?: number;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '550px', zIndex = 3000 }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: colors.white,
                    padding: spacing.xl,
                    borderRadius: borderRadius.lg,
                    boxShadow: shadows.lg,
                    maxWidth,
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{
                    margin: `0 0 ${spacing.lg} 0`,
                    fontSize: typography.fontSize.xxl,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                }}>
                    {title}
                </h3>
                {children}
            </div>
        </div>
    );
}

interface FormGroupProps {
    label: string;
    children: React.ReactNode;
}

export function FormGroup({ label, children }: FormGroupProps) {
    return (
        <div style={{ marginBottom: spacing.md }}>
            <label style={{
                display: 'block',
                marginBottom: spacing.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.textSecondary,
                fontSize: typography.fontSize.sm,
            }}>
                {label}
            </label>
            {children}
        </div>
    );
}

interface ButtonGroupProps {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
}

export function ButtonGroup({ children, align = 'right' }: ButtonGroupProps) {
    return (
        <div style={{
            display: 'flex',
            gap: spacing.sm,
            justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end',
            marginTop: spacing.lg,
        }}>
            {children}
        </div>
    );
}

export const modalStyles = {
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
    button: {
        primary: commonStyles.button.primary,
        secondary: commonStyles.button.secondary,
        danger: commonStyles.button.danger,
        success: commonStyles.button.success,
    },
};
