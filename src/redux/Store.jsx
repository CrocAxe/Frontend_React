import { configureStore } from "@reduxjs/toolkit";
import authReducer from './AuthSlice';
import profileReducer from './ProfileSlice';

export const store = configureStore({
    reducer: {
        auth : authReducer,
        profile : profileReducer,
    }
})