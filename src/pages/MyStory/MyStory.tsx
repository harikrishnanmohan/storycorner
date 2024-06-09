import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "../../components/Container/Container";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Button from "../../atom/Button/Button";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

import "./MyStory.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Card from "../../components/Card/Card";
import { StoryListType } from "../Stories/Stories";
import { NewPostForm } from "../NewPost/NewPost";
import { convertToLocalDate } from "../../util";
import LikeButton from "../../atom/LikeButton/LikeButton";

const MyStory = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [story, setStory] = useState<StoryListType>(location?.state?.post);

  useEffect(() => {
    if (location?.state?.isEdit) setIsModalOpen(true);
  }, [location?.state?.isEdit]);

  const onEditOrSaveToggle = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {story && (
        <div className="myStory">
          <div className="myStory__container">
            <Container addClass="myStory__container_post">
              <div className="myStory__interaction">
                <div className="myStory__interaction_title">
                  <Button
                    type="button"
                    handleFunction={() => navigate("/storycorner")}
                    addClass="myStory__header_back"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <h1 className="myStory__title">{story.title}</h1>
                  <Button
                    addClass="myStory__edit"
                    handleFunction={onEditOrSaveToggle}
                    type="button"
                  >
                    <FontAwesomeIcon
                      icon={faPencil}
                      title="Click to edit the post"
                    />
                  </Button>
                </div>
                <div className="myStory__about">
                  <div className="myStory__about_informations">
                    <div className="myStory__image_container">
                      <img
                        src={story.image}
                        alt="story picture"
                        className="myStory__image"
                      />
                    </div>
                    <div className="myStory__about_informations-like">
                      <div className="myStory__about_informations-like-items">
                        {story.lastUpdated != story.writtenOn ? (
                          <>
                            <p>
                              Written on: {convertToLocalDate(story.writtenOn)}
                            </p>
                            <p>
                              Last updated:{" "}
                              {convertToLocalDate(story.lastUpdated)}
                            </p>
                          </>
                        ) : (
                          <p>
                            Written on: {convertToLocalDate(story.writtenOn)}
                          </p>
                        )}
                        <LikeButton
                          id={story.id}
                          likeCount={story.likeCount}
                          onLikePost={() => {}}
                        />
                      </div>
                      <div className="myStory__about_keyWords">
                        {story.keyWords.map((keyword, index) => (
                          <div
                            key={index}
                            className="myStory__about_keyWords-item"
                          >
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="myStory__post">
                <p className="myStory__post">{story.post}</p>
                <div className="myStory__post_author">
                  <div className="myStory__post_author-information">
                    <Card
                      image={story.authorImage}
                      about="writter picture"
                      addClass="myStory__post_author-information-picture"
                    />
                    <h4 className="myStory__post_author-information-name">
                      {story.authorName}
                    </h4>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </div>
      )}
      <NewPostForm
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        story={story}
        setStory={setStory}
      />
    </>
  );
};

export default MyStory;
