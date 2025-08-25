import { useCallback } from 'react';

export function useInitials() {
  return useCallback((fullName: string): string => {
    if (!fullName) return "";

    // Pisahkan kata & buang spasi kosong
    const names = fullName.trim().split(/\s+/).filter(Boolean);

    if (names.length === 0) return "";
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  }, []);
}
