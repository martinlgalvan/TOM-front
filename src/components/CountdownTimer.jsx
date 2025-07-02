import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, IconButton, Fade, Grow } from '@mui/material';
import { Play, Pause, RefreshCcw } from 'lucide-react';

// CountdownTimer: initial, running, paused, expired states with overlay animations and controls
export default function CountdownTimer({ initialTime = "00:30" }) {
  // Normalize input to MM:SS
 const normalize = input => {
  const str = String(input).trim()
    // convertir comas, apóstrofos y puntos a “:”
    .replace(/[,.'´`]/g, ':')
    // eliminar todo lo que no sea dígito o “:”
    .replace(/[^0-9:]/g, '')

  const parts = str.split(':').filter(Boolean)
  let m = 0, s = 0

  if (parts.length === 0) {
    // nada válido
    m = 0; s = 0
  } else if (parts.length === 1) {
    // un solo número → minutos
    m = parseInt(parts[0], 10) || 0
  } else {
    // al menos MM:SS
    m = parseInt(parts[0], 10) || 0
    s = parseInt(parts[1], 10) || 0
  }

  // si segundos ≥ 60, los pasamos a minutos
  m += Math.floor(s / 60)
  s = s % 60

  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}


  const toSeconds = ts => ts.split(':').reduce((acc, v, i) => i ? acc + Number(v) : Number(v) * 60, 0);
  const toMMSS = sec => {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const baseSeconds = toSeconds(normalize(initialTime));
  const [timeLeft, setTimeLeft] = useState(baseSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const noRestSpecified  = baseSeconds === 0;
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
  const initialSeconds = toSeconds(initialTime);
  const startTimestampRef = useRef(null);
  const remainingTimeRef = useRef(initialSeconds);


 const handleStartPause = e => {
    e.stopPropagation();
    if (isRunning) {
      // Pausar
      clearInterval(intervalRef.current);
      setIsRunning(false);
      remainingTimeRef.current = timeLeft;
    } else {
      // Si expiró o está detenido/pausado: arranco o reanudo
      startTimestampRef.current = Date.now();
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
        const updated = Math.max(remainingTimeRef.current - elapsed, 0);
        setTimeLeft(updated);
        if (updated === 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
        }
      }, 1000);
    }
  };

  const handleReset = e => {
    e.stopPropagation();
    clearInterval(intervalRef.current);
    setIsRunning(false);
    remainingTimeRef.current = initialSeconds;
    setTimeLeft(initialSeconds);
  };

  // Limpieza al desmontar
  useEffect(() => () => clearInterval(intervalRef.current), []);

    if (noRestSpecified) {
    return (
      <div className="timerBox" display="inline-block">
        <p

          className="timerNoEspecifica"
        >
          No especifica
        </p>
      </div>
    );
  }

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
