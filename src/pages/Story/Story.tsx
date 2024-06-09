import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./Story.scss";
import { useContext, useState } from "react";
import Card from "../../components/Card/Card";
import Container from "../../components/Container/Container";
import Button from "../../atom/Button/Button";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { convertToLocalDate } from "../../util";
import { NewPostForm } from "../NewPost/NewPost";
import { StoryListType } from "../Stories/Stories";
import LikeButton from "../../atom/LikeButton/LikeButton";
import { UserContext } from "../../context/User-context";
import Modal from "../../components/Modal/Modal";
import { deleteDoc, doc } from "firebase/firestore";
import { fireStore } from "../../firebaseConfig";

export const SkeletonLoaderStory = () => (
  <div className="skeleton-story">
    <div className="skeleton skeleton__image"></div>
    <div className="skeleton__story__description">
      <div className="skeleton__story__description_about">
        <div className="skeleton__story__description_title skeleton"></div>
        <div className="skeleton__story__description_post skeleton"></div>
      </div>
      <div className="skeleton__story__description_author">
        <div className="skeleton__story__description_author-information">
          <div className="skeleton skeleton__story__description_author-information-picture"></div>
          <div className="skeleton skeleton__story__description_author-information-name"></div>
        </div>
        <div className=" skeleton skeleton__story__description_about-interaction"></div>
      </div>
    </div>
  </div>
);

const Story = ({
  story,
  showEdit,
  onDelete,
  onLikePost,
}: {
  story: {
    id: string;
    image: string;
    title: string;
    post: string;
    keyWords: string[];
    authorName: string;
    writtenOn: string;
    lastUpdated: string;
    likeCount: string[];
    authorImage: string;
    authorId: string;
  };
  showEdit?: boolean;
  onDelete: (id: string) => void;
  onLikePost: (id: string) => void;
}) => {
  const [isShowAll, setIsShowAll] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [post, setPost] = useState<StoryListType>(story);
  const userCtx = useContext(UserContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const onDeletePost = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeletePost = async () => {
    if (story.id) {
      await deleteDoc(doc(fireStore, "posts", story.id));
      // setStoryList((prev) =>
      //   prev.filter((story) => story.id !== storyId.current)
      // );
      onDelete(story.id);
      setIsDeleteModalOpen(false);
    }
  };

  // const onDelete = (id: string) => {
  //   setIsDeleteModalOpen(true);
  //   storyId.current = id;
  // };

  const DeleteConfirmation = () => {
    if (story.id) {
      return (
        <div className="deleteConfirmation">
          <p className="deleteConfirmation_question">
            Are you sure that you want to delete the post?
          </p>
          <div className="deleteConfirmation_button">
            <Button
              children="Delete"
              type="button"
              handleFunction={() => handleDeletePost()}
            />
            <Button
              children="Go Back"
              type="button"
              handleFunction={() => setIsDeleteModalOpen(false)}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <Container addClass={`story ${isShowAll ? "story__block" : ""}`}>
      <div className="story__description_about-header-tablet">
        <h1 className="story__description_title">{post.title}</h1>
        {showEdit && (
          <Button
            addClass="myStory__edit"
            handleFunction={() => setIsModalOpen(true)}
            type="button"
          >
            <FontAwesomeIcon icon={faPencil} title="Click to edit the post" />
          </Button>
        )}
      </div>
      <div className="story__left">
        <img
          src={post.image}
          alt="story picture"
          className={`story__image ${isShowAll ? "story__image_scalDown" : ""}`}
        />
      </div>
      <div className="story__description">
        <div className="story__description_about">
          <div className="story__description_about-header">
            <h1 className="story__description_title">{post.title}</h1>
            {showEdit && (
              <Button
                addClass="myStory__edit"
                handleFunction={() => setIsModalOpen(true)}
                type="button"
              >
                <FontAwesomeIcon
                  icon={faPencil}
                  title="Click to edit the post"
                />
              </Button>
            )}
          </div>
          {isShowAll && (
            <div className="story__description_image-container">
              <img
                src={post.image}
                alt="story picture"
                className="story__description_image"
              />
            </div>
          )}
          <p className="story__description_post">
            {isShowAll ? post.post : post.post.substring(0, 300) + `...`}
            {post.post.length > 300 && !isShowAll && (
              <Button
                children="see more"
                handleFunction={() => setIsShowAll(true)}
                type="button"
                addClass="story__description_post-button"
              />
            )}
            {post.post.length > 300 && isShowAll && (
              <Button
                children="show less"
                handleFunction={() => setIsShowAll(false)}
                type="button"
                addClass="story__description_post-button"
              />
            )}
          </p>
        </div>
        <div className="story__description_author">
          <div className="story__description_author-information">
            <Card
              image={post.authorImage}
              about="writter picture"
              addClass="story__description_author-information-picture"
            />
            <div className="story__description_author-information-part1">
              <h4 className="story__description_author-information-name">
                {post.authorName}
              </h4>
              <p className="story__description_author-information-date">
                {convertToLocalDate(post.lastUpdated)}
              </p>
            </div>
          </div>
          <div className="story__description_about-interaction">
            {story.authorId === userCtx?.user?.uid ? (
              <FontAwesomeIcon
                icon={faTrash}
                title="Click to delete the post"
                onClick={onDeletePost}
                className="delete"
              />
            ) : (
              <></>
            )}
            <LikeButton
              likeCount={story.likeCount}
              id={story.id}
              onLikePost={onLikePost}
            />
          </div>
        </div>
      </div>
      <NewPostForm
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        story={post}
        setStory={setPost}
      />
      <Modal open={isDeleteModalOpen} addClass="deleteConfirmation_modal">
        <DeleteConfirmation />
      </Modal>
    </Container>
  );
};

export default Story;
