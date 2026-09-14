import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@best-in-flights-booking/shared-core';

export interface UserState {
  current: AuthUser | null;
}

const initialState: UserState = {
  current: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.current = action.payload;
    },
    clearUser: (state) => {
      state.current = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
