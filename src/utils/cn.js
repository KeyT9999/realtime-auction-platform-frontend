// Mục đích tệp: Trien khai logic/chuc nang chinh cua file cn.
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
