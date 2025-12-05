import React from 'react';
import { colors, spacing, borderRadius, typography, gradients, shadows } from '../../styles/design-tokens';
import { BuildingData } from '../../types/mapTypes';

interface BuildingListSidebarProps {
    activeTab: string;
    buildings: BuildingData[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onBuildingClick: (building: BuildingData) => void;
}

export default function BuildingListSidebar({
    activeTab,
    buildings,
    searchQuery,
    onSearchChange,
    onBuildingClick
}: BuildingListSidebarProps) {
    if (activeTab !== 'building') return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '320px',
            height: '100vh',
            background: colors.white,
            boxShadow: shadows.lg,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* 헤더 */}
            <div style={{
                padding: spacing.lg,
                borderBottom: '1px solid #e5e7eb',
                background: gradients.primary,
            }}>
                <h3 style={{
                    margin: 0,
                    color: colors.white,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                }}>
                    건물/공간정보
                </h3>
            </div>

            {/* 검색창 */}
            <div style={{
                padding: spacing.md,
                borderBottom: '1px solid #e5e7eb',
            }}>
                <input
                    type="text"
                    placeholder="건물명 검색..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: spacing.sm,
                        border: '1px solid #cbd5e1',
                        borderRadius: borderRadius.sm,
                        fontSize: typography.fontSize.sm,
                    }}
                />
            </div>

            {/* 건물 목록 */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: spacing.sm,
            }}>
                {buildings
                    .filter(building =>
                        building.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((building, index) => (
                        <div
                            key={index}
                            onClick={() => onBuildingClick(building)}
                            style={{
                                padding: spacing.md,
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing.sm,
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#f1f5f9';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <span style={{
                                fontSize: '18px',
                                color: colors.primary,
                            }}>
                                📍
                            </span>
                            <span style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                color: '#1e293b',
                            }}>
                                {building.name}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
}
