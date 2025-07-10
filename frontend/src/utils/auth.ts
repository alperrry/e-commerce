// src/utils/auth.ts

export const isAdmin = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    // Microsoft schema'sındaki role claim'i
    const roleClaim = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    
    console.log('Role claim:', roleClaim); // Debug için
    
    if (Array.isArray(roleClaim)) {
      return roleClaim.includes("Admin");
    }

    return roleClaim === "Admin";
  } catch (error) {
    console.log('isAdmin error:', error);
    return false;
  }
};

export const getUserRole = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Debug fonksiyonunu kaldırabilirsiniz artık
export const debugAuth = (): void => {
  const token = localStorage.getItem('token');
  console.log('Token:', token);
  
  if (!token) {
    console.log('Token bulunamadı!');
    return;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    
    console.log('FULL Decoded payload:', JSON.stringify(decodedPayload, null, 2));
    console.log('Role:', decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
    
  } catch (error) {
    console.log('Token decode hatası:', error);
  }
};