import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, IconButton, Fade, Grow } from '@mui/material';
import { Play, Pause, RefreshCcw } from 'lucide-react';

// CountdownTimer: initial, running, paused, expired states with overlay animations and controls
export default function CountdownTimer({ initialTime = "00:30" }) {
  // Normalize input to MM:SS
  const normalize = input => {
    const str = String(input).trim();
    if (str.includes(':')) {
      const [m, s] = str.split(':').map(Number);
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    const digits = str.match(/\d+/g) || [];
    const m = Number(digits[0] || 0);
    const s = Number(digits[1] || 0);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  const toSeconds = ts => ts.split(':').reduce((acc, v, i) => i ? acc + Number(v) : Number(v) * 60, 0);
  const toMMSS = sec => {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const baseSeconds = toSeconds(normalize(initialTime));
  const [timeLeft, setTimeLeft] = useState(baseSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  // Derived states
  const isExpired = timeLeft === 0 && !isRunning;
  const isStopped = !isRunning && timeLeft === baseSeconds;
  const isPaused = !isRunning && timeLeft > 0 && timeLeft < baseSeconds;

  const handleStartPause = e => {
  e.stopPropagation();

  if (isExpired) {
    // Si expiró: reinicio completo y arranco de nuevo
    setTimeLeft(baseSeconds);
    intervalRef.current = setInterval(tick, 1000);
    setIsRunning(true);

  } else if (isPaused || isStopped) {
    // Si está pausado o detenido al inicio: reanudo sin tocar timeLeft
    intervalRef.current = setInterval(tick, 1000);
    setIsRunning(true);

  } else if (isRunning) {
    // Si está corriendo: pauso
    clearInterval(intervalRef.current);
    setIsRunning(false);
  }
};

  const handleReset = e => {
    e.stopPropagation();
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(baseSeconds);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <Box position="relative" className="timerBox" display="inline-block">
      {/* Timer display */}
      <Typography
        variant="subtitle2"
        sx={{
          fontFamily: 'monospace', p: 1, borderRadius: 1,
            
        }}
        className="timer"
      >
        {toMMSS(timeLeft)}
      </Typography>

      {/* Expired overlay: red background + play button */}
      <Fade in={isExpired} timeout={400} mountOnEnter unmountOnExit appear>
        <Box position="absolute" top={5} left={0} width="100%" height="100%"
          display="flex" alignItems="center" justifyContent="center"
          sx={{ backgroundColor: 'rgba(255,0,0,0.4)', borderRadius: 1, backdropFilter: 'blur(0.5px)'  }}
        >
          <Grow in={isExpired} timeout={300} mountOnEnter unmountOnExit>
            <IconButton onClick={handleStartPause} size="small">
              <Play size={20} />
            </IconButton>
          </Grow>
        </Box>
      </Fade>

      {/* Initial stopped overlay: play button */}
      <Fade in={isStopped} timeout={400} mountOnEnter unmountOnExit appear>
        <Box position="absolute" top={5} left={0} width="100%" height="100%"
          display="flex" alignItems="center" justifyContent="center"
          sx={{ backgroundColor: 'transparent', borderRadius: 1 }}
        >
          <Grow in={isStopped} timeout={300} mountOnEnter unmountOnExit>
            <IconButton className={'marginPlayButton'} onClick={handleStartPause} size="small">
              <Play size={20} />
            </IconButton>
          </Grow>
        </Box>
      </Fade>

      {/* Running overlay: pause button rotates from play */}
      <Fade in={isRunning} timeout={400} mountOnEnter unmountOnExit appear>
        <Box position="absolute" top={5} left={0} width="100%" height="100%"
          display="flex" alignItems="center" justifyContent="center"
          
          sx={{  borderRadius: 1 }}
        >
          <Grow in={isRunning} timeout={300} mountOnEnter unmountOnExit>
            <IconButton className={'marginPlayButton'}  onClick={handleStartPause} size="small">
              <Pause size={18} style={{ transform: 'rotate(180deg)', transition: 'transform 300ms' }} />
            </IconButton>
          </Grow>
        </Box>
      </Fade>

      {/* Paused overlay: pause icon rotated + reset button */}
      <Fade in={isPaused} timeout={400} mountOnEnter unmountOnExit appear>
        <Box position="absolute" top={5} left={0} width="100%" height="100%"
          display="flex" alignItems="center" justifyContent="center"
          sx={{ backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(0.5px)', borderRadius: 1 }}
        >
          <Grow in={isPaused} timeout={300} mountOnEnter unmountOnExit>
            <Box className={'contButton'} display="flex" gap={0.5}>
              <IconButton  onClick={handleReset} className="ms-4 ps-3"  size="small">
                <RefreshCcw className="text-dark" size={18} />
              </IconButton>
              <IconButton  onClick={handleStartPause} size="small">
              <Play className="text-dark" size={18}  />
              </IconButton>
            </Box>
          </Grow>
        </Box>
      </Fade>
    </Box>
  );
}
