// src/utils/rememberMe.ts dosyası oluşturun

interface RememberedUser {
  email: string;
  firstName: string;
  lastName: string;
  rememberMe: boolean;
}

const REMEMBER_ME_KEY = 'ecommerce_remembered_user';

export const rememberMeUtils = {
  // Kullanıcı bilgilerini kaydet
  saveUserInfo: (email: string, firstName: string, lastName: string) => {
    const userData: RememberedUser = {
      email,
      firstName,
      lastName,
      rememberMe: true
    };
    
    try {
      localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(userData));
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
  },

  // Kullanıcı bilgilerini getir
  getRememberedUser: (): RememberedUser | null => {
    try {
      const stored = localStorage.getItem(REMEMBER_ME_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
    }
    return null;
  },

  // Sadece email'i kaydet (login için)
  saveEmail: (email: string) => {
    try {
      const existing = rememberMeUtils.getRememberedUser();
      if (existing) {
        existing.email = email;
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(existing));
      } else {
        const userData: Partial<RememberedUser> = {
          email,
          rememberMe: true
        };
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.warn('Error saving email:', error);
    }
  },

  // Kayıtlı email'i getir
  getRememberedEmail: (): string => {
    const remembered = rememberMeUtils.getRememberedUser();
    return remembered?.email || '';
  },

  // Remember me verilerini temizle
  clearRememberedUser: () => {
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  },

  // Remember me aktif mi kontrol et
  isRememberMeEnabled: (): boolean => {
    const remembered = rememberMeUtils.getRememberedUser();
    return remembered?.rememberMe || false;
  }
};