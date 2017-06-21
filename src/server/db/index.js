const Sequelize = require('sequelize');
const path = require('path');

const DB_NAME = process.env.DB_NAME || './db.sqlite';
const sequalize = new Sequelize('database', 'username', 'password', {
    logging: false,
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === 'test' ? ':memory:' : path.resolve(__dirname, DB_NAME)
});

const Article = sequalize.define('article', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    }
});

const Like = sequalize.define('like', {
    timestamp: Sequelize.INTEGER,
    ip: Sequelize.STRING
});

const Comment = sequalize.define('comment', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    _ip: Sequelize.STRING,
    name: Sequelize.STRING,
    comment: Sequelize.STRING,
    parent: Sequelize.INTEGER
});

Article.hasMany(Like);
Article.hasMany(Comment);

Article.submitLike = async function(id, timestamp, ip) {
    try {
        const article = await Article.findById(id);
        const previousLike = await Like.findOne({ where: { ip } });
        if (previousLike) {
            return false;
        }
        const like = await Like.create({ timestamp, ip });
        await article.addLike(like);
        return true;
    } catch (e) {
        console.error('Failed to submitLike', e);
        return false;
    }
};

Article.retrieveLikes = async function name(id) {
    const article = await Article.findById(id);
    return await article.getLikes({ raw: true, attributes: ['timestamp', 'ip'] });
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
    // TODO: prevent too many comments from one ip;
    try {
        if (commentData.parent !== id) {
            // we don't allow to nest comments deeper than 1 level;
            // a comment can have a reply, but reply can't have a reply;
            const parentComment = await Comment.findById(commentData.parent);
            if (parentComment.parent !== id) {
                commentData.parent = parentComment.parent;
            }
        }

        const article = await Article.findById(id);
        const isValidPostFrequency = await Article.isCommentWithValidFrequency(article, commentData);
        if (!isValidPostFrequency) {
            return [false];
        }
        const comment = await Comment.create(commentData);
        await article.addComment(comment);
        return [true, comment.id];
    } catch (e) {
        console.error('Failed to submitComment on Article', e);
        return [false];
    }
};

Article.retrieveComments = async function() {
    // get comments, construct them into nested JSON
};

async function init() {
    return await sequalize.sync();
}

module.exports = { Article, Like, Comment, init, sequalize };
