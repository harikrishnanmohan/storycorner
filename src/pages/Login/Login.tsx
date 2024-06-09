import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atom/Button/Button";
import { auth, googleAuthProvider } from "../../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import "./Login.scss";
import { UserContext } from "../../context/User-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const Login = () => {
  const UserCtx = useContext(UserContext);
  const navigate = useNavigate();
  const handleLogin = () => {
    signInWithPopup(auth, googleAuthProvider)
      .then((data) => {
        if (
          data.user.displayName &&
          data.user.email &&
          data.user.photoURL &&
          data.user.uid
        ) {
          const userData = {
            displayName: data.user.displayName,
            email: data.user.email,
            photoURL: data.user.photoURL,
            uid: data.user.uid,
          };
          UserCtx?.login(userData);
          navigate("/storycorner/");
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__welcome">
          <h1 className="login__welcome_title">Welcome to Story Corner</h1>
          <p className="login__welcome_description">
            Welcome to our vibrant blogosphere, where ideas flourish! Share your
            thoughts, stories, and expertise with the world. Join a community of
            passionate writers and readers, engage with like-minded individuals,
            and spark discussions that matter. Explore diverse topics, and let
            your creativity shine. Start writing your next masterpiece today!
          </p>
        </div>
        <div className="login__section">
          <h3 className="login__section_subTitle">
            Let's start by logging in...
          </h3>
          <Button
            handleFunction={handleLogin}
            type="button"
            addClass="login__section_button"
          >
            Login
            <FontAwesomeIcon
              icon={faGoogle}
              title="Click to delete the post"
              className="delete"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
