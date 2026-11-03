import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ShowToast = (message: string, long?: boolean) => void;
const Ctx = createContext<ShowToast>(() => {});
export const useToast = () => useContext(Ctx);

/** Android-style toast (dark pill near the bottom) that works the same on iOS. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback<ShowToast>((message, long) => {
    setMsg(message);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }, long ? 3500 : 2000);
  }, [opacity]);

  return (
    <Ctx.Provider value={show}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 72, alignItems: 'center', opacity, zIndex: 999,
        }}
      >
        <Animated.View style={{ backgroundColor: 'rgba(50,50,50,0.95)', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, maxWidth: '100%' }}>
          <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>{msg}</Text>
        </Animated.View>
      </Animated.View>
    </Ctx.Provider>
  );
}
