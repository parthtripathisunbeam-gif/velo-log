import { useState, useEffect, useCallback } from 'react';
import { User, getUser, setUser as saveUser, clearUser } from '@/lib/storage';

export const useAuth = () => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUser();
    setUserState(storedUser);
    setIsLoading(false);
  }, []);

  const login = useCallback((name: string, password: string) => {
    const newUser: User = { name, password };
    saveUser(newUser);
    setUserState(newUser);
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUserState(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
