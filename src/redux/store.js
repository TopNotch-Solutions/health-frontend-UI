import { configureStore } from '@reduxjs/toolkit';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import sidebarReducer from './reducers/sidebarReducer';
import authReducer from "./reducers/authReducer";
import serverReducer from "./reducers/serverReducer";
import storage from 'redux-persist/lib/storage';
import tabsReducer from './reducers/tabsReducer';
import authenticationReducer  from './reducers/twoFactorReducer';
import isSubmittingReducer from './reducers/submittingReducer';
import userIdReducer from './reducers/userIdReducer';
const persistConfig = {
  key: 'root',
  storage,
  whitelist:["auth","server","sidebar","tabs","authentication", "submitting", "userId"],
  debug:true
};

const rootReducer = combineReducers({
  auth: authReducer,
  server: serverReducer,
  sidebar: sidebarReducer,
  tabs: tabsReducer,
  authentication:authenticationReducer,
  submitting: isSubmittingReducer,
  userId: userIdReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store =  configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      immutableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };