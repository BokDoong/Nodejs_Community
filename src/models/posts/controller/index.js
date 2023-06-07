import { Router } from "express";
import { pagination } from "../../../middleware/pagination";
import { PostService } from "../service";
import { CreateChildCommentDTO, CreateCommentDTO, CreatePostDTO, UpdatePostDTO, UpdateCommentDTO} from '../dto'

class PostController{
  router;
  path = "/posts";
  postService;

  constructor() {
    this.router = new Router();
    this.postService = new PostService();
    this.init();
  }

  init() {
    this.router.get("/:id", this.getPost.bind(this));
    this.router.get("/", pagination, this.getPosts.bind(this));

    this.router.post("/", this.createPost.bind(this));
    this.router.post("/:postId/like", this.postLike.bind(this));
    this.router.post("/comment", this.createComment.bind(this));
    this.router.post("/child-comment", this.createChildComment.bind(this));

    this.router.patch("/:postId", this.updatePost.bind(this));
    this.router.patch("/comment/:commentId", this.updateComment.bind(this));

    this.router.delete("/:id", this.deletePost.bind(this));
    this.router.delete("/comment/:commentId", this.deleteComment.bind(this));
  }

  async getPost(req, res, next) {
    try {
      const { id } = req.params;

      const post =  await this.postService.getPost(id, req.user);

      res.status(200).json({ post });
    } catch(err) {
      next(err);
    }
  }

  //URL: /posts?page=1&limit=14&searchValue=검색어
  async getPosts(req, res, next) {
    try {
      const searchValue  = req.query.searchValue;
      const { posts, count } = await this.postService.getPosts(
        {
          skip : req.skip, 
          take: req.take
        },
        searchValue
      );

      res.status(200).json({ posts, count });
    } catch(err) {
      next(err);
    }
  }

  async postLike(req, res, next) {
    try {
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};

      const { postId } = req.params;
      const { isLike } = req.body;

      await this.postService.postLike(req.user.id, postId, isLike);

      res.status(204).json({});
    } catch(err) {
      next(err);
    }
  }

  async createPost(req, res, next) {
    try{
      //로그인을 해야한다.(토큰에서 userId 뽑아오기 위해)
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};

      const body = req.body;
      const newPostId = await this.postService.createPost(
        new CreatePostDTO({
          title: body.title,
          content: body.content,
          tags: body.tags,
          userId: req.user.id,
        })
      );

      res.status(201).json({ id: newPostId });
    } catch(err) {
      next(err);
    }
  }

  async createComment(req, res, next) {
    try{
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};

      const body = req.body;
      const newCommentId = await this.postService.createComment(
        new CreateCommentDTO({
          content: body.content,
          userId: req.user.id,
          postId: body.postId,
        })
      );

      res.status(201).json({ id: newCommentId });
    } catch(err) {
      next(err);
    }
  }

  async createChildComment(req, res, next) {
    try{
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};

      const newChildCommentId = await this.postService.createChildComment(
        new CreateChildCommentDTO({
          content: body.content,
          parentCommnetId: body.parentCommnetId,
          userId: req.user.id,
        })
      );

      res.status(201).json({ id: newChildCommentId });
    } catch(err) {
      next(err);
    }
  }

  async updateComment(req, res, next) {
    try {
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};
        
      const{ commentId } = req.params;
      const body = req.body;

      await this.postService.updateComment(
        commentId,
        new UpdateCommentDTO(body),
        req.user
      );

      res.status(204).json({});
    } catch(err) {
      next(err);
    }
  }

  async updatePost(req, res, next) {
    try {
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};
        
      const{ postId } = req.params;
      const body = req.body;

      await this.postService.updatePost(
        postId, 
        new UpdatePostDTO(body),
        req.user
      );

      res.status(204).json({});
    } catch(err) {
      next(err);
    }
  }

  async deletePost(req, res, next){
    try {
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};

      const { id } = req.params;

      await this.postService.deletePost(id, req.user);

      res.status(204).json({});
    } catch(err) {
      next(err);
    }
  }

  async deleteComment(req, res, next){
    try {
      if(!req.user)
        throw {status: 401, message: "로그인을 진행해주세요."};

      const { commentId } = req.params;

      await this.postService.deleteComment(commentId, req.user);

      res.status(204).json({});
    } catch(err) {
      next(err);
    }
  }
}


const postController = new PostController();
export default postController;