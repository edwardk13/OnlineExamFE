import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Clock, BookOpen, AlertCircle, PlayCircle, Eye, LogOut } from 'lucide-react';

interface Exam {
  id: number;
  name: string;
  subject: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_questions: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Nếu không có token thật (đang dùng demo), axios sẽ lấy dữ liệu từ logic demo nếu bạn đã cấu hình
      const response = await axios.get('http://localhost:8000/api/student/exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(response.data);
    } catch (error) {
      console.error("Lỗi khi tải bài thi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderExamColumn = (title: string, icon: any, colorClass: string, status: string) => {
    const filtered = exams.filter(e => e.status === status);
    const Icon = icon;

    return (
      <Card className="border-0 shadow-sm bg-white h-full">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <div className={`p-2 rounded-lg bg-white shadow-sm ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-10">Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10 italic">Trống</p>
          ) : (
            filtered.map((exam) => (
              <div key={exam.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-900 leading-tight">{exam.name}</h4>
                <p className="text-sm text-primary font-medium mb-3">{exam.subject}</p>
                
                <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Bắt đầu: {formatDateTime(exam.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Thời lượng: {exam.duration} phút</span>
                  </div>
                </div>

                {status === 'ongoing' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() => navigate(`/student/waiting-room/${exam.id}`)}
                  >
                    <PlayCircle className="h-4 w-4" /> Làm bài ngay
                  </Button>
                )}
                {status === 'completed' && (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => navigate(`/student/result/${exam.id}`)}
                  >
                    <Eye className="h-4 w-4" /> Xem kết quả
                  </Button>
                )}
                {status === 'upcoming' && (
                  <Button disabled variant="secondary" className="w-full gap-2">
                    <Clock className="h-4 w-4" /> Chưa mở
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">UIT EXAM</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.mssv || 'Sinh viên'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Danh sách bài thi</h2>
          <p className="text-gray-500">Vui lòng chọn bài thi đúng lịch trình của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {renderExamColumn('Sắp diễn ra', AlertCircle, 'text-yellow-500', 'upcoming')}
          {renderExamColumn('Đang diễn ra', PlayCircle, 'text-green-500', 'ongoing')}
          {renderExamColumn('Đã kết thúc', BookOpen, 'text-gray-500', 'completed')}
        </div>
      </main>
    </div>
  );
}