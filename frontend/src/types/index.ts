// User Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  brand: string;
  categoryId: number;
  category?: Category;
  images?: ProductImage[];
  isFeatured: boolean;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  isMainImage: boolean;
  displayOrder: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number;
  parentCategory?: Category;
  subCategories?: Category[];
  products?: Product[];
  isActive: boolean;
}

// Cart Types
export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  cartItems: CartItem[];
  totalAmount: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: number;
  quantity: number;
}

// Order Types
export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  shippingFirstName: string;
  shippingLastName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentMethod: string;
  paymentTransactionId?: string;
  paymentDate?: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4,
  Refunded = 5
}

export interface CreateOrderRequest {
  addressId: number;
  paymentMethod: string;
}

// Address Types
export interface Address {
  id: number;
  userId: number;
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

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Filter Types
export interface ProductFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'price_desc' | 'newest' | 'popular';
}