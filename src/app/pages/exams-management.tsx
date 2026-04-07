import { useState, useEffect } from 'react';
import { api } from '../context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Search, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

interface SubjectItem {
  id: number;
  name: string;
}

interface ExamItem {
  id: string;
  name: string;
  subjectId: number;
  subjectName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  totalQuestions: number;
  password?: string;
}

export function ExamsManagement() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    startTime: '',
    endTime: '',
    duration: 60,
    totalQuestions: 30,
    password: ''
  });

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/admin/subjects');
      setSubjects(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không tải được danh sách môn học';
      toast.error(message);
      console.error('Lỗi tải môn học:', error);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/exams');
      const mappedExams: ExamItem[] = response.data.map((exam: any) => ({
        id: String(exam.id),
        name: exam.name,
        subjectId: Number(exam.subject_id ?? exam.subjectId ?? 0),
        subjectName: exam.subject_name ?? exam.subject?.name ?? exam.subject ?? '',
        startTime: exam.start_time,
        endTime: exam.end_time,
        duration: exam.duration,
        status: exam.status,
        totalQuestions: exam.total_questions ?? exam.totalQuestions ?? 0,
        password: exam.password ?? ''
      }));
      setExams(mappedExams);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không tải được danh sách bài thi';
      toast.error(message);
      console.error('Lỗi tải danh sách bài thi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchExams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên bài thi');
      return;
    }
    if (!formData.subjectId) {
      toast.error('Vui lòng chọn môn học');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }

    const payload = {
      name: formData.name,
      subject_id: Number(formData.subjectId),
      start_time: formData.startTime,
      end_time: formData.endTime,
      duration: formData.duration,
      total_questions: formData.totalQuestions,
      password: formData.password || null
    };

    try {
      setIsSubmitting(true);
      if (editingExam) {
        await api.put(`/admin/exams/${editingExam.id}`, payload);
        toast.success('Cập nhật bài thi thành công');
      } else {
        await api.post('/admin/exams', payload);
        toast.success('Tạo bài thi thành công');
      }
      await fetchExams();
      handleDialogClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Lỗi lưu bài thi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (exam: ExamItem) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      subjectId: exam.subjectId.toString(),
      startTime: exam.startTime.slice(0, 16),
      endTime: exam.endTime.slice(0, 16),
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      password: exam.password || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài thi này?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.delete(`/admin/exams/${id}`);
      toast.success('Xóa bài thi thành công');
      await fetchExams();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể xóa bài thi';
      toast.error(message);
      console.error('Lỗi xóa bài thi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingExam(null);
    setFormData({
      name: '',
      subjectId: '',
      startTime: '',
      endTime: '',
      duration: 60,
      totalQuestions: 30,
      password: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Sắp diễn ra</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đang diễn ra</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-gray-600">Đã kết thúc</Badge>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý bài thi</h1>
        <p className="text-gray-600 mt-1">Quản lý các bài thi và kỳ thi trong hệ thống</p>
      </div>

      {/* Actions Bar */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm bài thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (!open) {
                handleDialogClose();
              }
              setIsAddDialogOpen(open);
            }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingExam ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingExam
                      ? 'Cập nhật thông tin bài thi'
                      : 'Nhập thông tin bài thi mới'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên bài thi</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                        required
                        placeholder="VD: Kiểm tra giữa kỳ - Lập trình OOP"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Môn học</Label>
                      <select
                        id="subject"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Chọn môn học</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Thời gian bắt đầu</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">Thời gian kết thúc</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Thời gian làm bài (phút)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                          disabled={isSubmitting}
                          required
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalQuestions">Số câu hỏi</Label>
                        <Input
                          id="totalQuestions"
                          type="number"
                          value={formData.totalQuestions}
                          onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                          disabled={isSubmitting}
                          required
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu bài thi (tùy chọn)</Label>
                      <Input
                        id="password"
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isSubmitting}
                        placeholder="Để trống nếu không cần mật khẩu"
                      />
                      <p className="text-xs text-gray-500">
                        Sinh viên cần nhập mật khẩu này để vào phòng thi
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang xử lý...' : editingExam ? 'Cập nhật' : 'Tạo bài thi'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                handleDialogClose();
                setIsAddDialogOpen(true);
              }}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
              Tạo bài thi mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle>
            Danh sách bài thi ({filteredExams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">STT</TableHead>
                  <TableHead className="font-semibold">Tên bài thi</TableHead>
                  <TableHead className="font-semibold">Môn học</TableHead>
                  <TableHead className="font-semibold">Thời gian</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không tìm thấy bài thi nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam, index) => (
                    <TableRow key={exam.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {exam.duration} phút
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {exam.totalQuestions} câu
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {exam.subjectName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-900">{formatDateTime(exam.startTime)}</p>
                          <p className="text-gray-500 text-xs">đến {formatDateTime(exam.endTime)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(exam.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => handleEdit(exam)}
                            disabled={isSubmitting}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => handleDelete(exam.id)}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
