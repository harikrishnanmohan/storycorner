import { ReactNode, useContext } from "react";
import { UserContext } from "../../context/User-context";
import { Navigate } from "react-router-dom";

const Protected = ({ children }: { children: ReactNode }) => {
  const UserCtx = useContext(UserContext);

  if (UserCtx?.user) return children;
  else return <Navigate to="/storycorner/login" />;
};

export default Protected;
