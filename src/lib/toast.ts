import { useState, useEffect } from 'react';

export type ToastType = {
  id: string;
  title: string;
  message: string;
  icon?: 'flame' | 'gift' | 'bell';
  onClick?: () => void;
  actionText?: string;
  onAction?: () => void;
};

type Listener = (toast: ToastType) => void;
let listeners: Listener[] = [];

export const toast = (t: Omit<ToastType, 'id'>) => {
  const newToast = { ...t, id: Math.random().toString(36).substr(2, 9) };
  listeners.forEach((l) => l(newToast));
};

export const subscribeToToasts = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
