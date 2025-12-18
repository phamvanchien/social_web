import { combineReducers } from '@reduxjs/toolkit';
import userSlice from './user.redux'

const rootReducer = combineReducers({
  userSlice: userSlice
});

export default rootReducer;