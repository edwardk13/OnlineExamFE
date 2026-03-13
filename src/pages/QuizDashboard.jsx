import React from 'react';
import { Link } from 'react-router-dom';

const QuizDashboard = () => {
  return (
    <div className="container mt-4">
      <h2>Quiz Dashboard</h2>
      <p>Select a quiz to start.</p>
      {/* Add quiz selection logic here */}
      <Link to="/quiz/1" className="btn btn-primary">Start Quiz 1</Link>
    </div>
  );
};

export default QuizDashboard;
