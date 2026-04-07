import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const Timer = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  return (
    <Typography variant="h6" style={{ margin: '10px 0' }}>
      Time Left: {timeLeft}s
    </Typography>
  );
};

export default Timer;
