import React, { useState } from 'react';
import { Button, Card, CardContent, Typography } from '@mui/material';
import Timer from './Timer';

const Question = ({ question, handleAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const onAnswer = (option) => {
    setSelectedOption(option);
    const isCorrect = option === question.correct_answer;
    handleAnswer(isCorrect);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {question.question}
        </Typography>
        <Timer initialTime={10} onTimeUp={() => onAnswer(null)} />
        <div>
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === option ? 'contained' : 'outlined'}
              onClick={() => onAnswer(option)}
              style={{ margin: '5px' }}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Question;
