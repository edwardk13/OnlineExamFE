import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Welcome to the Quiz!
      </Typography>
      <Typography variant="body1" paragraph>
        Test your knowledge with our fun and challenging quiz.
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/quiz">
        Start Quiz
      </Button>
    </Container>
  );
};

export default HomePage;
