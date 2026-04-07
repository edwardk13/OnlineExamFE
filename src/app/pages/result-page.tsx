import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, XCircle, Award, Clock, Calendar, Home } from 'lucide-react';
import { mockExams, mockResults, mockQuestions } from '../data/mock-data';
import { useAuth } from '../context/auth-context';

export function ResultPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const exam = mockExams.find(e => e.id === examId);
  const result = mockResults.find(r => r.examId === examId && r.studentId === user?.id);
  const questions = mockQuestions.filter(q => q.examId === examId);

  if (!exam || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md shadow-xl">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Không tìm thấy kết quả thi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scoreColor = result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreGrade = result.score >= 80 ? 'Xuất sắc' : result.score >= 70 ? 'Giỏi' : result.score >= 50 ? 'Khá' : 'Trung bình';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/student/dashboard')}
          >
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Result Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Award className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Kết quả thi</h1>
            <p className="text-gray-600">{exam.name}</p>
          </div>

          {/* Score Card */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center text-white">
              <p className="text-lg mb-2">Điểm của bạn</p>
              <div className={`text-7xl font-bold mb-2 ${result.score >= 80 ? 'text-white' : result.score >= 50 ? 'text-yellow-200' : 'text-red-200'}`}>
                {result.score}
              </div>
              <Badge className="bg-white/20 text-white hover:bg-white/30 text-lg px-4 py-1">
                {scoreGrade}
              </Badge>
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Câu đúng</p>
                  <p className="text-3xl font-semibold text-green-600">{result.correctAnswers}</p>
                </div>

                <div className="text-center p-6 bg-red-50 rounded-xl">
                  <XCircle className="h-10 w-10 text-red-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Câu sai</p>
                  <p className="text-3xl font-semibold text-red-600">
                    {result.totalQuestions - result.correctAnswers}
                  </p>
                </div>

                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <Award className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Tổng số câu</p>
                  <p className="text-3xl font-semibold text-blue-600">{result.totalQuestions}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Thời gian hoàn thành:</span>
                  </div>
                  <span className="font-medium">
                    {new Date(result.completedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Thời gian làm bài:</span>
                  </div>
                  <span className="font-medium">{exam.duration} phút</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Phân tích chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Tỷ lệ chính xác</span>
                    <span className="font-semibold">
                      {((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                      style={{ width: `${(result.correctAnswers / result.totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Môn học</p>
                    <p className="font-semibold">{exam.subject}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    <Badge className="bg-green-600">Đã hoàn thành</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/student/dashboard')}
            >
              Về trang chủ
            </Button>
            {questions.length > 0 && (
              <Button 
                size="lg"
                onClick={() => {/* In a real app, this would show answer review */}}
                disabled
              >
                Xem chi tiết đáp án
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
