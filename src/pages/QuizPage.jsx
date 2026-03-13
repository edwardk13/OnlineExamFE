import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { getQuestions } from '../api/quizApi';
import Question from '../components/Question';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions();
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      navigate('/results', { state: { score, total: questions.length } });
    }
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Quiz
      </Typography>
      {questions.length > 0 && (
        <Question
          question={questions[currentQuestionIndex]}
          handleAnswer={handleAnswer}
        />
      )}
    </Container>
  );
};

export default QuizPage;
