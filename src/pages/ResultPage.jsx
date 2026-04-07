import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';

const ResultPage = () => {
  const location = useLocation();
  const { score, total } = location.state || { score: 0, total: 0 };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Quiz Results
      </Typography>
      <Typography variant="h5">
        You scored {score} out of {total}
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/quiz" style={{ marginTop: '20px' }}>
        Try Again
      </Button>
      <Button variant="outlined" color="secondary" component={Link} to="/" style={{ marginTop: '20px', marginLeft: '10px' }}>
        Home
      </Button>
    </Container>
  );
};

export default ResultPage;
