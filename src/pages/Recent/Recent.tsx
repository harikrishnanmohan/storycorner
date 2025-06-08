import "./Recent.scss";

import Container from "../../components/Container/Container";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/User-context";
import { StoryListType } from "../Stories/Stories";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { fireStore } from "../../firebaseConfig";

const SkeletonRecent = () => {
  return (
    <div className="skeleton__recent">
      <div className="skeleton skeleton__recent_title"></div>
      <div className="skeleton skeleton__recent_postOne"></div>
      <div className="skeleton skeleton__recent_postTwo"></div>
    </div>
  );
};

const Recent = () => {
  const navigate = useNavigate();
  const userCtx = useContext(UserContext);
  const [recentPost, setRecentPost] = useState<StoryListType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        likeCountById: doc.data().likeCount || [],
        authorImage: doc.data().authorImage || "",
      }));
      const sortedPosts = newData
        .sort((a, b) => {
          const dateA = new Date(a.writtenOn);
          const dateB = new Date(b.writtenOn);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);
      setRecentPost(sortedPosts);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userCtx?.user?.uid]);

  if (isLoading) return <SkeletonRecent />;

  return (
    <Container addClass="recent">
      <h3 className="recent__title">Recent posts</h3>
      <div className="recent__posts">
        {recentPost.map((item) => {
          return (
            <p
              className="recent__posts_item"
              key={item.id}
              onClick={() =>
                navigate("story", { state: { post: item, isEdit: false } })
              }
            >
              {item.title.substring(0, 25)}...
            </p>
          );
        })}
        {recentPost.length === 0 && "No posts"}
      </div>
    </Container>
  );
};

export default Recent;
