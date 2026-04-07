import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Định nghĩa kiểu dữ liệu Result trả về từ API
interface ResultData {
  id: number;
  studentName: string;
  studentEmail: string;
  examName: string;
  subject: any;
  score: number;
  total_correct: number;
  completedAt: string;
}

export function ResultsManagement() {
  const [results, setResults] = useState<ResultData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. LẤY DANH SÁCH KẾT QUẢ TỪ BACKEND
  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/results', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm }
      });
      setResults(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tải danh sách kết quả';
      toast.error(message);
      console.error("Lỗi khi tải kết quả:", error);
    } finally {
      setLoading(false);
    }
  };

  // Áp dụng Debounce cho ô tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 2. XÓA KẾT QUẢ (HỦY BÀI THI)
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa/hủy kết quả bài thi này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/results/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa kết quả bài thi thành công');
      // Tải lại danh sách sau khi xóa thành công
      fetchResults();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa kết quả';
      toast.error(message);
      console.error("Lỗi khi xóa kết quả:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xuất file Excel/CSV giả lập (Bạn có thể giữ nguyên UI hoặc tích hợp thư viện xuất excel sau)
  const handleExport = () => {
    toast.info('Tính năng xuất file Excel đang được phát triển!');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Kết quả</h1>
        <p className="text-gray-600 mt-1">Xem và thống kê điểm thi của sinh viên</p>
      </div>

      {/* Actions Bar */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm tên SV, email hoặc tên bài thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Xuất Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle>Danh sách kết quả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Sinh viên</TableHead>
                  <TableHead className="font-semibold">Bài thi</TableHead>
                  <TableHead className="font-semibold">Môn học</TableHead>
                  <TableHead className="font-semibold">Ngày nộp</TableHead>
                  <TableHead className="font-semibold text-right">Điểm số</TableHead>
                  <TableHead className="font-semibold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Đang tải kết quả thi...
                    </TableCell>
                  </TableRow>
                ) : results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không tìm thấy kết quả nào phù hợp
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow key={result.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{result.studentName}</p>
                          <p className="text-xs text-gray-500">{result.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{result.examName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {typeof result.subject === 'object' && result.subject !== null ? result.subject.name || 'N/A' : result.subject || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(result.completedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${result.score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.score} / 100
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleDelete(result.id)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}