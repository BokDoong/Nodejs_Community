export class CreatePostDTO {
  title;
  content;
  userId;
  tags; //["thread", "js", ..]

  constructor(props) {
    this.title = props.title;
    this.content = props.content;
    this.userId = props.userId;
    this.tags = props.tags;
  }
}