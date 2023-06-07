import { UsersDTO } from "../../users/dto/users.dto";
import { TagDTO } from "./tags";
import { CommentDTO } from "./comment";

export class PostDTO {
  id;
  title;
  content;
  createdAt;
  likeCount;
  isLiked;
  user;
  comments;
  tags;

  constructor(props, user) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.likeCount = props.postLike.length;
    this.isLiked = user 
      ? !!props.postLike.find((like => like.userId === user.id))
      : false;

    this.user = new UsersDTO(props.user);
    this.comments = props.comments.map((comment) => new CommentDTO({
      id: comment.id,
      content : comment.content,
      childComments : comment.childComments,
      user: comment.user,
    }));
    this.tags = props.tags.map(
      (tag) =>
        new TagDTO({
          id: tag.id,
          name: tag.name,
        })
    );
  }
}
