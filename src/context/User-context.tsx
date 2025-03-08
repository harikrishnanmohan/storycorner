import { onAuthStateChanged, signOut } from "firebase/auth";
import { ReactNode, createContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

export type FirebaseUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
};

interface UserContextType {
  user: FirebaseUser | null;
  login: (user: FirebaseUser) => void;
  logout: () => void;
  loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
          uid: firebaseUser.uid,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (user: FirebaseUser) => {
    setUser(user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
