import * as React from 'react';
import type { DefaultToastOptions as BaseDefaultToastOptions, Renderable, ToasterProps, ToastOptions } from 'react-hot-toast';

declare module 'react-hot-toast' {
  type ToastHandler = (message: Renderable, opts?: ToastOptions) => string;

  interface ToastPromiseMessages<T> {
    loading: Renderable;
    success?: ValueOrFunction<Renderable, T>;
    error?: ValueOrFunction<Renderable, any>;
  }

  type ValueOrFunction<TValue, TArg> = TValue | ((arg: TArg) => TValue);

  type DefaultToastOptions = BaseDefaultToastOptions & {
    info?: ToastOptions;
  };

  const toast: {
    (message: Renderable, opts?: ToastOptions): string;
    error: ToastHandler;
    success: ToastHandler;
    loading: ToastHandler;
    custom: ToastHandler;
    info: ToastHandler;
    dismiss(toastId?: string, toasterId?: string): void;
    dismissAll(toasterId?: string): void;
    remove(toastId?: string, toasterId?: string): void;
    removeAll(toasterId?: string): void;
    promise<T>(promise: Promise<T> | (() => Promise<T>), msgs: ToastPromiseMessages<T>, opts?: DefaultToastOptions): Promise<T>;
  };

  const Toaster: React.FC<ToasterProps>;

  export default toast;
  export { Toaster };
}
