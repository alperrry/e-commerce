import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as Icons from 'react-icons/fi';
import { AppDispatch, RootState } from '../store';
import { login } from '../store/slices/authSlice';
import { LoginCredentials } from '../types';
import { rememberMeUtils } from '../utils/rememberMe';

const FiMail = Icons.FiMail as any;
const FiLock = Icons.FiLock as any;
const FiEye = Icons.FiEye as any;
const FiEyeOff = Icons.FiEyeOff as any;
const FiCheckCircle = Icons.FiCheckCircle as any;

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoginCredentials>();

  const redirect = searchParams.get('redirect') || '/';
  const emailValue = watch('email');

  // Component mount olduğunda
  useEffect(() => {
    // URL state'den mesaj al (email verification'dan geliyorsa)
    const state = location.state as { message?: string };
    if (state?.message) {
      setSuccessMessage(state.message);
      // Mesajı gösterdikten sonra state'i temizle
      window.history.replaceState({}, document.title);
    }

    // Hatırlanan kullanıcı bilgilerini yükle
    const rememberedUser = rememberMeUtils.getRememberedUser();
    if (rememberedUser) {
      setValue('email', rememberedUser.email);
      setRememberMe(true);
    }

    // 5 saniye sonra success mesajını gizle
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [setValue, location.state, successMessage]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      
      // Remember Me işlemi
      if (rememberMe) {
        // Kullanıcı bilgilerini kaydet
        rememberMeUtils.saveUserInfo(
          data.email, 
          result.user?.firstName || '', 
          result.user?.lastName || ''
        );
      } else {
        // Remember Me kapalıysa kayıtlı bilgileri temizle
        rememberMeUtils.clearRememberedUser();
      }
      
      navigate(redirect);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    // Eğer remember me kapatılıyorsa hemen temizle
    if (!checked) {
      rememberMeUtils.clearRememberedUser();
    } else if (emailValue) {
      // Eğer email varsa hemen kaydet
      rememberMeUtils.saveEmail(emailValue);
    }
  };

  // Email değiştiğinde remember me aktifse kaydet
  useEffect(() => {
    if (rememberMe && emailValue) {
      rememberMeUtils.saveEmail(emailValue);
    }
  }, [emailValue, rememberMe]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
          </Link>
          <p className="text-gray-600 mt-2">Hesabınıza giriş yapın</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <FiCheckCircle className="mr-2 text-green-500" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'E-posta adresi zorunludur',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi giriniz'
                    }
                  })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="ornek@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Şifre zorunludur',
                    minLength: {
                      value: 6,
                      message: 'Şifre en az 6 karakter olmalıdır'
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
                {rememberMe && (
                  <span className="ml-1 text-xs text-purple-500">✓</span>
                )}
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Şifremi unuttum
              </Link>
            </div>

            {/* Remember Me Info */}
            {rememberMe && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-700">
                  📧 E-posta adresiniz hatırlanacak ve bir sonraki girişinizde otomatik doldurulacak.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">veya</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 space-y-3">
            <button 
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              onClick={() => {
                // Google OAuth entegrasyonu buraya gelecek
                alert('Google OAuth entegrasyonu henüz tamamlanmadı. Sonraki adımda ekleyeceğiz!');
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700">Google ile giriş yap</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Hesabınız yok mu?{' '}
              <Link
                to="/register"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700 text-center">
            <strong>Demo Hesap:</strong> demo@example.com / demo123
          </p>
        </div>

        {/* Remember Me Info */}
        {rememberMeUtils.isRememberMeEnabled() && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              💡 Bu cihazda e-posta adresiniz hatırlanıyor
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;