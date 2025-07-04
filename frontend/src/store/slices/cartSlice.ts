import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '../../types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isCartOpen: boolean;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  isCartOpen: false,
};

// Helper function to get session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async () => {
    const sessionId = getSessionId();
    const response = await api.get<Cart>('/cart', {
      headers: {
        'X-Session-Id': sessionId,
      },
    });
    return response.data;
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: AddToCartRequest) => {
    const sessionId = getSessionId();
    const response = await api.post<Cart>('/cart/add', data, {
      headers: {
        'X-Session-Id': sessionId,
      },
    });
    return response.data;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (data: UpdateCartItemRequest) => {
    const sessionId = getSessionId();
    const response = await api.put<Cart>('/cart/update', data, {
      headers: {
        'X-Session-Id': sessionId,
      },
    });
    return response.data;
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId: number) => {
    const sessionId = getSessionId();
    await api.delete(`/cart/remove/${cartItemId}`, {
      headers: {
        'X-Session-Id': sessionId,
      },
    });
    return cartItemId;
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async () => {
    const sessionId = getSessionId();
    await api.delete('/cart/clear', {
      headers: {
        'X-Session-Id': sessionId,
      },
    });
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      });

    // Add to Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.isCartOpen = true; // Open cart drawer after adding
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add to cart';
      });

    // Update Cart Item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update cart item';
      });

    // Remove from Cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.cart) {
          state.cart.cartItems = state.cart.cartItems.filter(
            (item) => item.id !== action.payload
          );
          // Recalculate total
          state.cart.totalAmount = state.cart.cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to remove from cart';
      });

    // Clear Cart
    builder
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
        state.isCartOpen = false;
      });
  },
});

export const { toggleCart, openCart, closeCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;