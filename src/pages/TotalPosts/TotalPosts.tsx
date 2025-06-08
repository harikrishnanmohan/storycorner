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
  const [isMyPosts, setIsMyPost] = useState<boolean>(true);
  const [isBackButtonVisible, setIsBackButtonVisible] =
    useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const initialPostIds = useRef<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  const [likedPosts, setLikedPosts] = useState<StoryListType[]>([]);
  const [likedLastVisible, setLikedLastVisible] =
    useState<QueryDocumentSnapshot | null>(null);
  const [hasMoreLiked, setHasMoreLiked] = useState<boolean>(true);
  const [isLikedLoading, setIsLikedLoading] = useState<boolean>(false);
  const [likedPostsFetched, setLikedPostsFetched] = useState<boolean>(false); // To prevent refetch
  const likedObserver = useRef<IntersectionObserver | null>(null);
  const isLikedFetchingRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          likeCountById: doc.data().likeCount || [],
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

  const fetchLikedPosts = async () => {
    try {
      setIsLikedLoading(true);
      const collectionRef = collection(fireStore, "posts");
      const q = query(
        collectionRef,
        where("likeCountById", "array-contains", userCtx?.user?.uid),
        orderBy("lastUpdated", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);

      const newData = snapshot.docs.map((doc) => ({
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

      setLikedPosts(newData);
      setLikedLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreLiked(snapshot.docs.length === 10);
      setLikedPostsFetched(true);
    } catch (error) {
      console.error("Error fetching liked posts:", error);
    } finally {
      setIsLikedLoading(false);
    }
  };

  const lastStoryElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      const fetchMorePosts = async () => {
        if (!lastVisible || isFetchingRef.current || !hasMore) return;

        isFetchingRef.current = true; // prevent duplicate triggers
        setIsLoading(true);

        try {
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
            likeCountById: doc.data().likeCount || [],
            authorImage: doc.data().authorImage || "",
          }));

          setStoryList((prev) => [...prev, ...newData]);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === 10);
        } catch (error) {
          console.error("Error fetching more posts:", error);
        } finally {
          setIsLoading(false);
          isFetchingRef.current = false;
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

  const lastLikedStoryElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLikedLoading) return;
      if (likedObserver.current) likedObserver.current.disconnect();

      const fetchMoreLiked = async () => {
        if (!likedLastVisible || isLikedFetchingRef.current || !hasMoreLiked)
          return;

        isLikedFetchingRef.current = true;
        setIsLikedLoading(true);

        try {
          const collectionRef = collection(fireStore, "posts");
          const q = query(
            collectionRef,
            where("likeCountById", "array-contains", userCtx?.user?.uid),
            orderBy("lastUpdated", "desc"),
            startAfter(likedLastVisible),
            limit(10)
          );

          const snapshot = await getDocs(q);

          const newData = snapshot.docs.map((doc) => ({
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

          setLikedPosts((prev) => [...prev, ...newData]);
          setLikedLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setHasMoreLiked(snapshot.docs.length === 10);
        } catch (error) {
          console.error("Error fetching more liked posts:", error);
        } finally {
          setIsLikedLoading(false);
          isLikedFetchingRef.current = false;
        }
      };

      likedObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreLiked) {
          fetchMoreLiked();
        }
      });

      if (node) likedObserver.current.observe(node);
    },
    [isLikedLoading, likedLastVisible, userCtx?.user?.uid, hasMoreLiked]
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

  const onLikePost = (storyList: StoryListType[], id: string) => {
    console.log(storyList, id);
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
          <div>
            {(storyList.length > 0 || likedPosts.length > 0) && (
              <div className="totalPosts__tabs">
                <Button
                  addClass={`totalPosts__myPosts ${isMyPosts ? "active" : ""}`}
                  type="button"
                  handleFunction={() => {
                    setIsMyPost(true);
                  }}
                >
                  My Posts
                </Button>
                <Button
                  addClass={`totalPosts__likedPosts ${
                    !isMyPosts ? "active" : ""
                  }`}
                  type="button"
                  handleFunction={() => {
                    setIsMyPost(false);
                    if (!likedPostsFetched) {
                      fetchLikedPosts();
                    }
                  }}
                >
                  Liked Posts
                </Button>
              </div>
            )}
            <div className="totalPosts__content">
              {isMyPosts ? (
                storyList.map((story, index) => (
                  <div
                    key={story.id}
                    ref={
                      index === storyList.length - 1
                        ? lastStoryElementRef
                        : null
                    }
                  >
                    <Story
                      story={story}
                      showEdit
                      onDelete={onDeletePost}
                      onLikePost={() => {}}
                      onClick={(id: string) => onLikePost(storyList, id)}
                    />
                  </div>
                ))
              ) : (
                <div>
                  {likedPosts.map((story, index) => (
                    <div
                      key={story.id}
                      ref={
                        index === likedPosts.length - 1
                          ? lastLikedStoryElementRef
                          : null
                      }
                    >
                      <Story
                        story={story}
                        showEdit={false}
                        onDelete={() => {}}
                        onLikePost={() => {}}
                        onClick={(id: string) => onLikePost(likedPosts, id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {(isLoading || isLikedLoading) && !userCtx?.loading && (
            <>
              <SkeletonLoaderStory />
              <SkeletonLoaderStory />
              <SkeletonLoaderStory />
            </>
          )}
          {storyList.length === 0 && !userCtx?.loading && (
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
          {likedPosts.length === 0 && !isMyPosts && !userCtx?.loading && (
            <Container addClass="totalPosts__noPost">
              You haven’t liked any posts yet. Explore stories and show some
              love!
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
