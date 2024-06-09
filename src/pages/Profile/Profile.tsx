import "./Profile.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import Card from "../../components/Card/Card";
import Container from "../../components/Container/Container";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/User-context";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { fireStore } from "../../firebaseConfig";
import { StoryListType } from "../Stories/Stories";
import { useNavigate } from "react-router-dom";
import Button from "../../atom/Button/Button";

const SkeletonProfile = () => {
  return (
    <div className="skeleton__profile">
      <div className="skeleton skeleton__profile__picture"></div>
      <div className="skeleton skeleton__profile__name"></div>
      <div className="skeleton skeleton__profile__post"></div>
    </div>
  );
};

const Profile = ({ isClickable }: { isClickable?: boolean }) => {
  const userCtx = useContext(UserContext);
  const [storyList, setStoryList] = useState<StoryListType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userCtx?.user?.uid) return;

    const collectionRef = collection(fireStore, "posts");
    const userPostsQuery = query(
      collectionRef,
      where("authorId", "==", userCtx.user.uid)
    );

    const unsubscribe = onSnapshot(userPostsQuery, (snapshot) => {
      const newData: StoryListType[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        image: doc.data().image || "",
        post: doc.data().post || "",
        title: doc.data().title || "",
        keyWords: doc.data().keyWords || [],
        authorName: doc.data().authorName || "",
        authorId: doc.data().authorId || "",
        writtenOn: doc.data().writtenOn || "",
        lastUpdated: doc.data().lastUpdated || "",
        likeCount: doc.data().likeCount || [],
        authorImage: doc.data().authorImage || "",
      }));
      setStoryList(newData);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userCtx?.user?.uid]);
  if (isLoading) {
    return <SkeletonProfile />;
  }

  const goToTotalPost = () => {
    if (isClickable) navigate("/storycorner/myPosts");
    else return;
  };
  return (
    <Container addClass={`profile ${!isClickable ? " bg-image" : ""}`}>
      {!isClickable ? (
        <Button
          type="button"
          handleFunction={() => navigate("/storycorner")}
          addClass="profile__back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
      ) : (
        <></>
      )}
      <Card
        image={userCtx?.user?.photoURL}
        about="profile photo"
        addClass="profile__picture"
      />
      <p className="profile__name">{userCtx?.user?.displayName}</p>
      {!isClickable ? (
        <p className="profile__name">{userCtx?.user?.email}</p>
      ) : (
        <></>
      )}

      <div className="profile__post" onClick={goToTotalPost}>
        <p
          className={`profile__post_count ${isClickable ? "" : " left-align"}`}
        >
          <span className="profile__post_count-label">My posts</span>
          <span className="profile__post_count-value">{storyList.length}</span>
        </p>
      </div>
    </Container>
  );
};

export default Profile;
