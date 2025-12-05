import React from 'react';
import { useSearchParams } from 'react-router-dom';

const NavigationPage: React.FC = () => {
    const [searchParams] = useSearchParams();

    const targetLat = searchParams.get('lat');
    const targetLon = searchParams.get('lon');
    const targetTitle = searchParams.get('title') || '목적지';

    // Kakao Map directions URL
    const kakaoMapUrl = targetLat && targetLon
        ? `https://map.kakao.com/link/to/${encodeURIComponent(targetTitle)},${targetLat},${targetLon}`
        : 'https://map.kakao.com';

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Kakao Map iframe */}
            <iframe
                src={kakaoMapUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                title="Kakao Map Navigation"
            />

            {/* Fallback message if iframe is blocked */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center',
                pointerEvents: 'none',
                opacity: 0.9
            }}>
                <p>카카오맵이 로드되지 않으면 아래 링크를 클릭하세요:</p>
                <a
                    href={kakaoMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        pointerEvents: 'all',
                        color: '#667eea',
                        fontWeight: 'bold',
                        textDecoration: 'none'
                    }}
                >
                    카카오맵에서 열기 →
                </a>
            </div>
        </div>
    );
};

export default NavigationPage;
