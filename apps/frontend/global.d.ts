// Global type declarations to resolve JSX.IntrinsicElements error
// Types are installed in Docker container, this file provides types for the IDE
// This is a workaround for IDE type checking when node_modules is in Docker container

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends any {}
    interface ElementClass extends any {}
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

// Declare React namespace and common types
declare namespace React {
  interface ReactElement<P = any, T = any> {
    type: T;
    props: P;
    key: string | null;
  }
  
  interface Component<P = {}, S = {}, SS = any> {
    props: P;
    state: S;
  }
  
  type ReactNode = ReactElement | string | number | boolean | null | undefined;
  
  interface MouseEvent<T = Element> {
    stopPropagation(): void;
    preventDefault(): void;
    currentTarget: T;
    target: T;
  }
  
  function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(factory: () => T, deps?: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T;
  function useRef<T>(initialValue: T): { current: T };
}

// Declare react module
declare module 'react' {
  export = React;
  export as namespace React;
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps?: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export type ReactElement<P = any, T = any> = React.ReactElement<P, T>;
  export type Component<P = {}, S = {}, SS = any> = React.Component<P, S, SS>;
  export type ReactNode = React.ReactNode;
  export interface MouseEvent<T = Element> extends React.MouseEvent<T> {}
}

// Declare react/jsx-runtime
declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function Fragment(props: { children?: any }): any;
}

// Declare react-dom
declare module 'react-dom' {
  export function render(element: any, container: any): any;
}


export { };

