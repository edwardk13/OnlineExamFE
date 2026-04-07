import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, FileText, Clock, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Đã xóa import mock-data vì chúng ta sẽ dùng dữ liệu thật từ Backend

interface DashboardData {
  stats: {
    totalStudents: number;
    totalExams: number;
    activeExams: number;
    averageScore: string | number;
  };
  charts: {
    examsBySubject: Array<{ subject: string; count: number }>;
    recentResults: Array<{ date: string; avgScore: number }>;
  };
  recentActivity: Array<{
    studentName: string;
    examName: string;
    score: number;
    completedAt: string;
  }>;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    stats: { totalStudents: 0, totalExams: 0, activeExams: 0, averageScore: '0' },
    charts: { examsBySubject: [], recentResults: [] },
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Lấy token từ localStorage (hoặc Context của bạn)
        const token = localStorage.getItem('token'); 
        
        const response = await axios.get('http://localhost:8000/api/admin/dashboard', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        setData(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const { stats, charts, recentActivity } = data;
  const { totalStudents, totalExams, activeExams, averageScore } = stats;

  const statsConfig = [
    {
      title: 'Tổng số sinh viên',
      value: totalStudents,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Tổng số bài thi',
      value: totalExams,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Bài thi đang diễn ra',
      value: activeExams,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Điểm trung bình',
      value: averageScore,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
  ];

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-screen text-gray-500">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Xem tổng quan về hệ thống thi trực tuyến</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-sm border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${stat.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-white/90 text-sm">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Số lượng bài thi theo môn học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.examsBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Điểm trung bình theo thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.recentResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#16A34A" 
                  strokeWidth={3}
                  dot={{ fill: '#16A34A', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Chưa có hoạt động nộp bài nào gần đây</div>
            ) : (
              recentActivity.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{result.studentName}</p>
                      <p className="text-sm text-gray-600">
                        Hoàn thành bài thi: {result.examName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-green-600">{result.score} điểm</p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.completedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}