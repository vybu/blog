import Sequelize = require('sequelize');
import path = require('path');
import { isDevMode, isTestMode } from '../lib/constants';

const DB_NAME = process.env.DB_NAME || './db.sqlite';
const sequalize = new Sequelize('database', 'username', 'password', {
    logging: false,
    dialect: 'sqlite',
    storage: isTestMode ? ':memory:' : path.resolve(__dirname, '../../', DB_NAME)
});

export interface ArticleAttributes {
    id: string;
}
export interface ArticleInstance extends Sequelize.Instance<ArticleAttributes>, ArticleAttributes {
    addLike(like: LikeAttributes);
    getLikes(t: any): LikeAttributes[];
    addComment(comment: CommentAttributes);
    getComments(t: any): CommentAttributes[];
}
export interface ArticleModel extends Sequelize.Model<ArticleInstance, ArticleAttributes> {
    get?(id: string): Promise<ArticleInstance>;
    submitLike?(id: string, b: { timestamp: number; _ip: string }): Promise<boolean>;
    retrieveLikes?(id: string): Promise<number[]>;
    submitComment?(id: string, b: any): Promise<[boolean, string | null]>;
    retrieveLikeForIp?(_ip: string): Promise<number>;
    isCommentWithValidFrequency?(article: ArticleInstance, commentData: CommentAttributes): Promise<boolean>;
    retrieveComments?(id: string): Promise<CommentAttributes[]>;
}

export interface LikeAttributes {
    timestamp: number;
    _ip: string;
}
export interface LikeInstance extends Sequelize.Instance<LikeAttributes>, LikeAttributes {}
export interface LikeModel extends Sequelize.Model<LikeInstance, LikeAttributes> {}

export interface CommentAttributes {
    id: string;
    parent: string;
    comment: string;
    comments?: CommentAttributes[];
    name: string;
    _ip: string;
    createdAt?: string; // date
}
export interface CommentInstance extends Sequelize.Instance<CommentAttributes>, CommentAttributes {}
export interface CommentModel extends Sequelize.Model<CommentInstance, CommentAttributes> {}

const Article: ArticleModel = sequalize.define<ArticleInstance, ArticleAttributes>('article', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    }
});

const Like: LikeModel = sequalize.define<LikeInstance, LikeAttributes>('like', {
    timestamp: Sequelize.INTEGER,
    _ip: Sequelize.STRING
});

const Comment: CommentModel = sequalize.define<CommentInstance, CommentAttributes>('comment', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    _ip: { type: Sequelize.STRING, allowNull: false },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    comment: { type: Sequelize.STRING, allowNull: false },
    parent: { type: Sequelize.STRING, allowNull: false }
});

Article.hasMany(Like);
Article.hasMany(Comment);

Article.get = async function(id) {
    let article = await Article.findById(id);
    if (!article) {
        // TODO: check that such id actually exist
        article = await Article.create({ id });
    }

    return article;
};

Article.submitLike = async function(id, { timestamp, _ip }) {
    try {
        const article = await Article.get(id);
        const previousLike = await Like.findOne({ where: { _ip } });
        if (!article || previousLike) {
            return false;
        }
        const like = await Like.create({ timestamp, _ip });
        await article.addLike(like);
        return true;
    } catch (e) {
        !isTestMode && console.error('Failed to submitLike', e);
        return false;
    }
};

Article.retrieveLikes = async function name(id) {
    const article = await Article.findById(id);
    if (!article) return [];
    const likes = await article.getLikes({ raw: true, attributes: ['timestamp'] });
    return likes.map(({ timestamp }) => timestamp);
};

Article.retrieveLikeForIp = async function(_ip) {
    const like = await Like.findOne({ where: { _ip } });
    if (!like) return null;
    return like.timestamp;
};

Article.isCommentWithValidFrequency = async function(article, commentData: CommentAttributes) {
    const [com1, com2] = await article.getComments({ where: { _ip: commentData._ip }, order: [['createdAt', 'DESC']] });

    if (com1 && com2 && !isDevMode) {
        // has made at least 2 comments and last one is older than 10 min;
        return Date.now() - new Date(com1.createdAt).getTime() > 1000 * 60 * 10;
    }
    return true;
};

Article.submitComment = async function(id: string, commentData: CommentAttributes) {
    try {
        const article = await Article.get(id);
        if (!article) {
            return [false, null];
        }

        if (commentData.parent !== id) {
            // we don't allow to nest comments deeper than 1 level;
            // a comment can have a reply, but reply can't have a reply;
            const parentComment = await Comment.findById(commentData.parent);

            if (!parentComment) {
                return [false, null];
            }
            if (parentComment.parent !== id) {
                commentData.parent = parentComment.parent;
            }
        }

        const isValidPostFrequency = await Article.isCommentWithValidFrequency(article, commentData);
        if (!isValidPostFrequency) {
            return [false, null];
        }
        const comment = await Comment.create(commentData);
        await article.addComment(comment);
        return [true, comment.id];
    } catch (e) {
        !isTestMode && console.error('Failed to submitComment on Article', e);
        return [false, null];
    }
};

Article.retrieveComments = async function(id: string) {
    // get comments, construct them into nested JSON`
    const article = await Article.findById(id);
    if (!article) {
        return [];
    }

    const comments = await article.getComments({
        order: [['createdAt', 'ASC']],
        raw: true
    });

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
};

async function init() {
    return await sequalize.sync();
}

export { Article, Like, Comment, init, sequalize };
