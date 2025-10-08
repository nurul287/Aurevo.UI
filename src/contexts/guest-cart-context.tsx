import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface GuestCartContextType {
  sessionId: string;
  generateSessionId: () => string;
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(
  undefined
);

interface GuestCartProviderProps {
  children: ReactNode;
}

export const GuestCartProvider = ({ children }: GuestCartProviderProps) => {
  // Initialize sessionId immediately from localStorage or generate one
  const getInitialSessionId = () => {
    if (typeof window === "undefined") return "";

    let storedSessionId = localStorage.getItem("guest_session_id");
    if (!storedSessionId) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 15);
      storedSessionId = `guest_${timestamp}_${randomStr}`;
      localStorage.setItem("guest_session_id", storedSessionId);
    }
    return storedSessionId;
  };

  const [sessionId, setSessionId] = useState<string>(getInitialSessionId);

  const generateSessionId = useMemo(() => {
    return () => {
      // Generate a unique session ID for guest users
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 15);
      return `guest_${timestamp}_${randomStr}`;
    };
  }, []);

  useEffect(() => {
    // Ensure sessionId is set (this will only run if it's empty)
    if (!sessionId) {
      const storedSessionId = getInitialSessionId();
      setSessionId(storedSessionId);
    }
  }, [sessionId]);

  const value: GuestCartContextType = useMemo(
    () => ({
      sessionId,
      generateSessionId,
    }),
    [sessionId, generateSessionId]
  );

  return (
    <GuestCartContext.Provider value={value}>
      {children}
    </GuestCartContext.Provider>
  );
};

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (context === undefined) {
    throw new Error("useGuestCart must be used within a GuestCartProvider");
  }
  return context;
};
