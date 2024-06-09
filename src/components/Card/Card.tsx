import "./Card.scss";
import user from "../../assets/user.png";

const Card = ({
  image,
  addClass = "",
  about,
  name,
  description,
}: {
  image: string | undefined;
  addClass?: string;
  about: string;
  name?: string;
  description?: string;
}) => {
  return (
    <>
      <img
        src={image ? image : user}
        alt={about}
        className={`card__picture ${addClass}`}
      />
      {name && (
        <div>
          {name && <p className="card__name">Hi {name}!</p>}
          {description ? (
            <p className="card__description">{description}</p>
          ) : (
            <></>
          )}
        </div>
      )}
    </>
  );
};

export default Card;
