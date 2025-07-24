import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as Icons from 'react-icons/fi';

const FiMail = Icons.FiMail as any;
const FiArrowLeft = Icons.FiArrowLeft as any;
const FiCheck = Icons.FiCheck as any;
const FiSend = Icons.FiSend as any;

interface ForgotPasswordData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordData>();

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5288/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(result.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async () => {
    const email = getValues('email');
    if (!email) return;
    
    setIsLoading(true);
    try {
      await fetch('http://localhost:5288/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      // Her zaman başarılı mesaj göster (güvenlik için)
    } catch (error) {
      // Sessizce handle et
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
            </Link>
            <p className="text-gray-600 mt-2">Şifre Sıfırlama</p>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              📧 Email Gönderildi!
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Şifre sıfırlama talimatları email adresinize gönderildi. 
              Lütfen email kutunuzu kontrol edin.
            </p>

            {/* Email Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <FiMail className="w-4 h-4 mr-2" />
                <span className="font-medium">{getValues('email')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 inline-block"
              >
                Giriş Sayfasına Dön
              </Link>
              
              <button
                onClick={resendEmail}
                disabled={isLoading}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5 mr-2" />
                    Tekrar Gönder
                  </>
                )}
              </button>
            </div>

            {/* Back Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center transition"
              >
                <FiArrowLeft className="w-4 h-4 mr-1" />
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Email gelmedi mi?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                Spam/gereksiz klasörünüzü kontrol edin
              </li>
              <li className="flex items-start">
                <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                Email adresinizi doğru yazdığınızdan emin olun
              </li>
              <li className="flex items-start">
                <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                Bağlantı 1 saat geçerlidir
              </li>
              <li className="flex items-start">
                <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                "Tekrar Gönder" butonunu kullanabilirsiniz
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
          </Link>
          <p className="text-gray-600 mt-2">Şifrenizi mi unuttunuz?</p>
        </div>

        {/* Forgot Password Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Şifrenizi Sıfırlayın</h2>
            <p className="text-gray-600 text-sm">
              Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5 mr-2" />
                  Şifre Sıfırlama Linki Gönder
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
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

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📌 Önemli Bilgiler</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              Şifre sıfırlama bağlantısı 1 saat geçerlidir
            </li>
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              Kayıtlı email adresinizi kullanmanız gerekmektedir
            </li>
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              Güvenlik nedeniyle her durumda "başarılı" mesajı görüntülenir
            </li>
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              Hesabınız yoksa önce kayıt olmanız gerekir
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;