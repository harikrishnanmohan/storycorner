import { useContext, useEffect, useRef, useState } from "react";
import "./LikeButton.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { UserContext } from "../../context/User-context";
import { fireStore } from "../../firebaseConfig";
import Modal from "../../components/Modal/Modal";
import Button from "../Button/Button";

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
  const [isShowLiked, setIsShowLiked] = useState<boolean>(false);
  const [likedUsers, setLikedUsers] = useState([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [like, setLike] = useState<string[]>(likeCount);
  const userCtx = useContext(UserContext);

  const likeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const postRef = doc(fireStore, "posts", id);

    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const currentLikeCount = data?.likeCount?.map(
          (item: { id: string; name: string }) => item.id
        );
        setLikedUsers(data?.likeCount);
        setLike(currentLikeCount);
        if (userCtx?.user?.uid) {
          setIsLiked(currentLikeCount?.includes(userCtx.user.uid));
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
    if (postSnapshot.exists()) {
      const currentLikeCount = postSnapshot.data().likeCount;
      let newLikeCount;
      if (currentLikeCount) {
        if (
          !currentLikeCount
            .map((item: { id: string; name: string }) => item.id)
            .includes(userCtx?.user?.uid)
        ) {
          newLikeCount = [
            ...currentLikeCount,
            {
              id: userCtx?.user?.uid,
              name: userCtx?.user?.displayName,
              photoURL: userCtx?.user?.photoURL,
            },
          ];
          setIsLiked(true);
        } else {
          newLikeCount = currentLikeCount.filter(
            (element: { id: string; name: string }) =>
              element.id !== userCtx?.user?.uid
          );
          setIsLiked(false);
        }
      }
      if (!currentLikeCount) {
        newLikeCount = [
          {
            id: userCtx?.user?.uid,
            name: userCtx?.user?.displayName,
            photoURL: userCtx?.user?.photoURL,
          },
        ];
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
    >
      <div onClick={onClickLike}>
        <FontAwesomeIcon icon={faHeart} className="fa-lg like-button" />
      </div>
      {like?.length > 0 && (
        <div
          className="like__count"
          onClick={() => setIsShowLiked((prev) => !prev)}
          ref={likeRef}
        >
          {like?.length}
        </div>
      )}
      {isShowLiked && (
        <Modal open={isShowLiked} addClass="like_modal">
          <div className="likes__modal">
            <div className="likes__modal_interaction">
              <Button
                handleFunction={() => {
                  setIsShowLiked(false);
                }}
                type="button"
                addClass="closs-button"
              >
                X
              </Button>
            </div>
            <ul className="like__users">
              {likedUsers?.length > 0 &&
                likedUsers.map(
                  (item: { id: string; name: string; photoURL: string }) => (
                    <li key={id} className="like__user">
                      <img
                        src={item?.photoURL}
                        alt="user photo"
                        className="like__user_photo"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                      <span>{item.name}</span>
                    </li>
                  )
                )}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LikeButton;
