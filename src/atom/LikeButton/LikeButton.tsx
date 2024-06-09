import { useContext, useEffect, useState } from "react";
import "./LikeButton.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { UserContext } from "../../context/User-context";
import { fireStore } from "../../firebaseConfig";

const LikeButton = ({
  likeCount,
  id,
  onLikePost,
}: {
  likeCount: string[];
  id: string;
  onLikePost: (id: string) => void;
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [like, setLike] = useState<string[]>(likeCount);
  const userCtx = useContext(UserContext);

  useEffect(() => {
    const postRef = doc(fireStore, "posts", id);

    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const currentLikeCount = data.likeCount as string[];
        setLike(currentLikeCount);
        if (userCtx?.user?.uid) {
          setIsLiked(currentLikeCount.includes(userCtx.user.uid));
        }
      }
    });

    return () => unsubscribe();
  }, [id, userCtx?.user?.uid]);

  const onClickLike = async () => {
    setIsLiked((prevState) => !prevState);
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);

    const postRef = doc(fireStore, "posts", id);
    const postSnapshot = await getDoc(postRef);
    console.log(postSnapshot.exists());
    if (postSnapshot.exists()) {
      const currentLikeCount = postSnapshot.data().likeCount;
      let newLikeCount;
      if (currentLikeCount) {
        if (!currentLikeCount.includes(userCtx?.user?.uid)) {
          newLikeCount = [...currentLikeCount, userCtx?.user?.uid];
          setIsLiked(true);
        } else {
          newLikeCount = currentLikeCount.filter(
            (element: string) => element !== userCtx?.user?.uid
          );
          setIsLiked(false);
        }
      }
      setLike(newLikeCount);
      await updateDoc(postRef, {
        likeCount: newLikeCount,
      });
    } else {
      onLikePost(id);
    }
  };

  return (
    <div
      className={`like ${isLiked ? "clicked" : ""} ${
        isAnimating ? "heartbeat" : ""
      }`}
      onClick={onClickLike}
    >
      <FontAwesomeIcon icon={faHeart} className="fa-lg like-button" />
      <span>{like.length}</span>
    </div>
  );
};

export default LikeButton;
