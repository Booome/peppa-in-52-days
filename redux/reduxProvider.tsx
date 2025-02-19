"use client";

import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { PersistConfig, persistReducer, persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import storage from "redux-persist/lib/storage";

type AppState = {
  lastLesson: number;
  successLessons: {
    lesson: number;
    successCount: number;
  }[];
};

const initialState: AppState = {
  lastLesson: 1,
  successLessons: [],
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLastLesson: (state, action) => {
      state.lastLesson = action.payload;
    },
    addSuccessLesson: (state, action) => {
      const existingLesson = state.successLessons.find(
        (lesson) => lesson.lesson === action.payload.lesson,
      );
      if (existingLesson) {
        existingLesson.successCount += 1;
      } else {
        state.successLessons.push({
          lesson: action.payload.lesson,
          successCount: 1,
        });
      }
    },
  },
});

const persistConfig: PersistConfig<AppState> = {
  key: "app",
  storage: storage,
};

const persistedReducer = persistReducer(persistConfig, appSlice.reducer);

export const { setLastLesson, addSuccessLesson } = appSlice.actions;

const store = configureStore({
  reducer: {
    app: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REGISTER"],
      },
    }),
});

const persistor = persistStore(store);

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

export type AppStateType = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
