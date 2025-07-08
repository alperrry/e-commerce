import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import api from '../services/api';
import { Address } from '../types';

const FiUser = Icons.FiUser as any;
const FiMail = Icons.FiMail as any;
const FiPhone = Icons.FiPhone as any;
const FiLock = Icons.FiLock as any;
const FiMapPin = Icons.FiMapPin as any;
const FiEdit2 = Icons.FiEdit2 as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiPlus = Icons.FiPlus as any;
const FiCheck = Icons.FiCheck as any;
const FiX = Icons.FiX as any;
const FiHome = Icons.FiHome as any;

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AddressForm {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form hooks
  const profileForm = useForm<ProfileForm>();
  const passwordForm = useForm<PasswordForm>();
  const addressForm = useForm<AddressForm>({
    defaultValues: {
      country: 'Türkiye',
      isDefault: false
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }
    
    // Set profile form values
    profileForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || ''
    });

    // Fetch addresses
    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get<Address[]>('/user/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleProfileUpdate = async (data: ProfileForm) => {
    try {
      setLoading(true);
      await api.put('/user/profile', data);
      setMessage({ type: 'success', text: 'Profil bilgileriniz güncellendi.' });
      // Update user in Redux store would go here
    } catch (error) {
      setMessage({ type: 'error', text: 'Profil güncellenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    try {
      setLoading(true);
      await api.post('/user/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
      passwordForm.reset();
    } catch (error) {
      setMessage({ type: 'error', text: 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (data: AddressForm) => {
    try {
      setLoading(true);
      if (editingAddressId) {
        await api.put(`/user/addresses/${editingAddressId}`, data);
        setMessage({ type: 'success', text: 'Adres güncellendi.' });
      } else {
        await api.post('/user/addresses', data);
        setMessage({ type: 'success', text: 'Adres eklendi.' });
      }
      addressForm.reset();
      setIsAddingAddress(false);
      setEditingAddressId(null);
      fetchAddresses();
    } catch (error) {
      setMessage({ type: 'error', text: 'Adres kaydedilemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.delete(`/user/addresses/${id}`);
      setMessage({ type: 'success', text: 'Adres silindi.' });
      fetchAddresses();
    } catch (error) {
      setMessage({ type: 'error', text: 'Adres silinemedi.' });
    }
  };

  const handleEditAddress = (address: Address) => {
    addressForm.reset({
      title: address.title,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Hesabım</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'profile'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiUser className="inline mr-2" />
          Profil Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'password'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiLock className="inline mr-2" />
          Şifre Değiştir
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'addresses'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiMapPin className="inline mr-2" />
          Adreslerim
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Profil Bilgileri</h2>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUser className="inline mr-1" />
                    Ad
                  </label>
                  <input
                    {...profileForm.register('firstName', { required: 'Ad zorunludur' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {profileForm.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiUser className="inline mr-1" />
                    Soyad
                  </label>
                  <input
                    {...profileForm.register('lastName', { required: 'Soyad zorunludur' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {profileForm.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiMail className="inline mr-1" />
                  E-posta
                </label>
                <input
                  {...profileForm.register('email', { 
                    required: 'E-posta zorunludur',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi giriniz'
                    }
                  })}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {profileForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiPhone className="inline mr-1" />
                  Telefon
                </label>
                <input
                  {...profileForm.register('phoneNumber', {
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Geçerli bir telefon numarası giriniz'
                    }
                  })}
                  placeholder="5XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {profileForm.formState.errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Şifre Değiştir</h2>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  {...passwordForm.register('currentPassword', { required: 'Mevcut şifre zorunludur' })}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  {...passwordForm.register('newPassword', {
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
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre Tekrar
                </label>
                <input
                  {...passwordForm.register('confirmPassword', {
                    required: 'Şifre tekrarı zorunludur',
                    validate: value => value === passwordForm.watch('newPassword') || 'Şifreler eşleşmiyor'
                  })}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Adreslerim</h2>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <FiPlus />
                Yeni Adres Ekle
              </button>
            )}
          </div>

          {/* Address Form */}
          {isAddingAddress && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingAddressId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </h3>
              <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres Başlığı *
                  </label>
                  <input
                    {...addressForm.register('title', { required: 'Adres başlığı zorunludur' })}
                    placeholder="Ev, İş, vb."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {addressForm.formState.errors.title && (
                    <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                    <input
                      {...addressForm.register('firstName', { required: 'Ad zorunludur' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {addressForm.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                    <input
                      {...addressForm.register('lastName', { required: 'Soyad zorunludur' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {addressForm.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input
                    {...addressForm.register('phone', { 
                      required: 'Telefon zorunludur',
                      pattern: {
                        value: /^[0-9]{10,11}$/,
                        message: 'Geçerli bir telefon numarası giriniz'
                      }
                    })}
                    placeholder="5XXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {addressForm.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
                  <input
                    {...addressForm.register('addressLine1', { required: 'Adres zorunludur' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {addressForm.formState.errors.addressLine1 && (
                    <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.addressLine1.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres 2 (İsteğe bağlı)</label>
                  <input
                    {...addressForm.register('addressLine2')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İl *</label>
                    <input
                      {...addressForm.register('city', { required: 'İl zorunludur' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {addressForm.formState.errors.city && (
                      <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                    <input
                      {...addressForm.register('state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu *</label>
                    <input
                      {...addressForm.register('postalCode', { required: 'Posta kodu zorunludur' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {addressForm.formState.errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...addressForm.register('isDefault')}
                    className="mr-2 text-purple-600"
                  />
                  <span className="text-sm">Varsayılan adres olarak ayarla</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setEditingAddressId(null);
                      addressForm.reset();
                    }}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow p-6 relative">
                {address.isDefault && (
                  <span className="absolute top-4 right-4 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                    Varsayılan
                  </span>
                )}
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FiHome className="text-purple-600" />
                  {address.title}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  {address.firstName} {address.lastName}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  {address.city}, {address.state && `${address.state},`} {address.postalCode}
                </p>
                <p className="text-gray-600 text-sm mb-4">{address.phone}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <FiEdit2 size={16} />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <FiTrash2 size={16} />
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          {addresses.length === 0 && !isAddingAddress && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz kayıtlı adresiniz yok.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;