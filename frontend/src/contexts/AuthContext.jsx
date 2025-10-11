import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  admin: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ADMIN: 'SET_ADMIN'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        admin: action.payload.admin,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        admin: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        admin: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.SET_ADMIN:
      return {
        ...state,
        admin: action.payload,
        isAuthenticated: true,
        loading: false
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('adminToken', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('adminToken');
    }
  }, [state.token]);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:5000/api/auth/verify');
        
        if (response.data.success) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              admin: response.data.data.admin,
              token
            }
          });
        } else {
          throw new Error('Token verification failed');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['Authorization'];
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    verifyToken();
  }, []);

  // Login function
  const login = useCallback(async (username, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.data.data
        });
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};