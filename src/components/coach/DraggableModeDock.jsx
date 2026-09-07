import React, { useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

export default function DraggableModeDock({ position, onPositionChange, children }) {
  const dockRef = useRef(null);
  const dragRef = useRef(null);
  const [draftPosition, setDraftPosition] = useState(position);

  useEffect(() => setDraftPosition(position), [position.x, position.y]);

  useEffect(() => {
    const keepVisible = () => {
      const dock = dockRef.current;
      if (!dock) return;
      const rect = dock.getBoundingClientRect();
      setDraftPosition((current) => ({
        x: clamp(current.x, 4, window.innerWidth - rect.width - 4),
        y: clamp(current.y, 3, window.innerHeight - rect.height - 4),
      }));
    };
    keepVisible();
    window.addEventListener('resize', keepVisible);
    return () => window.removeEventListener('resize', keepVisible);
  }, []);

  const move = (event) => {
    const drag = dragRef.current;
    const dock = dockRef.current;
    if (!drag || !dock) return;
    const rect = dock.getBoundingClientRect();
    const next = {
      x: clamp(event.clientX - drag.offsetX, 4, window.innerWidth - rect.width - 4),
      y: clamp(event.clientY - drag.offsetY, 3, window.innerHeight - rect.height - 4),
    };
    drag.latest = next;
    setDraftPosition(next);
  };

  const finish = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
    onPositionChange(drag.latest);
  };

  const start = (event) => {
    if (event.button !== 0) return;
    const rect = dockRef.current.getBoundingClientRect();
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      latest: draftPosition,
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    event.preventDefault();
  };

  useEffect(() => () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
  }, []);

  return (
    <div
      ref={dockRef}
      className="dayEditFreeModeDock"
      style={{ left: draftPosition.x, top: draftPosition.y }}
    >
      <button type="button" className="dayEditFreeModeDockHandle" onPointerDown={start} aria-label="Mover controles">
        <GripVertical size={15} />
      </button>
      {children}
    </div>
  );
}
