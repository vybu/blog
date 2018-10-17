import { isDevMode, isTestMode } from '../lib/constants';
import { IDataWrapper, sortDsc, sortAsc, IComment } from './dataWrapper';

export interface ICommentWithReplies extends IComment {
  comments: ICommentWithReplies[];
}

export class Database {
  constructor(public dataWrapper: IDataWrapper) {}

  async getArticle(id) {
    let article = this.dataWrapper.findArticleById(id);
    if (!article) {
      // TODO: check that such id actually exist
      article = this.dataWrapper.createArticle({ id });
    }

    return article;
  }

  async submitLike(id, { timestamp, _ip }) {
    try {
      const article = await this.getArticle(id);
      const previousLike = this.dataWrapper.findLike({ _ip });
      if (!article || previousLike) {
        return false;
      }
      const like = this.dataWrapper.createLike({ timestamp, _ip });
      this.dataWrapper.addLikeToArticle(article, like);
      await this.dataWrapper.save();
      return true;
    } catch (e) {
      !isTestMode && console.error('Failed to submitLike', e);
      return false;
    }
  }

  async retrieveLikes(id) {
    const article = this.dataWrapper.findArticleById(id);
    if (!article) return [];
    const likes = this.dataWrapper.findLikes({ __articleId: article.__id });
    return likes.map(({ timestamp }) => timestamp);
  }

  async retrieveLikeForIp(_ip) {
    const like = this.dataWrapper.findLike({ _ip });
    if (!like) return null;
    return like.timestamp;
  }

  async isCommentWithValidFrequency(article, commentData: IComment) {
    const [com1, com2] = sortDsc(this.dataWrapper.findComments({ _ip: commentData._ip }));

    if (com1 && com2 && !isDevMode) {
      // has made at least 2 comments and last one is older than 10 min;
      return Date.now() - new Date(com1.createdAt).getTime() > 1000 * 60 * 10;
    }
    return true;
  }

  async submitComment(id: string, commentData: IComment) {
    try {
      const article = await this.getArticle(id);
      if (!article) {
        return [false, null];
      }

      if (commentData.parent !== id) {
        // we don't allow to nest comments deeper than 1 level;
        // a comment can have a reply, but reply can't have a reply;
        const parentComment = this.dataWrapper.findComment({ id: commentData.parent });

        if (!parentComment) {
          return [false, null];
        }
        if (parentComment.parent !== id) {
          commentData.parent = parentComment.parent;
        }
      }

      const isValidPostFrequency = await this.isCommentWithValidFrequency(article, commentData);
      if (!isValidPostFrequency) {
        return [false, null];
      }

      const comment = this.dataWrapper.createComment(commentData);
      this.dataWrapper.addCommentToArticle(article, comment);
      await this.dataWrapper.save();
      return [true, comment.id];
    } catch (e) {
      !isTestMode && console.error('Failed to submitComment on Article', e);
      return [false, null];
    }
  }

  async retrieveComments(id: string): Promise<ICommentWithReplies[] | []> {
    // get comments, construct them into nested JSON`
    const article = this.dataWrapper.findArticleById(id);
    if (!article) {
      return [];
    }

    const comments = sortAsc(this.dataWrapper.findComments({ __articleId: article.__id }));

    return comments.reduce((result, comment) => {
      comment.comments = comment.comments || [];
      if (comment.parent === id) {
        result.push(comment);
      } else {
        const parent = result.find(c => c.id === comment.parent);
        parent.comments.push(comment);
      }

      return result;
    }, []);
  }
}
