import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Clock, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { mockExams } from '../data/mock-data';

export function WaitingRoomPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = mockExams.find(e => e.id === examId);

  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    if (!exam) return;

    const checkTime = () => {
      const now = new Date().getTime();
      const startTime = new Date(exam.startTime).getTime();
      const endTime = new Date(exam.endTime).getTime();
      
      const diff = startTime - now;
      
      if (now >= startTime && now < endTime) {
        setCanStart(true);
        setTimeUntilStart(0);
      } else if (diff > 0) {
        setTimeUntilStart(Math.floor(diff / 1000));
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    
    return () => clearInterval(interval);
  }, [exam]);

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md shadow-xl">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Không tìm thấy bài thi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/student/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Exam Info */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
              <CardTitle className="text-2xl">{exam.name}</CardTitle>
              <p className="text-gray-600 mt-2">{exam.subject}</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số câu hỏi</p>
                    <p className="font-semibold text-lg">{exam.totalQuestions}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="font-semibold text-lg">{exam.duration} phút</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điểm tối đa</p>
                    <p className="font-semibold text-lg">100</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Countdown or Start Button */}
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              {!canStart ? (
                <div className="text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
                    <Clock className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Bài thi chưa bắt đầu</h3>
                  <p className="text-gray-600">Thời gian còn lại đến khi bắt đầu:</p>
                  <div className="text-5xl font-semibold text-primary">
                    {formatCountdown(timeUntilStart)}
                  </div>
                  <Button disabled className="mt-4">
                    Chờ đến giờ thi
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">Bài thi đã sẵn sàng!</h3>
                  <p className="text-gray-600">Bạn có thể bắt đầu làm bài ngay bây giờ</p>
                  <Button 
                    size="lg"
                    className="mt-4"
                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                  >
                    Bắt đầu làm bài
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exam Rules */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Quy định thi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-900">
                  Vui lòng đọc kỹ các quy định trước khi bắt đầu làm bài thi
                </AlertDescription>
              </Alert>

              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                    1
                  </span>
                  <span>Thời gian làm bài: <strong>{exam.duration} phút</strong>. Hệ thống sẽ tự động nộp bài khi hết thời gian.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                    2
                  </span>
                  <span>Bài thi gồm <strong>{exam.totalQuestions} câu hỏi</strong> trắc nghiệm với 4 đáp án A, B, C, D.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                    3
                  </span>
                  <span>Mỗi câu hỏi chỉ có <strong>một đáp án đúng</strong>. Bạn có thể thay đổi đáp án trong quá trình làm bài.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                    4
                  </span>
                  <span>Sử dụng bảng điều hướng bên phải để di chuyển giữa các câu hỏi. Câu đã trả lời sẽ được đánh dấu màu xanh.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                    5
                  </span>
                  <span>Nhấn nút <strong>"Nộp bài"</strong> khi hoàn thành. Sau khi nộp bài, bạn không thể thay đổi đáp án.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                    6
                  </span>
                  <span>Không được sử dụng tài liệu, thiết bị hỗ trợ hoặc trao đổi với người khác trong quá trình thi.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                    7
                  </span>
                  <span>Đảm bảo kết nối internet ổn định. Hệ thống sẽ tự động lưu câu trả lời của bạn.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
