import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Exam } from '../data/mock-data';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

interface QuestionItem {
  id: string;
  questionText: string;
  options: { id: string; text: string; label: 'A' | 'B' | 'C' | 'D' }[];
}

export function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/student/exams/${examId}`);
        const examData = response.data;
        setExam({
          id: examData.id.toString(),
          name: examData.name,
          subject: examData.subject,
          startTime: examData.start_time,
          endTime: examData.end_time,
          duration: examData.duration,
          status: examData.status,
          totalQuestions: examData.total_questions,
          password: examData.password || undefined
        });

        const mappedQuestions = examData.questions.map((q: any) => ({
          id: q.id.toString(),
          questionText: q.content,
          options: [
            { id: `opt${q.id}A`, text: q.option_a, label: 'A' },
            { id: `opt${q.id}B`, text: q.option_b, label: 'B' },
            { id: `opt${q.id}C`, text: q.option_c, label: 'C' },
            { id: `opt${q.id}D`, text: q.option_d, label: 'D' }
          ]
        }));

        setQuestions(mappedQuestions);
        setTimeLeft(examData.duration * 60);
      } catch (error) {
        console.error('Lỗi tải đề thi:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  useEffect(() => {
    if (!exam || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md shadow-xl">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Đang tải đề thi...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md shadow-xl">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Không tìm thấy bài thi hoặc câu hỏi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev: Record<string, string>) => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleSubmit = () => {
    navigate(`/student/result/${examId}`);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-semibold text-lg text-gray-900">{exam.name}</h1>
              <p className="text-sm text-gray-600">{exam.subject}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                <Clock className="h-5 w-5 text-red-600" />
                <span className={`font-semibold text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              <Button 
                onClick={() => setShowSubmitDialog(true)}
                variant={unansweredCount > 0 ? "outline" : "default"}
              >
                Nộp bài
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">
                      Câu {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    {answers[currentQuestion.id] && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Đã trả lời
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                    {currentQuestion.questionText}
                  </h3>
                </div>

                <RadioGroup 
                  value={answers[currentQuestion.id] || ''} 
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div 
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${
                        answers[currentQuestion.id] === option.id 
                          ? 'border-primary bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label 
                        htmlFor={option.id} 
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <span className="font-semibold mr-2">{option.label}.</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((prev: number) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Câu trước
              </Button>
              <Button
                onClick={() => setCurrentQuestionIndex((prev: number) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Câu sau
              </Button>
            </div>
          </div>

          {/* Question Navigation Panel */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 sticky top-24">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Danh sách câu hỏi</h4>
                
                <div className="flex gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-primary"></div>
                    <span className="text-gray-600">Đang làm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-green-500"></div>
                    <span className="text-gray-600">Đã trả lời</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border-2 border-gray-300"></div>
                    <span className="text-gray-600">Chưa trả lời</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questions.map((question, index) => {
                    const isAnswered = !!answers[question.id];
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        className={`h-10 rounded-lg font-medium text-sm transition-all ${
                          isCurrent
                            ? 'bg-primary text-white shadow-md'
                            : isAnswered
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đã trả lời:</span>
                    <span className="font-semibold text-green-600">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Chưa trả lời:</span>
                    <span className="font-semibold text-orange-600">{unansweredCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {unansweredCount > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-900">
                  Bạn còn <strong>{unansweredCount}</strong> câu chưa trả lời
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn nộp bài thi không? Sau khi nộp bài, bạn sẽ không thể thay đổi câu trả lời.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Tổng số câu:</span>
              <span className="font-semibold">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Đã trả lời:</span>
              <span className="font-semibold text-green-600">{answeredCount}</span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-600">Chưa trả lời:</span>
                <span className="font-semibold text-orange-600">{unansweredCount}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Tiếp tục làm bài
            </Button>
            <Button onClick={handleSubmit}>
              Xác nhận nộp bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
