import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Profile from "../Profile/Profile";
import "./TotalPosts.scss";
import {
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { StoryListType } from "../Stories/Stories";
import { fireStore } from "../../firebaseConfig";
import { UserContext } from "../../context/User-context";
import Story, { SkeletonLoaderStory } from "../Story/Story";
import Button from "../../atom/Button/Button";
import { useNavigate } from "react-router-dom";
import Container from "../../components/Container/Container";

const TotalPosts = () => {
  const userCtx = useContext(UserContext);
  const navigate = useNavigate();

  const [storyList, setStoryList] = useState<StoryListType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackButtonVisible, setIsBackButtonVisible] =
    useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const initialPostIds = useRef<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // useEffect(() => {
  //   if (!userCtx?.user?.uid) return;

  //   const fetchPosts = async () => {
  //     const collectionRef = collection(fireStore, "posts");
  //     const userPostsQuery = query(
  //       collectionRef,
  //       where("authorId", "==", userCtx?.user?.uid)
  //     );
  //     const snapshot = await getDocs(userPostsQuery);
  //     const newData: StoryListType[] = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       image: doc.data().image || "",
  //       post: doc.data().post || "",
  //       title: doc.data().title || "",
  //       keyWords: doc.data().keyWords || [],
  //       authorName: doc.data().authorName || "",
  //       authorId: doc.data().authorId || "",
  //       writtenOn: doc.data().writtenOn || "",
  //       lastUpdated: doc.data().lastUpdated || "",
  //       likeCount: doc.data().likeCount || [],
  //       authorImage: doc.data().authorImage || "",
  //     }));
  //     setStoryList(newData);
  //     setIsLoading(false);
  //   };

  //   fetchPosts();
  // }, [userCtx?.user?.uid]);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setIsLoading(true);
        const collectionRef = collection(fireStore, "posts");
        const q = query(
          collectionRef,
          where("authorId", "==", userCtx?.user?.uid),
          orderBy("lastUpdated", "desc"),
          limit(10)
        );
        const snapshot = await getDocs(q);

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
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        initialPostIds.current = new Set(newData.map((story) => story.id));
        setHasMore(snapshot.docs.length === 10);
      } catch (error) {
        console.error("Error fetching initial posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPosts();
  }, [userCtx?.user?.uid]);

  const lastStoryElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      const fetchMorePosts = async () => {
        if (!lastVisible || isLoading) return;

        try {
          setIsLoading(true);
          const collectionRef = collection(fireStore, "posts");
          const q = query(
            collectionRef,
            where("authorId", "==", userCtx?.user?.uid),
            orderBy("lastUpdated", "desc"),
            startAfter(lastVisible),
            limit(10)
          );
          const snapshot = await getDocs(q);

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

          setStoryList((prev) => [...prev, ...newData]);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === 10);
        } catch (error) {
          console.error("Error fetching more posts:", error);
        } finally {
          setIsLoading(false);
        }
      };

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, lastVisible, userCtx?.user?.uid, hasMore]
  );

  const controlBackButton = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > 400) {
        setIsBackButtonVisible(true);
      } else {
        setIsBackButtonVisible(false);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlBackButton);

      return () => {
        window.removeEventListener("scroll", controlBackButton);
      };
    }
  }, []);

  const onDeletePost = (id: string) => {
    setShowNotification(true);
    setStoryList((prev) => prev.filter((story) => story.id !== id));
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <>
      {showNotification && (
        <div className="deleted">
          <p>Post Deleted...</p>
        </div>
      )}
      <div className="totalPosts">
        <Button
          type="button"
          handleFunction={() => navigate("/storycorner/")}
          addClass={`totalPosts__back ${isBackButtonVisible ? "visible" : ""}`}
        >
          <FontAwesomeIcon icon={faArrowLeft} title="Go back" />
        </Button>
        <div className="totalPosts__posts">
          <Profile isClickable={false} />
          {isLoading ? (
            <>
              <SkeletonLoaderStory />
              <SkeletonLoaderStory />
              <SkeletonLoaderStory />
            </>
          ) : (
            storyList.map((story, index) => (
              <div
                key={story.id}
                ref={
                  index === storyList.length - 1 ? lastStoryElementRef : null
                }
              >
                <Story
                  story={story}
                  showEdit
                  onDelete={onDeletePost}
                  onLikePost={() => {}}
                />
              </div>
            ))
          )}
          {storyList.length === 0 && (
            <Container addClass="totalPosts__noPost">
              Join the Conversation! - There are no posts yet. Share your
              thoughts and be the first to post.
              <Button
                handleFunction={() => navigate("/storycorner/")}
                type="button"
                addClass="goHome-button"
              >
                Go to home
              </Button>
            </Container>
          )}
        </div>
      </div>
    </>
  );
};

export default TotalPosts;
