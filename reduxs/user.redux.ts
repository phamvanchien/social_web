import { UserResponseType } from '@/types/user.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserSliceType {
  data: UserResponseType | null
  userUpdated?: UserResponseType
}

const initialState: UserSliceType = {
  data: null,
  userUpdated: undefined
};

const userSlice = createSlice({
  name: 'user logged',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserResponseType>) {
      state.data = action.payload;
    },
    setUserUpdated(state, action: PayloadAction<UserResponseType>) {
      state.userUpdated = action.payload;
    },
    updateUserAvatar(state, action: PayloadAction<string>) {
      if (state.data) {
        state.data.avatar = action.payload;
      }
    }
  },
});

export const { setUser, setUserUpdated, updateUserAvatar } = userSlice.actions;

export default userSlice.reducer;