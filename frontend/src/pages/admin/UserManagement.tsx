import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';

const FiUsers = Icons.FiUsers as any;
const FiSearch = Icons.FiSearch as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiX = Icons.FiX as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiMail = Icons.FiMail as any;
const FiPhone = Icons.FiPhone as any;
const FiCalendar = Icons.FiCalendar as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiDollarSign = Icons.FiDollarSign as any;
const FiUserCheck = Icons.FiUserCheck as any;
const FiUserX = Icons.FiUserX as any;
const FiEye = Icons.FiEye as any;
const FiEdit = Icons.FiEdit as any;
const FiSave = Icons.FiSave as any;
const FiShield = Icons.FiShield as any;

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  roles: string[];
}

interface UsersResponse {
  users: AdminUser[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUserRoles, setEditingUserRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [currentPage, searchQuery]);

  const fetchRoles = async () => {
    try {
      const response = await api.get<string[]>('/admin/roles');
      setAvailableRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await api.get<UsersResponse>(`/admin/users?${params}`);
      
      let filteredUsers = response.data.users;

      // Apply filters on frontend
      if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          statusFilter === 'active' ? user.isActive : !user.isActive
        );
      }

      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.roles.includes(roleFilter)
        );
      }

      setUsers(filteredUsers);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (userId: number, newStatus: boolean) => {
    const action = newStatus ? 'aktif' : 'pasif';
    const user = users.find(u => u.id === userId);
    
    if (!user) return;

    if (!window.confirm(`"${user.firstName} ${user.lastName}" kullanıcısını ${action} yapmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const endpoint = newStatus ? 'activate' : 'deactivate';
      await api.put(`/admin/users/${userId}/${endpoint}`);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isActive: newStatus }
            : user
        )
      );

      // Update selected user if open
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isActive: newStatus });
      }

    } catch (error: any) {
      console.error('Error updating user status:', error);
      setError(error.response?.data?.message || 'Kullanıcı durumu değiştirilirken hata oluştu');
    }
  };

  const closeDetailModal = () => {
    setSelectedUser(null);
    setIsDetailModalOpen(false);
  };

  const openDetailModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const openRoleModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditingUserRoles([...user.roles]);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setSelectedUser(null);
    setEditingUserRoles([]);
    setIsRoleModalOpen(false);
  };

  const handleRoleToggle = (role: string) => {
    setEditingUserRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const saveUserRoles = async () => {
    if (!selectedUser) return;

    setSavingRoles(true);
    try {
      await api.put(`/admin/users/${selectedUser.id}/roles`, {
        roles: editingUserRoles
      });

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, roles: [...editingUserRoles] }
            : user
        )
      );

      closeRoleModal();
    } catch (error: any) {
      console.error('Error updating user roles:', error);
      setError(error.response?.data?.message || 'Kullanıcı rolleri güncellenirken hata oluştu');
    } finally {
      setSavingRoles(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Aktif' : 'Pasif'}
      </span>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredUsersForStats = users.filter(user => {
    if (statusFilter !== 'all' && (statusFilter === 'active' ? !user.isActive : user.isActive)) {
      return false;
    }
    if (roleFilter !== 'all' && !user.roles.includes(roleFilter)) {
      return false;
    }
    return true;
  });

  const getRoleBadges = (roles: string[]) => {
    const roleColors: { [key: string]: string } = {
      'Admin': 'bg-red-100 text-red-800',
      'Seller': 'bg-blue-100 text-blue-800',
      'User': 'bg-gray-100 text-gray-800'
    };

    return roles.map(role => (
      <span 
        key={role}
        className={`inline-flex items-center px-2 py-1 text-xs rounded-full mr-1 ${
          roleColors[role] || 'bg-purple-100 text-purple-800'
        }`}
      >
        <FiShield size={10} className="mr-1" />
        {role}
      </span>
    ));
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Güncelleniyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <FiAlertCircle className="text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kullanıcı ara (isim, email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </form>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tüm Roller</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tümü', color: 'bg-gray-100 text-gray-700' },
                { value: 'active', label: 'Aktif', color: 'bg-green-100 text-green-700' },
                { value: 'inactive', label: 'Pasif', color: 'bg-red-100 text-red-700' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    statusFilter === filter.value
                      ? 'bg-purple-600 text-white'
                      : `${filter.color} hover:bg-gray-200`
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-lg text-purple-600">{totalItems}</div>
              <div>Toplam Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-green-600">
                {users.filter(u => u.isActive).length}
              </div>
              <div>Aktif</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-red-600">
                {users.filter(u => !u.isActive).length}
              </div>
              <div>Pasif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredUsersForStats.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiUsers className="mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">Kullanıcı bulunamadı</h3>
            <p>
              {searchQuery || statusFilter !== 'all'
                ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.' 
                : 'Henüz kullanıcı bulunmuyor.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Üyelik Bilgileri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alışveriş
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsersForStats.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                            <FiUsers className="text-purple-600" size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <FiMail size={14} className="mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center">
                              <FiPhone size={14} className="mr-2 text-gray-400" />
                              {user.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {getRoleBadges(user.roles)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar size={14} className="mr-2 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <FiShoppingBag size={14} className="mr-2 text-gray-400" />
                            {user.orderCount} sipariş
                          </div>
                          <div className="flex items-center">
                            <FiDollarSign size={14} className="mr-2 text-gray-400" />
                            <span className="font-medium text-green-600">
                              {formatCurrency(user.totalSpent)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailModal(user)}
                            className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded"
                            title="Detayları Görüntüle"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => openRoleModal(user)}
                            className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                            title="Rolleri Düzenle"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.id, !user.isActive)}
                            className={`p-1 rounded ${
                              user.isActive 
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            {user.isActive ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === page
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight />
                    </button>
                    <div>
                      <label className="text-sm text-gray-500">Roller</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedUser ? getRoleBadges(selectedUser.roles) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Kullanıcı Detayları
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Kişisel Bilgiler</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Ad Soyad</label>
                      <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    {selectedUser.phoneNumber && (
                      <div>
                        <label className="text-sm text-gray-500">Telefon</label>
                        <p className="font-medium">{selectedUser.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Hesap Bilgileri</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Kullanıcı ID</label>
                      <p className="font-medium">#{selectedUser.id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Üyelik Tarihi</label>
                      <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Durum</label>
                      <div className="mt-1">
                        {selectedUser ? getStatusBadge(selectedUser.isActive) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shopping Statistics */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Alışveriş İstatistikleri</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiShoppingBag className="text-blue-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm text-blue-600">Toplam Sipariş</p>
                        <p className="text-lg font-semibold text-blue-800">{selectedUser.orderCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiDollarSign className="text-green-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm text-green-600">Toplam Harcama</p>
                        <p className="text-lg font-semibold text-green-800">
                          {formatCurrency(selectedUser.totalSpent)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    if (selectedUser) {
                      closeDetailModal();
                      openRoleModal(selectedUser);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FiEdit />
                  Rolleri Düzenle
                </button>
                <button
                  onClick={() => {
                    if (selectedUser) {
                      handleStatusChange(selectedUser.id, !selectedUser.isActive);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    selectedUser?.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedUser?.isActive ? <FiUserX /> : <FiUserCheck />}
                  {selectedUser?.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Edit Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Kullanıcı Rollerini Düzenle
              </h3>
              <button
                onClick={closeRoleModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <FiUsers className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}</p>
                    <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                  </div>
                </div>
              </div>

              {/* Current Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Roller
                </label>
                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedUser && selectedUser.roles.length > 0 ? (
                    getRoleBadges(selectedUser.roles)
                  ) : (
                    <span className="text-sm text-gray-500">Henüz rol atanmamış</span>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Roller Seç
                </label>
                <div className="space-y-2">
                  {availableRoles.map(role => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingUserRoles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                        <FiShield className="mr-1" size={14} />
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={closeRoleModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  onClick={saveUserRoles}
                  disabled={savingRoles}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {savingRoles ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave />
                  )}
                  {savingRoles ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;