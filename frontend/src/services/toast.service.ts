// src/services/toast.service.ts
import { toast } from '../hooks/use-toast';

export const ToastService = {
  error(message: string) {
    toast({
      variant: "destructive",
      title: "Error",
      description: message
    });
  },

  success(message: string, duration: number = 2000) {
    toast({
      title: "Success",
      description: message,
      variant: "success",
      duration: duration
    });
  },

  // Poți adăuga și alte metode după necesitate
  info(message: string) {
    toast({
      title: "Info",
      description: message
    });
  }
};