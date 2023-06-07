import database from "../../../database";
import { UserService } from "../../users/service";
import { PostDTO, PostsDTO } from "../dto";

export class PostService {
  userService;

  constructor() {
    this.userService = new UserService();
  }

  // 게시글 검색
  // searchValue: 검색어
  async getPosts({ skip, take }, searchValue) {
    const posts = await database.post.findMany({
      where: {
        title: {
          contains: searchValue ?? "",
        },
      },
      include: {
        user: true
      },
      skip,
      take,
      orderBy: {
        createAt: "desc",
      },
    });

    const count = await database.post.count({
      where: {
        title: {
          contains: searchValue,
        },
      },
    });

    return { posts : posts.map((post => new PostsDTO(post))), count };
  }

  //게시글 좋아요(업그레이드 버전 - 프론트에서 좋아요했는지 함께 보내줌.)
  //isLike(o) - 좋아요 눌렀을 때, isLike(x) - 좋아요 취소
  async postLike(userId, postId, isLike) {
    const user = await this.userService.findByUserId(userId);

    const post = await database.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw { status: 404, message: "게시글을 찾을 수 없습니다." };

    //이전 좋아요 상태 조회
    const isLiked = await database.postLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });

    //종아요을 하는 경우
    if (isLike && !isLiked) {
      await database.postLike.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          post: {
            connect: {
              id: post.id,
            },
          },
        },
      });
    }
    //좋아요 취소
    else if (!isLike && isLiked) {
      await database.postLike.delete({
        where: {
          userId_postId: {
            uderId: user.id,
            postId: post.id,
          },
        },
      });
    }
  }

  //게시글 단건조회
  async getPost(id, user) {
    const post = await database.post.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        comments: {
          include: {
            user: true,
            childComments: {
              include: {
                user: true,
              },
            },
          },
        },
        tags: true,
      },
    });

    if (!post) throw { status: 404, message: "게시글을 찾을 수 없습니다." };

    return new PostDTO(post, user);
  }

  //props: CreatePostDTO
  async createPost(props) {
    const user = await this.userService.findByUserId(props.userId);

    const newPost = await database.post.create({
      data: {
        title: props.title,
        content: props.content,
        user: {
          connect: {
            id: user.id,
          },
        },
        tags: {
          createMany: {
            data: props.tags.map((tag) => ({ name: tag })),
          },
        },
      },
    });

    return newPost.id;
  }

  //props: CreateCommentDTO(부모댓글)
  async createComment(props) {
    const user = await this.userService.findByUserId(props.userId);

    const post = await database.post.findUnique({
      where: {
        id: props.postId,
      },
    });

    if (!post) throw { status: 404, message: "게시글을 찾을 수 없습니다." };

    const newComment = await database.comment.create({
      data: {
        content: props.content,
        post: {
          connect: {
            id: post.id,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return newComment.id;
  }

  //props: CreateChildCommentDTO(자식댓글)
  async createChildComment(props) {
    const user = await this.userService.findByUserId(props.userId);

    const parentComment = await database.comment.findUnique({
      wher: {
        id: props.parentCommentId,
      },
    });

    if (!parentComment)
      throw { status: 404, message: "부모 댓글을 찾을 수 없습니다." };

    const newChildComment = await database.comment.create({
      data: {
        content: props.content,
        user: {
          connect: {
            id: user.id,
          },
        },
        parentComment: {
          connect: {
            id: parentComment.id,
          },
        },
      },
    });

    return newChildComment.id;
  }

  async updatePost(postId, props, user) {
    const post = await database.post.findUnique({
      where: {
        id: postId,
      },
    });

    if(!post)
      throw new { status: 404, message: "게시글을 찾을 수 없습니다"};

    if(post.userId !== user.id)
      throw { status: 403, message: "본인 글만 수정가능합니다."};

    if(props.tags) {

      //태그를 모두 삭제하고 새로 수정한 태그로 교체
      await database.tag.deleteMany({
        where: {
          postId: post.id,
        },
      });

      await database.tag.createMany ({
        data: props.tag.map((tag) => ({
          name: tag,
          postId: post.id,
        })),
      });
    }

    await database.post.update({
      where: {
        id: post.id,
      },
      data: {
        title: props.title,
        content: props.content,
      },
    });
  }

  //게시글 수정
  async updateComment(commentId, props, user) {
    const comment = await database.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw { status: 404, message: "댓글을 찾을 수 없습니다."};

    if(comment.userId !== user.id)
      throw { status: 403, message: "댓글 수정 권한이 없습니다."};

    await database.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        content: props.content,
      },
    });
  }

  //게시글 삭제
  async deletePost(postId, user) {
    const post = await database.post.findUnique({
      where: {
        id: postId,
      },
    });

    if(!post)
      throw {status: 404, message: "게시글을 찾을 수 없습니다."};

    if(post.userId !== user.id)
      throw {status: 404, message: "삭제 권한이 없습니다."};
    
    await database.post.delete({
      where: {
         id: post.id,
      },
    });
  }

  //댓글 삭제
  async deleteComment(commentId, user) {
    const comment = await database.post.findUnique({
      where: {
        id: commentId,
      },
    });

    if(!comment)
      throw {status: 404, message: "게시글을 찾을 수 없습니다."};

    if(comment.userId !== user.id)
      throw {status: 404, message: "삭제 권한이 없습니다."};
    
    await database.comment.delete({
      where: {
         id: comment.id,
      },
    });
  }
}
