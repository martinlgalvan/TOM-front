import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

export default function FloatingToolPanel({
  id,
  title,
  position,
  locked,
  zIndex,
  onActivate,
  onPositionChange,
  children,
  className = '',
}) {
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [draftPosition, setDraftPosition] = useState(position);

  useEffect(() => setDraftPosition(position), [position.x, position.y]);

  useEffect(() => {
    const keepInsideViewport = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      setDraftPosition((current) => ({
        x: clamp(current.x, 8, window.innerWidth - rect.width - 8),
        y: clamp(current.y, 56, window.innerHeight - Math.min(rect.height, 80) - 8),
      }));
    };
    keepInsideViewport();
    window.addEventListener('resize', keepInsideViewport);
    return () => window.removeEventListener('resize', keepInsideViewport);
  }, [collapsed]);

  const finishDrag = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', finishDrag);
    onPositionChange(id, drag.latest);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;

    const rect = panel.getBoundingClientRect();
    const next = {
      x: clamp(event.clientX - drag.offsetX, 8, window.innerWidth - rect.width - 8),
      y: clamp(event.clientY - drag.offsetY, 56, window.innerHeight - Math.min(rect.height, 80) - 8),
    };
    drag.latest = next;
    setDraftPosition(next);
  };

  const startDrag = (event) => {
    if (locked || event.button !== 0) return;
    const rect = panelRef.current.getBoundingClientRect();
    onActivate(id);
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      latest: draftPosition,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    event.preventDefault();
  };

  useEffect(() => () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', finishDrag);
  }, []);

  return (
    <section
      ref={panelRef}
      className={`dayEditFloatingPanel ${collapsed ? 'isCollapsed' : ''} ${locked ? 'isLocked' : ''} ${className}`.trim()}
      style={{ left: draftPosition.x, top: draftPosition.y, zIndex }}
      onPointerDown={() => onActivate(id)}
    >
      <header className="dayEditFloatingPanelHeader" onPointerDown={startDrag}>
        <GripVertical size={15} aria-hidden="true" />
        <strong>{title}</strong>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? `Expandir ${title}` : `Contraer ${title}`}
        >
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
      </header>
      {!collapsed && <div className="dayEditFloatingPanelBody">{children}</div>}
    </section>
  );
}
