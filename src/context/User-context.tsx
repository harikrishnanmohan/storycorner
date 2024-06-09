import { ReactNode, createContext, useState } from "react";

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
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const login = (user: FirebaseUser) => {
    setUser(user);
  };
  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
