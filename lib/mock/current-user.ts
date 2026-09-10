// lib/mock/current-user.ts
'use client';

import { useEffect, useState } from 'react';
import {
  mockUsers,
  MockUser,
  DEFAULT_MOCK_USER_ID,
} from '@/components/mock/data';

const STORAGE_KEY = 'eagle.mock.currentUserId';
const CHANGE_EVENT = 'eagle:user-changed';

export function getCurrentUser(): MockUser {
  if (typeof window === 'undefined') {
    return mockUsers.find((u) => u.id === DEFAULT_MOCK_USER_ID) ?? mockUsers[0];
  }
  const id = window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_MOCK_USER_ID;
  return mockUsers.find((u) => u.id === id) ?? mockUsers[0];
}

export function setCurrentUser(id: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useCurrentUser(): MockUser {
  const [user, setUser] = useState<MockUser>(() => getCurrentUser());

  useEffect(() => {
    const handler = () => setUser(getCurrentUser());
    window.addEventListener(CHANGE_EVENT, handler);
    // also sync across tabs
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUser(getCurrentUser());
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  return user;
}