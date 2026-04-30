import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('mednova_token');
    if (!token) { setLoading(false); return; }
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('mednova_token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('mednova_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  const googleLogin = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    localStorage.setItem('mednova_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    localStorage.setItem('mednova_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('mednova_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  const can = (action, resource) => {
    if (!user) return false;
    const role = user.role;
    const perms = {
      admin: { '*': true },
      doctor: {
        read: ['appointments', 'prescriptions', 'opd', 'ipd', 'inventory', 'patients', 'doctors'],
        write: ['appointments', 'prescriptions', 'opd', 'ipd'],
      },
      nurse: {
        read: ['appointments', 'prescriptions', 'opd', 'ipd', 'inventory', 'patients'],
        write: ['appointments', 'prescriptions', 'opd', 'ipd'],
      },
      pharmacist: {
        read: ['appointments', 'prescriptions', 'opd', 'ipd', 'inventory', 'patients'],
        write: ['inventory'],
      },
      receptionist: {
        read: ['appointments', 'prescriptions', 'opd', 'ipd', 'inventory', 'patients', 'doctors'],
        write: ['appointments', 'opd'],
      },
      patient: {
        read: ['appointments', 'prescriptions', 'doctors'],
        write: ['appointments'],
      },
      worker: {
        read: ['appointments', 'prescriptions', 'opd', 'ipd', 'inventory', 'patients', 'doctors'],
        write: [],
      },
    };
    if (role === 'admin') return true;
    const rolePerm = perms[role];
    if (!rolePerm) return false;
    if (rolePerm['*']) return true;
    return (rolePerm[action] || []).includes(resource);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
