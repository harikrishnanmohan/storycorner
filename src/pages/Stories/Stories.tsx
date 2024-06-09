import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import NewPost from "../NewPost/NewPost";
import Profile from "../Profile/Profile";
import Recent from "../Recent/Recent";
import Story, { SkeletonLoaderStory } from "../Story/Story";

import "./Stories.scss";

import Input from "../../atom/Input/Input";
import {
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { fireStore } from "../../firebaseConfig";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faBars } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../context/User-context";
import Modal from "../../components/Modal/Modal";
import Button from "../../atom/Button/Button";

export interface StoryListType {
  id: string;
  image: string;
  post: string;
  title: string;
  keyWords: string[];
  authorName: string;
  authorId: string;
  writtenOn: string;
  lastUpdated: string;
  likeCount: string[];
  authorImage: string;
}

const Stories = () => {
  const [storyList, setStoryList] = useState<StoryListType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [isNewPosts, setIsNewPosts] = useState<boolean>(false);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [uniqueKeyWord, setUniqueKeyWord] = useState<string[]>([]);
  const [isSelected, setIsSelected] = useState<number | null>(null);
  const hasInitializedUniqueKeywords = useRef(false);
  const [filteredStories, setFilteredStories] = useState<StoryListType[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [newPosts, setNewPosts] = useState<StoryListType[]>([]);
  const [newPostAuthorImg, setNewPostAuthorImg] = useState<string[]>([]);
  const initialPostIds = useRef<Set<string>>(new Set());
  const [isNoPostModalOpen, setIsNoPostModalOpen] = useState<boolean>(false);
  const [slideUp, setSlideUp] = useState(false);

  const userCtx = useContext(UserContext);

  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

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
  }, []);

  const onLikePost = (id: string) => {
    setIsNoPostModalOpen(true);
    setStoryList((prev) => prev.filter((story) => story.id !== id));
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(fireStore, "posts"), orderBy("lastUpdated", "desc")),
      (snapshot) => {
        const newData: StoryListType[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          image: doc.data().image || "",
          post: doc.data().post || "",
          title: doc.data().title || "",
          keyWords: doc.data().keyWords || [],
          authorName: doc.data().authorName || "",
          authorId: doc.data().authorId || "",
          writtenOn: doc.data().writtenOn || "",
          lastUpdated: doc.data().lastUpdated || 0,
          likeCount: doc.data().likeCount || [],
          authorImage: doc.data().authorImage || "",
        }));

        const newPostsData = newData.filter(
          (story) =>
            !initialPostIds.current.has(story.id) &&
            !storyList.some((existingStory) => existingStory.id === story.id)
        );

        if (newPostsData.length > 0) {
          const userNewPosts = newPostsData.filter(
            (story) => story.authorId === userCtx?.user?.uid
          );
          const otherNewPosts = newPostsData.filter(
            (story) => story.authorId !== userCtx?.user?.uid
          );

          if (userNewPosts.length > 0) {
            setStoryList((prev) => [...userNewPosts, ...prev]);
          }

          const mostRecentPost =
            storyList.length === 0
              ? null
              : storyList.reduce((latest, post) =>
                  post.lastUpdated > latest.lastUpdated ? post : latest
                );
          const mostRecentTimestamp = mostRecentPost
            ? mostRecentPost.lastUpdated
            : 0;

          if (otherNewPosts.length > 0) {
            setNewPosts((prev) => {
              const existingPostIds = new Set(prev.map((post) => post.id));
              const uniqueNewPosts = otherNewPosts.filter(
                (post) =>
                  !existingPostIds.has(post.id) &&
                  post.lastUpdated > mostRecentTimestamp
              );
              console.log(uniqueNewPosts);
              if (uniqueNewPosts.length > 0) {
                setIsNewPosts(true);
                return [...prev, ...uniqueNewPosts];
              }
              return prev;
            });
          }
        }
      }
    );

    return () => unsubscribe();
  }, [storyList, userCtx?.user?.uid]);

  useEffect(() => {
    const uniqueAuthorImages = Array.from(
      new Set(newPosts.map((post) => post.authorImage))
    );
    setNewPostAuthorImg(uniqueAuthorImages);
  }, [newPosts]);

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
    [isLoading, lastVisible, hasMore]
  );

  useEffect(() => {
    if (storyList.length > 0 && !hasInitializedUniqueKeywords.current) {
      const newArray = Array.from(
        new Set(
          storyList
            .flatMap((story) => story.keyWords || [])
            .filter((keyword) => keyword.trim().length > 0)
        )
      );
      setUniqueKeyWord(shuffleArray(newArray).slice(0, 15));
      hasInitializedUniqueKeywords.current = true;
    }
  }, [storyList]);

  const onClickKeyWord = async (index: number) => {
    const selectedKeyword = uniqueKeyWord[index];
    if (isSelected === index) {
      setIsSelected(null);
      setFilteredStories([]);
      return;
    }
    setIsSelected(index);
    const collectionRef = collection(fireStore, "posts");
    const q = query(
      collectionRef,
      where("keyWords", "array-contains", selectedKeyword)
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
    setFilteredStories(newData);
  };

  const onFilter = (e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredKeywords = Array.from(
      new Set(
        storyList
          .flatMap((story) => story.keyWords || [])
          .filter((keyword) => keyword.toLowerCase().includes(searchValue))
      )
    ).slice(0, 15);

    setUniqueKeyWord(filteredKeywords);
  };

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setIsFilterVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onDeletePost = (id: string) => {
    setShowNotification(true);
    setStoryList((prev) => prev.filter((story) => story.id !== id));
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const NoPostModal = () => {
    return (
      <div className="deleteConfirmation">
        <p className="deleteConfirmation_question">
          This post is not available now...
        </p>
        <div className="deleteConfirmation_button">
          <Button
            children="Go Back"
            type="button"
            handleFunction={() => setIsNoPostModalOpen(false)}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {showNotification && (
        <div className="deleted">
          <p>Post Deleted...</p>
        </div>
      )}
      {isNewPosts && (
        <div
          className={`notification ${slideUp ? "slide-up" : ""}`}
          onClick={() => {
            setSlideUp(true);
            setTimeout(() => {
              setStoryList((prev) => {
                const existingPostIds = new Set(prev.map((post) => post.id));
                const uniqueNewPosts = newPosts.filter(
                  (post) => !existingPostIds.has(post.id)
                );
                return [...uniqueNewPosts, ...prev];
              });
              setNewPosts([]);
              setNewPostAuthorImg([]);
              setIsNewPosts(false);
              setSlideUp(false);
              window.scrollTo(0, 0);
            }, 500);
          }}
        >
          <div className="notification-images">
            <FontAwesomeIcon icon={faArrowUp} title="Click to view new posts" />
            {newPostAuthorImg.map((post, index) => (
              <img
                src={post}
                className={`notification-image_${index}`}
                key={index}
              />
            ))}
            <span>{newPosts.length}</span>
          </div>
        </div>
      )}
      <div className="stories">
        <div className="stories__profile">
          <Profile isClickable={true} />
          <Recent />
        </div>
        <div className="stories__right">
          <div className="stories__list">
            <div className="stories__newPost">
              <NewPost isLoading={isLoading} />
            </div>
            <div
              onClick={() => setIsFilterVisible((value) => !value)}
              ref={divRef}
              className={`stories__filters_button ${
                isSelected !== null ? "keyword" : ""
              }`}
            >
              <FontAwesomeIcon icon={faBars} title="Click to edit the post" />
            </div>
            {isLoading ? (
              <>
                <SkeletonLoaderStory />
                <SkeletonLoaderStory />
                <SkeletonLoaderStory />
              </>
            ) : isSelected !== null ? (
              filteredStories.length > 0 ? (
                filteredStories.map((storyItem, index) => (
                  <div
                    key={storyItem.id}
                    ref={
                      index === storyList.length - 1
                        ? lastStoryElementRef
                        : null
                    }
                  >
                    <MemoizedStory
                      story={storyItem}
                      onDelete={onDeletePost}
                      onLikePost={onLikePost}
                    />
                  </div>
                ))
              ) : (
                <>
                  <SkeletonLoaderStory />
                  <SkeletonLoaderStory />
                  <SkeletonLoaderStory />
                </>
              )
            ) : (
              storyList.map((storyItem, index) => (
                <div
                  key={storyItem.id}
                  ref={
                    index === storyList.length - 1 ? lastStoryElementRef : null
                  }
                >
                  <MemoizedStory
                    story={storyItem}
                    onDelete={onDeletePost}
                    onLikePost={onLikePost}
                  />
                </div>
              ))
            )}
          </div>
          <div className="stories__filters">
            <div className="stories__filters_search">
              <Input
                placeholder="Search keyword..."
                icon=""
                handlerFunctionOnChange={onFilter}
                title="Separate word using hyphen (-) (example: first-second-thired)"
              />
            </div>
            <div className="stories__filters_items">
              {uniqueKeyWord.map((keyword, index) => (
                <div
                  key={index}
                  className={`stories__filters_items-item ${
                    isSelected === index ? `selected` : ""
                  }`}
                  onClick={() => onClickKeyWord(index)}
                >
                  {keyword}
                </div>
              ))}
              {uniqueKeyWord.length === 0 ? "No results found..." : ""}
            </div>
          </div>
          <div
            className={`stories__filters_slider ${
              isFilterVisible ? "visible" : ""
            }`}
          >
            <Profile isClickable={true} />

            <div className="stories__filters_search">
              <Input
                placeholder="Search keyword..."
                icon=""
                handlerFunctionOnChange={onFilter}
                title="Separate word using hyphen (-) (example: first-second-thired)"
              />
            </div>
            <div className="stories__filters_items">
              {uniqueKeyWord.map((keyword, index) => (
                <div
                  key={index}
                  className={`stories__filters_items-item ${
                    isSelected === index ? `selected` : ""
                  }`}
                  onClick={() => onClickKeyWord(index)}
                >
                  {keyword}
                </div>
              ))}
              {uniqueKeyWord.length === 0 ? "No results found..." : ""}
            </div>
          </div>
        </div>
      </div>
      <Modal open={isNoPostModalOpen} addClass="noPost_modal">
        <NoPostModal />
      </Modal>
    </>
  );
};

const MemoizedStory = React.memo(Story);

export default Stories;
