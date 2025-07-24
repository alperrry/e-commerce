import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as Icons from 'react-icons/fi';

const FiLock = Icons.FiLock as any;
const FiEye = Icons.FiEye as any;
const FiEyeOff = Icons.FiEyeOff as any;
const FiCheck = Icons.FiCheck as any;
const FiX = Icons.FiX as any;
const FiArrowLeft = Icons.FiArrowLeft as any;
const FiShield = Icons.FiShield as any;

interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasValidated = useRef(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'validating' | 'valid' | 'invalid'>('validating');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordData>();
  const password = watch('newPassword');

  useEffect(() => {
    if (hasValidated.current) return;
    
    if (!token || !email) {
      setTokenStatus('invalid');
      return;
    }

    hasValidated.current = true;
    validateToken();
  }, []);

  const validateToken = async () => {
    try {
      // Token geçerliliğini kontrol etmek için backend'e request gönder
      // Şimdilik direkt valid olarak işaretleyelim
      setTokenStatus('valid');
    } catch (error) {
      setTokenStatus('invalid');
    }
  };

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setError(null);

    try {
      const decodedToken = token ? decodeURIComponent(token) : null;
      
      const response = await fetch('http://localhost:5288/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: decodedToken,
          newPassword: data.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Şifreniz başarıyla sıfırlandı! Yeni şifrenizle giriş yapabilirsiniz.' }
          });
        }, 3000);
      } else {
        setError(result.message || 'Şifre sıfırlama işlemi başarısız oldu.');
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const strengthMap = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Zayıf', color: 'bg-red-500' },
      { strength: 2, text: 'Orta', color: 'bg-yellow-500' },
      { strength: 3, text: 'İyi', color: 'bg-blue-500' },
      { strength: 4, text: 'Güçlü', color: 'bg-green-500' }
    ];
    
    return strengthMap[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  // Token validation loading
  if (tokenStatus === 'validating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Doğrulanıyor...</h2>
            <p className="text-gray-600">Şifre sıfırlama bağlantınız kontrol ediliyor.</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
            </Link>
            <p className="text-gray-600 mt-2">Şifre Sıfırlama</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiX className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Geçersiz Bağlantı</h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. 
              Lütfen yeni bir şifre sıfırlama talebinde bulunun.
            </p>

            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 inline-block"
              >
                Yeni Şifre Sıfırlama Talebi
              </Link>
              
              <Link
                to="/login"
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300 inline-block"
              >
                Giriş Sayfasına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
            </Link>
            <p className="text-gray-600 mt-2">Şifre Sıfırlama</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Şifre Sıfırlandı!</h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Şifreniz başarıyla sıfırlandı! Yeni şifrenizle giriş yapabilirsiniz.
              3 saniye sonra giriş sayfasına yönlendirileceksiniz.
            </p>

            <Link
              to="/login"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 inline-block"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
          </Link>
          <p className="text-gray-600 mt-2">Yeni şifrenizi belirleyin</p>
        </div>

        {/* Reset Password Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Yeni Şifre Belirleyin</h2>
            <p className="text-gray-600 text-sm">
              Güvenli bir şifre oluşturun. Şifreniz en az 8 karakter olmalıdır.
            </p>
          </div>

          {/* Email Info */}
          {email && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
              <p className="text-sm text-gray-600">
                <strong>{decodeURIComponent(email)}</strong> için şifre sıfırlama
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword', {
                    required: 'Yeni şifre zorunludur',
                    minLength: {
                      value: 8,
                      message: 'Şifre en az 8 karakter olmalıdır'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&._-]{8,}$/,
                      message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
                    }
                  })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Şifre gücü: <span className="font-medium">{passwordStrength.text}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Şifre tekrarı zorunludur',
                    validate: value => value === password || 'Şifreler eşleşmiyor'
                  })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Şifre Sıfırlanıyor...
                </>
              ) : (
                'Şifreyi Sıfırla'
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center transition"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🔐 Güvenlik İpuçları</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              En az 8 karakter uzunluğunda olmalı
            </li>
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              Büyük ve küçük harf içermeli
            </li>
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              En az bir rakam içermeli
            </li>
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              Tahmin edilmesi zor olmalı
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;