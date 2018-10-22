import { ILikesTimestamps } from '../server/db/db';
import { urlBase } from '../client/lib';

export function getLikesText(likesCount: number, hasReaderLiked: boolean) {
  if (likesCount === 0) {
    return hasReaderLiked ? 'You liked this post' : 'Be first to like this post!';
  } else if (likesCount === 1) {
    return hasReaderLiked ? 'You and 1 other person liked this post' : '1 person liked this post';
  } else {
    return hasReaderLiked
      ? `You and ${likesCount} other people liked this post`
      : `${likesCount} people liked this post`;
  }
}

function likesUnits(likes: ILikesTimestamps) {
  return likes.map(
    (timestamp) =>
      `<div class="lb-unit" data-t="${timestamp}" title="Someone liked this at ${new Date(
        timestamp,
      ).toLocaleString()}">
      </div>`,
  );
}

export function likesContainer(likes: ILikesTimestamps, articleId: string) {
  return `<div class="lb-container">
            <div class="lb-text-container">
              <span class="lb-likes">${getLikesText(likes.length, false)}</span>
            </div>
            <div class="lb-unit-container">
              ${likesUnits(likes)}
              <a href="${urlBase}/likes_/${articleId}" class="lb-like" title="Click to like this post">+</a>
            </div>
          </div>`;
}
