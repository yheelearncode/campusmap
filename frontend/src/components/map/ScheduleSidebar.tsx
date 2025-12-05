import React from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { EventDetail } from '../../types/mapTypes';

interface ScheduleSidebarProps {
    show: boolean;
    handleClose: () => void;
    events: EventDetail[];
    onEventClick: (event: EventDetail) => void;
    t: any;
}

export default function ScheduleSidebar({ show, handleClose, events, onEventClick, t }: ScheduleSidebarProps) {
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
    });

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            key="end"
            placement="end"
            name="end"
            scroll={true}
            backdrop={false}
            style={{ top: '56px', height: 'calc(100vh - 56px)' }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t.main.event}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {sortedEvents.length === 0 ? (
                    <p>이벤트가 없습니다.</p>
                ) : (
                    <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
                        {sortedEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => onEventClick(event)}
                                style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    backgroundColor: 'white',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f8f8')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                            >
                                <h5>{event.title}</h5>
                                <p style={{ fontSize: '0.9em', color: '#666' }}>
                                    {event.startsAt ? t.detail.from_prefix + new Date(event.startsAt).toLocaleString() + t.detail.from_suffix : t.detail.no_date}<br />
                                    {event.endsAt ? t.detail.to_prefix + new Date(event.endsAt).toLocaleString() + t.detail.to_suffix : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
}
