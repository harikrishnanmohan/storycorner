import {
  useState,
  ChangeEvent,
  useContext,
  FormEvent,
  useEffect,
  useRef,
} from "react";
import "./NewPost.scss";
import Input from "../../atom/Input/Input";
import Modal from "../../components/Modal/Modal";
import Button from "../../atom/Button/Button";
import Card from "../../components/Card/Card";
import Container from "../../components/Container/Container";
import { UserContext } from "../../context/User-context";
import TextArea from "../../atom/TextArea/TextArea";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { fireStore } from "../../firebaseConfig";
import { StoryListType } from "../Stories/Stories";

interface PostInfoType {
  image: string;
  post: string;
  title: string;
  keyWords: string[];
  authorName: string;
  lastUpdated: string;
  authorId: string;
  writtenOn: string;
  likeCount: string[];
}

const SkeletonNewPost = () => {
  return (
    <div className="skeleton__newPost">
      <div className="skeleton__newPost_user">
        <div className="skeleton__newPost_user-image skeleton"></div>
        <div className="skeleton__newPost_user-greet">
          <div className="skeleton__newPost_user-greet-name skeleton"></div>
          <div className="skeleton__newPost_user-greet-question skeleton"></div>
        </div>
      </div>
      <div className="skeleton__newPost_input skeleton"></div>
    </div>
  );
};

