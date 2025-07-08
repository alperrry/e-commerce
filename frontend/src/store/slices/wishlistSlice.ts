import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
}

const initialState: WishlistState = {
  items: JSON.parse(localStorage.getItem('wishlist') || '[]'),
  isLoading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const existsIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existsIndex >= 0) {
        state.items.splice(existsIndex, 1);
      } else {
        state.items.push(action.payload);
      }
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;