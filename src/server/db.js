const Sequelize = require('sequelize');
const path = require('path');

const isTest = process.env.NODE_ENV === 'test';

const DB_NAME = process.env.DB_NAME || './db.sqlite';
const sequalize = new Sequelize('database', 'username', 'password', {
    logging: false,
    dialect: 'sqlite',
    storage: isTest ? ':memory:' : path.resolve(__dirname, '../../', DB_NAME)
});

const Article = sequalize.define('article', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    }
});

const Like = sequalize.define('like', {
    timestamp: Sequelize.INTEGER,
    _ip: Sequelize.STRING
});

const Comment = sequalize.define('comment', {
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
        console.log('gonna create with', id);
        article = await Article.create({ id });
        console.log({ article });
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
        !isTest && console.error('Failed to submitLike', e);
        return false;
    }
};

Article.retrieveLikes = async function name(id) {
    const article = await Article.findById(id);
    if (!article) return [];
    return await article.getLikes({ raw: true, attributes: ['timestamp'] });
};

Article.retrieveLikeForIp = async function name(_ip) {
    const like = await Like.findOne({ where: { _ip } });
    if (!like) return null;
    return like.timestamp;
};

Article.isCommentWithValidFrequency = async function(article, commentData) {
    const [com1, com2] = await article.getComments({ where: { _ip: commentData._ip }, order: [['createdAt', 'DESC']] });

    if (com1 && com2) {
        // has made at least 2 comments and last one is older than 10 min;
        return Date.now() - new Date(com1.createdAt) > 1000 * 60 * 10;
    }
    return true;
};

Article.submitComment = async function(id, commentData) {
    try {
        const article = await Article.get(id);
        if (!article) {
            return [false];
        }
        console.log(1, article, commentData);
        if (commentData.parent !== id) {
            // we don't allow to nest comments deeper than 1 level;
            // a comment can have a reply, but reply can't have a reply;
            const parentComment = await Comment.findById(commentData.parent);
            if (parentComment.parent !== id) {
                commentData.parent = parentComment.parent;
            }
        }

        const isValidPostFrequency = await Article.isCommentWithValidFrequency(article, commentData);
        if (!isValidPostFrequency) {
            return [false];
        }
        const comment = await Comment.create(commentData);
        await article.addComment(comment);
        return [true, comment.id];
    } catch (e) {
        !isTest && console.error('Failed to submitComment on Article', e);
        return [false];
    }
};

Article.retrieveComments = async function(id) {
    // get comments, construct them into nested JSON
    const article = await Article.findById(id);
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

module.exports = { Article, Like, Comment, init, sequalize };
