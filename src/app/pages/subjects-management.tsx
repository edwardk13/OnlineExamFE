import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

interface Subject {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function SubjectsManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const getAuthConfig = () => {
    const tokenFromStorage = localStorage.getItem('token');
    const tokenFromAxios = typeof axios.defaults.headers.common['Authorization'] === 'string'
      ? axios.defaults.headers.common['Authorization'].replace(/^Bearer\s+/, '')
      : null;
    const token = tokenFromStorage || tokenFromAxios;

    if (!token || token === 'undefined' || token === 'null') {
      throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/subjects', getAuthConfig());
      setSubjects(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không tải được danh sách môn học';
      toast.error(message);
      console.error('Lỗi tải danh sách môn học:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên môn học');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSubject) {
        await axios.put(`http://localhost:8000/api/admin/subjects/${editingSubject.id}`, formData, getAuthConfig());
        toast.success('Cập nhật môn học thành công');
      } else {
        await axios.post('http://localhost:8000/api/admin/subjects', formData, getAuthConfig());
        toast.success('Thêm môn học thành công');
      }
      fetchSubjects();
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Lỗi lưu môn học:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, description: subject.description });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.delete(`http://localhost:8000/api/admin/subjects/${id}`, getAuthConfig());
      toast.success('Xóa môn học thành công');
      fetchSubjects();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể xóa môn học';
      toast.error(message);
      console.error('Lỗi xóa môn học:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingSubject(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý môn học</h1>
        <p className="text-gray-600 mt-1">Quản lý các môn học và thông tin liên quan</p>
      </div>

      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
              type="button"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              Thêm môn học
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsAddDialogOpen(open);
      }}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}</DialogTitle>
            <DialogDescription>
              {editingSubject ? 'Cập nhật thông tin môn học' : 'Tạo môn học mới trong hệ thống'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên môn học</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên môn học"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả môn học"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : editingSubject ? 'Cập nhật' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle>Danh sách môn học</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên môn học</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.id}</TableCell>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell>{new Date(subject.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleEdit(subject)}
                          disabled={isSubmitting}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleDelete(subject.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}