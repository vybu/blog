interface IResourceBase {
  __id: string;
  createdAt: string | number;
}
interface IArticle extends IResourceBase {
  id: string;
}
interface ILike extends IResourceBase {
  timestamp: string | number;
  _ip: string;
  __articleId?: string;
}
interface IComment extends IResourceBase {
  id: string;
  _ip: string;
  name: string;
  comment: string;
  parent: string;
  __articleId?: string;
}

interface IData {
  articles: IArticle[];
  likes: ILike[];
  comments: IComment[];
}
interface IDataWrapper {
  data: IData;
}

const createFindFunction = (properties) => {
  const props = Object.entries(properties).filter(
    (key, value) => key !== undefined && value !== undefined,
  );
  return (target) => props.every(([ key, value ]) => target[key] === value);
};

const getId = () => `${Date.now() + Math.random()}`;

export class DataWrapper implements IDataWrapper {
  data: IData;
  constructor() {
    this.data = {
      articles: [],
      likes: [],
      comments: [],
    };
  }

  static create<T>(obj: T): T & IResourceBase {
    return Object.assign({ createdAt: Date.now(), __id: getId() }, obj);
  }

  getData(): IData {
    return this.data;
  }

  findArticleById(id) {
    return this.data.articles.find((a) => a.id === id);
  }

  findLikes(props) {
    return this.data.likes.filter(createFindFunction(props));
  }

  findLike(props) {
    return this.findLikes(props)[0];
  }

  findComments(props) {
    return this.data.comments.filter(createFindFunction(props));
  }

  findComment(props) {
    return this.findComments(props)[0];
  }

  createArticle({ id }) {
    const existing = this.findArticleById(id);

    if (existing) {
      console.error(`Article with this id: ${id} already exists`);
    }
    const resource = DataWrapper.create({
      id,
    });
    this.data.articles.push(resource);
    return resource;
  }

  createLike({ timestamp, _ip }: ILike) {
    const resource = DataWrapper.create({
      timestamp,
      _ip,
    });
    this.data.likes.push(resource);
    return resource;
  }

  createComment({ id = getId(), _ip, name, comment, parent }: IComment) {
    const resource = DataWrapper.create({
      id,
      _ip,
      name,
      comment,
      parent,
    });
    this.data.comments.push(resource);
    return resource;
  }

  addLikeToArticle({ __id: __articleId }: IArticle, { __id: likeId }: ILike) {
    const like = this.data.likes.find((a) => a.__id === likeId);
    like.__articleId = __articleId;
    return like;
  }

  addCommentToArticle({ __id: __articleId }: IArticle, { __id: commentId }: IComment) {
    const comment = this.data.comments.find((a) => a.__id === commentId);
    comment.__articleId = __articleId;
    return comment;
  }
}
