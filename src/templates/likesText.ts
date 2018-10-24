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
