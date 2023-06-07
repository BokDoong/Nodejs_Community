import { UsersDTO } from "../../users/dto/users.dto";

export class PostsDTO {
  id;
  title;
  content;
  createdAt;
  user;

  constructor(props) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.user = new UsersDTO(props.user);
  }
}
