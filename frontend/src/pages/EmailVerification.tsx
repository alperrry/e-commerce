import React, { useState, useEffect,useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fi';

const FiMail = Icons.FiMail as any;
const FiCheck = Icons.FiCheck as any;
const FiX = Icons.FiX as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiArrowLeft = Icons.FiArrowLeft as any;

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
   const hasCalledVerify = useRef(false); // Bu satırı ekleyin
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

useEffect(() => {
  if (hasCalledVerify.current) return; // Zaten çağrıldıysa çık
  
  if (token && email) {
    hasCalledVerify.current = true; // Çağrıldı olarak işaretle
    verifyEmail();
  } else {
    setStatus('error');
    setMessage('Geçersiz doğrulama linki. Token veya email parametresi eksik.');
  }
}, []);
  

  const verifyEmail = async () => {
  try {
    // Debug logları
    console.log('Original token:', token);
    console.log('Original email:', email);
    
    // Token'ı decode et
    const decodedToken = token ? decodeURIComponent(token) : null;
    
    console.log('Decoded token:', decodedToken);
    
    const response = await fetch('http://localhost:5288/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        token: decodedToken
      })
    });

      const data = await response.json();
// Debug logları buraya ekleyin
console.log('Response status:', response.ok);
console.log('Response data:', data);
console.log('Setting status to:', response.ok ? 'success' : 'error');
      if (response.ok) {
        setStatus('success');
        setMessage('Email adresiniz başarıyla doğrulandı! Artık tüm özelliklerden yararlanabilirsiniz.');
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/', { 
            state: { message: 'Email doğrulandı! Giriş yapabilirsiniz.' }
          });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Email doğrulama işlemi başarısız oldu.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
    
  };

  const resendVerificationEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const response = await fetch('http://localhost:5288/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Doğrulama emaili tekrar gönderildi. Lütfen email kutunuzu kontrol edin.');
      } else {
        setMessage(data.message || 'Email gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <FiX className="w-8 h-8 text-red-600" />
          </div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Email Doğrulanıyor...';
      case 'success':
        return '🎉 Email Doğrulandı!';
      case 'error':
        return '❌ Doğrulama Başarısız';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
          </Link>
          <p className="text-gray-600 mt-2">Email Doğrulama</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Status Icon */}
          {getStatusIcon()}

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusTitle()}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Email Info */}
          {email && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <FiMail className="w-4 h-4 mr-2" />
                <span className="font-medium">{email}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <>
                <Link
                  to="/login"
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 inline-block"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/"
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300 inline-block"
                >
                  Ana Sayfaya Dön
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <button
                  onClick={resendVerificationEmail}
                  disabled={isResending || !email}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="w-5 h-5 mr-2" />
                      Tekrar Gönder
                    </>
                  )}
                </button>
                <Link
                  to="/register"
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300 inline-block"
                >
                  Yeni Hesap Oluştur
                </Link>
              </>
            )}

            {status === 'loading' && (
              <div className="text-sm text-gray-500">
                Lütfen bekleyin, işleminiz gerçekleştiriliyor...
              </div>
            )}
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
          <h3 className="font-semibold text-gray-800 mb-3">Sorun mu yaşıyorsunuz?</h3>
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
              Bağlantı 24 saat geçerlidir
            </li>
            <li className="flex items-start">
              <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              Sorun devam ederse müşteri hizmetlerimize ulaşın
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;