export const NewPostForm = ({
  setIsModalOpen,
  isModalOpen,
  story,
  setStory,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen: boolean;
  story: StoryListType | null;
  setStory?: React.Dispatch<React.SetStateAction<StoryListType>>;
}) => {
  const defaultImage = "";

  const [title, setTitle] = useState(story?.title || "");
  const [post, setPost] = useState(story?.post || "");
  const [keyword, setKeyword] = useState(
    story?.keyWords.toString().replaceAll(",", " ") || ""
  );
  const [file, setFile] = useState(story?.image || defaultImage);
  const [message, setMessage] = useState<string>("");

  const UserCtx = useContext(UserContext);

  useEffect(() => {
    if (isModalOpen && story) {
      setTitle(story.title || "");
      setPost(story.post || "");
      setKeyword(story.keyWords.toString().replaceAll(",", " ") || "");
      setFile(story.image || defaultImage);
      setBase64Image(story.image || defaultImage);
      setMessage("");
    }
  }, [isModalOpen, story]);

  const [base64Image, setBase64Image] = useState<string>(
    story?.image || defaultImage
  );

  const onSavePost = async (postInfo: PostInfoType) => {
    try {
      const docRef = await addDoc(collection(fireStore, "posts"), postInfo);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const onUpdatePost = async (postInfo: PostInfoType, docId: string) => {
    try {
      const docRef = doc(fireStore, "posts", docId);
      await updateDoc(docRef, { ...postInfo });
      console.log("Document updated with ID: ", docId);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth() + 1;
    const utcDate = now.getUTCDate();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcSeconds = now.getUTCSeconds();

    const formattedDate = `${utcYear}-${utcMonth
      .toString()
      .padStart(2, "0")}-${utcDate.toString().padStart(2, "0")}`;
    const formattedTime = `${utcHours.toString().padStart(2, "0")}:${utcMinutes
      .toString()
      .padStart(2, "0")}:${utcSeconds.toString().padStart(2, "0")}`;

    return `${formattedDate} ${formattedTime}`;
  };

  const resizeImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    callback: (result: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg");
        callback(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resizeImage(file, 800, 800, (result) => {
      setBase64Image(result);
      setFile(result);
    });
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    if (!story) onReset();
  };

  const onReset = () => {
    setBase64Image("");
    setFile(defaultImage);
    setTitle("");
    setPost("");
    setKeyword("");
  };
  const hasPostChanged = (
    currentPost: PostInfoType,
    newPost: PostInfoType
  ): boolean => {
    return (
      currentPost.title !== newPost.title ||
      currentPost.post !== newPost.post ||
      currentPost.keyWords.toString() !== newPost.keyWords.toString() ||
      currentPost.image !== newPost.image
    );
  };

  const onNewPost = (e: FormEvent) => {
    e.preventDefault();
    const date = getCurrentDate();
    const postInfo = {
      title: title,
      post: post,
      keyWords: Array.from(
        new Set(keyword.replaceAll(",", "").split(" ") ?? [""])
      ),
      likeCount: story?.likeCount || [],
      writtenOn: story?.writtenOn || date,
      lastUpdated: date,
      authorName: UserCtx?.user?.displayName ?? "",
      authorId: UserCtx?.user?.uid ?? "",
      authorImage: UserCtx?.user?.photoURL ?? "",
      image: base64Image !== "" ? base64Image : defaultImage,
    };

    if (story) {
      if (hasPostChanged(story, postInfo)) {
        onUpdatePost(postInfo, story.id);
        if (setStory) setStory({ ...postInfo, id: story.id });
        onCloseModal();
      } else setMessage("No changes detected, post not updated.");
    } else {
      onSavePost(postInfo);
      onCloseModal();
    }
  };

  return (
    <Modal open={isModalOpen} addClass="newPost__modal">
      <div className="newPost__modal_content">
        <div className="newPost__modal_content_user">
          <div className="newPost__modal_content_user-details">
            <Card
              image={UserCtx?.user?.photoURL}
              about="profile picture"
              addClass="newPost__modal_content_user-picture"
              name="Harikrishnan"
              description={`${
                story
                  ? "Ready to make changes to your post?"
                  : "What do you have in mind?"
              }`}
            />
          </div>
          <div className="newPost__modal_interaction">
            <Button
              handleFunction={onCloseModal}
              type="button"
              addClass="closs-button"
            >
              X
            </Button>
          </div>
        </div>
        <p className={`newPost__modal_message${message !== "" ? " show" : ""}`}>
          {message}
        </p>
        <form className="newPost__modal_informations" onSubmit={onNewPost}>
          <Input
            placeholder="Post title"
            addClass="newPost__modal_informations-title"
            required
            value={title}
            handlerFunctionOnChange={(e) => setTitle(e.target.value)}
          />
          <TextArea
            placeholder="Let's begin the post"
            rows={5}
            addClass="newPost__modal_informations-post"
            required
            value={post}
            handlerFunctionOnChange={(e) => setPost(e.target.value)}
          />
          <Input
            placeholder="Add some keywords"
            addClass="newPost__modal_informations-keyWords"
            required
            value={keyword}
            handlerFunctionOnChange={(e) => setKeyword(e.target.value)}
          />
          <p className="newPost__modal_informations-keyWords-message">
            Add some keywords separated by space. To club words use hyphen (-)
            (example: first-second-thired)
          </p>
          <div className="newPost__modal_informations-upload">
            <div className="newPost__modal_informations-upload-file-message">
              <Input
                placeholder="jhsbdckj"
                addClass="newPost__modal_informations-file"
                file
                handlerFunctionOnChange={onChooseFile}
              />
              <p className="newPost__modal_informations-message">
                If no image is selected a default one will be added
              </p>
            </div>
            {(base64Image || file) && (
              <img
                src={base64Image || file}
                alt="Uploaded"
                className="newPost__modal_informations-upload-image"
              />
            )}
          </div>
          <div className="newPost__modal_interaction">
            {!story ? (
              <Button handleFunction={onReset} type="button">
                Reset
              </Button>
            ) : (
              <></>
            )}
            <Button type="submit" addClass={`${story ? "update-button" : ""}`}>
              {story ? "Update" : "Post now"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
const NewPost = ({ isLoading }: { isLoading: boolean }) => {
  const UserCtx = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onAddPost = () => {
    setIsModalOpen(true);
  };
  useEffect(() => {
    if (!isModalOpen && inputRef.current) {
      inputRef.current.blur();
    }
  }, [isModalOpen]);

  return (
    <Container addClass="newPost">
      {isLoading ? (
        <SkeletonNewPost />
      ) : (
        <>
          <div className="newPost__user">
            <Card
              image={UserCtx?.user?.photoURL}
              about="profile picture"
              name={UserCtx?.user?.displayName}
              description="What do you have in mind?"
            />
          </div>
          <Input
            placeholder="Start writing a post..."
            handlerFunctionOnClick={onAddPost}
            addClass="newPost__input"
            ref={inputRef}
          />
          <NewPostForm
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            story={null}
          />
        </>
      )}
    </Container>
  );
};

export default NewPost;
