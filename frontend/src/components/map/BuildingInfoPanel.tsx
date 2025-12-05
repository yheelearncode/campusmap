import React from 'react';
import { BuildingData } from '../../types/mapTypes';

interface BuildingInfoPanelProps {
    show: boolean;
    building: BuildingData | null;
    onClose: () => void;
    selectedFloor: string | null;
    onFloorClick: (floor: string) => void;
}

export default function BuildingInfoPanel({
    show,
    building,
    onClose,
    selectedFloor,
    onFloorClick
}: BuildingInfoPanelProps) {
    if (!show || !building) return null;

    return (
        <div style={{
            position: "fixed",
            top: "70px",
            right: "20px",
            width: "320px",
            height: "80vh",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            zIndex: 9999,
            padding: "20px",
            overflowY: "auto",
        }}>
            {/* 헤더 */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
            }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{building.name} 층 안내</h3>

                <button
                    onClick={onClose}
                    style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "22px",
                        cursor: "pointer",
                        color: "#64748b"
                    }}
                >
                    ✕
                </button>
            </div>

            {/* 층 리스트 */}
            {building.floors && building.floors.map(floor => (
                <div key={floor} style={{
                    marginBottom: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}>
                    {/* 층 제목 (아코디언 버튼) */}
                    <div
                        onClick={() => onFloorClick(floor)}
                        style={{
                            padding: "12px",
                            background: "#f1f5f9",
                            display: "flex",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#334155"
                        }}
                    >
                        {floor}
                        <span>{selectedFloor === floor ? "▲" : "▼"}</span>
                    </div>

                    {/* 펼쳐지는 내용 */}
                    {selectedFloor === floor && (
                        <div style={{
                            padding: "12px",
                            background: "white",
                            fontSize: "14px",
                            color: "#475569",
                            lineHeight: "1.6",
                            borderTop: "1px solid #e2e8f0",
                        }}>
                            {building.floorInfo && building.floorInfo[floor] ? building.floorInfo[floor] : "상세 정보가 없습니다."}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
