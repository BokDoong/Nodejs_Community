export class CreateChildCommentDTO {
  content;
  userId;
  //어차피 이 부모댓글 Id를 따라가면 부모댓글에 게시글의
  //postId가 들어있으므로 postId는 없어도 된다.
  parentCommentId;

  constructor(props) {
    this.content = props.content;
    this.userId = props.userId;
    this.parentCommentId = props.parentCommentId;
  }
}