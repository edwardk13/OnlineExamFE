import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, Search, Edit, Trash2, Upload, Filter } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

interface SubjectItem {
  id: number;
  name: string;
}

type DifficultyValue = 'easy' | 'medium' | 'hard';

const difficultyLabels: Record<DifficultyValue, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó'
};

interface QuestionItem {
  id: string;
  examId: string;
  questionText: string;
  options: Array<{ id: string; text: string; label: 'A' | 'B' | 'C' | 'D' }>;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  subjectId: string;
  subject: string;
  difficulty: DifficultyValue;
}

interface QuestionFormData {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  subject: string;
  difficulty: DifficultyValue;
}

export function QuestionsManagement() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    subject: '',
    difficulty: 'medium'
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/subjects', getAuthConfig());
      setSubjects(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Không thể tải danh sách môn học';
      toast.error(message);
      console.error('Lỗi tải môn học:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [subjectFilter, difficultyFilter]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (subjectFilter !== 'all') params.append('subject', subjectFilter);
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);

      const response = await axios.get(`http://localhost:8000/api/admin/questions?${params}`, getAuthConfig());
      const transformedQuestions = response.data.map((q: any) => {
        const rawDifficulty = String(q.difficulty || '').toLowerCase();
        const difficulty = ['easy', 'medium', 'hard'].includes(rawDifficulty) ? rawDifficulty as DifficultyValue : 'medium';

        return {
          id: q.id.toString(),
          examId: q.exam_id?.toString() || '',
          questionText: q.content,
          options: [
            { id: `opt${q.id}a`, text: q.option_a, label: 'A' as const },
            { id: `opt${q.id}b`, text: q.option_b, label: 'B' as const },
            { id: `opt${q.id}c`, text: q.option_c, label: 'C' as const },
            { id: `opt${q.id}d`, text: q.option_d, label: 'D' as const }
          ],
          correctAnswer: `opt${q.id}${q.correct_answer.toLowerCase()}`,
          subjectId: q.subject_id?.toString() || '',
          subject: q.subject_name || 'Không xác định',
          difficulty
        };
      });
      setQuestions(transformedQuestions);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tải danh sách câu hỏi';
      toast.error(message);
      console.error('Lỗi tải câu hỏi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || q.subjectId === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (!formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
      toast.error('Vui lòng nhập đầy đủ 4 đáp án');
      return;
    }
    if (!formData.subject) {
      toast.error('Vui lòng chọn môn học');
      return;
    }

    const data = {
      content: formData.questionText,
      option_a: formData.optionA,
      option_b: formData.optionB,
      option_c: formData.optionC,
      option_d: formData.optionD,
      correct_answer: formData.correctAnswer,
      subject_id: Number(formData.subject),
      difficulty: formData.difficulty
    };

    try {
      setIsSubmitting(true);
      if (editingQuestion) {
        console.log('Updating question:', editingQuestion.id, data);
        await axios.put(`http://localhost:8000/api/admin/questions/${editingQuestion.id}`, data, getAuthConfig());
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        console.log('Creating question:', data);
        await axios.post('http://localhost:8000/api/admin/questions', data, getAuthConfig());
        toast.success('Thêm câu hỏi thành công');
      }
      fetchQuestions(); // Refresh list
      handleDialogClose();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      const status = error.response?.status;
      toast.error(message);
      console.error(`❌ Error (${status}):`, error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question: QuestionItem) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      optionA: question.options[0]?.text || '',
      optionB: question.options[1]?.text || '',
      optionC: question.options[2]?.text || '',
      optionD: question.options[3]?.text || '',
      correctAnswer: question.options.find(opt => opt.id === question.correctAnswer)?.label || 'A',
      subject: question.subjectId,
      difficulty: question.difficulty
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.delete(`http://localhost:8000/api/admin/questions/${id}`, getAuthConfig());
      toast.success('Xóa câu hỏi thành công');
      fetchQuestions(); // Refresh list
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể xóa câu hỏi';
      toast.error(message);
      console.error('Lỗi xóa câu hỏi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingQuestion(null);
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      subject: '',
      difficulty: 'medium'
    });
  };

  const getDifficultyBadge = (difficulty: DifficultyValue) => {
    const label = difficultyLabels[difficulty] || 'Trung bình';
    const badgeClasses = {
      easy: 'bg-green-100 text-green-800 hover:bg-green-100',
      medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      hard: 'bg-red-100 text-red-800 hover:bg-red-100'
    }[difficulty] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';

    return <Badge className={badgeClasses}>{label}</Badge>;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Ngân hàng câu hỏi</h1>
        <p className="text-gray-600 mt-1">Quản lý các câu hỏi trắc nghiệm trong hệ thống</p>
      </div>

      {/* Actions Bar */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                type="button"
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  handleDialogClose();
                  setIsAddDialogOpen(true);
                }}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Thêm câu hỏi
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                if (!open) {
                  handleDialogClose();
                }
                setIsAddDialogOpen(open);
              }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingQuestion
                        ? 'Cập nhật thông tin câu hỏi'
                        : 'Nhập thông tin câu hỏi mới'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="questionText">Câu hỏi</Label>
                        <Textarea
                          id="questionText"
                          value={formData.questionText}
                          onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                          disabled={isSubmitting}
                          required
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="optionA">Đáp án A</Label>
                          <Input
                            id="optionA"
                            value={formData.optionA}
                            onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="optionB">Đáp án B</Label>
                          <Input
                            id="optionB"
                            value={formData.optionB}
                            onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="optionC">Đáp án C</Label>
                          <Input
                            id="optionC"
                            value={formData.optionC}
                            onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="optionD">Đáp án D</Label>
                          <Input
                            id="optionD"
                            value={formData.optionD}
                            onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Đáp án đúng</Label>
                        <Select value={formData.correctAnswer} onValueChange={(value: 'A' | 'B' | 'C' | 'D') => setFormData({ ...formData, correctAnswer: value })}>
                          <SelectTrigger disabled={isSubmitting}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Môn học</Label>
                          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                            <SelectTrigger disabled={isSubmitting}>
                              <SelectValue placeholder="Chọn môn học" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(subject => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Độ khó</Label>
                          <Select value={formData.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData({ ...formData, difficulty: value })}>
                            <SelectTrigger disabled={isSubmitting}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Dễ</SelectItem>
                              <SelectItem value="medium">Trung bình</SelectItem>
                              <SelectItem value="hard">Khó</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                        {isSubmitting ? 'Đang xử lý...' : editingQuestion ? 'Cập nhật' : 'Thêm'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Lọc:</span>
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn học</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả độ khó</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle>
            Danh sách câu hỏi ({loading ? '...' : filteredQuestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold w-12">STT</TableHead>
                  <TableHead className="font-semibold">Câu hỏi</TableHead>
                  <TableHead className="font-semibold">Môn học</TableHead>
                  <TableHead className="font-semibold">Độ khó</TableHead>
                  <TableHead className="font-semibold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Không tìm thấy câu hỏi nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.slice(0, 20).map((question, index) => (
                    <TableRow key={question.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{question.questionText}</p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.subject}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getDifficultyBadge(question.difficulty)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => handleEdit(question)}
                            disabled={isSubmitting}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => handleDelete(question.id)}
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
