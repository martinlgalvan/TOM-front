import React, { useEffect, useMemo, useState } from 'react';

const getMaxSeries = (value) => {
  if (Array.isArray(value)) return value.length || 0;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    return match ? Math.max(0, parseInt(match[0], 10)) : 0;
  }
  return 0;
};

function Contador({ max, storageKey }) {
  const maxSeries = useMemo(() => getMaxSeries(max), [max]);
  const [count, setCount] = useState(() => {
    if (!storageKey) return 0;
    try {
      const saved = parseInt(localStorage.getItem(storageKey) || '0', 10);
      return Number.isFinite(saved) ? saved : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    setCount((prev) => {
      const next = Math.min(prev, maxSeries);
      if (storageKey) {
        try { localStorage.setItem(storageKey, String(next)); } catch {}
      }
      return next;
    });
  }, [maxSeries, storageKey]);

  const handleClick = () => {
    setCount((prev) => {
      const next = maxSeries > 0 && prev < maxSeries ? prev + 1 : 0;
      if (storageKey) {
        try { localStorage.setItem(storageKey, String(next)); } catch {}
      }
      return next;
    });
  };

  return (
    <div className="row justify-content-between border shadow mb-2 rounded-1 text-center" onClick={handleClick}>
      <button className="btn colorButonContador col-12" type="button">
        Contador de series
        <strong className="bordeContador shadow p-1 rounded-1 ms-2">{count}</strong>
      </button>
    </div>
  );
}

export default Contador
