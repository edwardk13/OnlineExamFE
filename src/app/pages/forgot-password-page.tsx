import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Quên mật khẩu</h1>
          <p className="text-gray-600">Nhập email để nhận liên kết đặt lại mật khẩu</p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Khôi phục mật khẩu</CardTitle>
            <CardDescription>
              {submitted 
                ? 'Vui lòng kiểm tra email của bạn'
                : 'Nhập địa chỉ email đã đăng ký'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Liên kết đặt lại mật khẩu đã được gửi đến <strong>{email}</strong>. 
                    Vui lòng kiểm tra hộp thư của bạn (kể cả thư mục spam).
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmitted(false)}
                >
                  Gửi lại
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@uit.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11">
                  Gửi liên kết đặt lại mật khẩu
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <a href="/" className="text-sm text-primary hover:underline inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
