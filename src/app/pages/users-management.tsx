import { useState, useEffect } from 'react';
import { api } from '../context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: { search: searchTerm }
      });
      setUsers(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không tải được danh sách tài khoản';
      toast.error(message);
      console.error("Lỗi khi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, formData);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await api.post('/admin/users', formData);
        toast.success('Tạo tài khoản thành công');
      }
      fetchUsers();
      handleDialogClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi lưu tài khoản';
      toast.error(message);
      console.error('Lỗi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Chắc chắn xóa tài khoản này?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.delete(`/admin/users/${id}`);
      toast.success('Xóa tài khoản thành công');
      fetchUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi khi xóa tài khoản';
      toast.error(message);
      console.error('Lỗi khi xóa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'student' });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Tài khoản</h1>
        <p className="text-gray-600 mt-1">Cấp phát tài khoản cho Giáo viên và Học sinh</p>
      </div>

      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Tìm kiếm tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (!open) {
                handleDialogClose();
              }
              setIsAddDialogOpen(open);
            }}>
              <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Sửa thông tin' : 'Cấp tài khoản mới'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Loại tài khoản</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        disabled={isSubmitting || !!editingUser}
                      >
                        <option value="student">Học sinh</option>
                        <option value="teacher">Giáo viên</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Họ và tên</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email đăng nhập</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{editingUser ? 'Mật khẩu mới (Tùy chọn)' : 'Mật khẩu'}</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isSubmitting}
                        required={!editingUser}
                        minLength={6}
                      />
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
                    <Button
                      type="submit"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Đang xử lý...' : editingUser ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                handleDialogClose();
                setIsAddDialogOpen(true);
              }}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
              Thêm tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-0">
        <CardContent>
          <div className="rounded-lg border overflow-hidden mt-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phân quyền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4">Đang tải...</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4 text-gray-500">Chưa có dữ liệu</TableCell></TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleEdit(u)}
                          disabled={isSubmitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:bg-red-50"
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