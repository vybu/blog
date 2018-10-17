import { ICommentWithReplies } from '../../server/db';
import { newComment } from './newComment';

var _MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a: Date, b: Date): number {
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function getDaysFormattedWithNoun(daysNumber: number): string {
  if (daysNumber === 0) return 'today';
  else if (daysNumber === 1) return '1 day ago';
  else return `${daysNumber} days ago`;
}

function removeUrlEscape(comment: string): string {
  const splitComment = comment.split('@');
  return splitComment.reduce((cmnt, val, i) => {
    if (val === '@' && (splitComment[i + 2] === '@' || splitComment[i - 2] === '@')) {
      return cmnt;
    }

    cmnt += val;
    return cmnt;
  }, '');
}

export function existingComment(
  data: ICommentWithReplies,
  articleId: string,
  parent: string = null,
) {
  if (parent === null) {
    parent = articleId;
  }
  const commentAge = dateDiffInDays(new Date(data.createdAt), new Date());

  return `
        <div class="existing-comment">
            <div id="${data.id}" class="inner-wrap">
                <div class="top">
                    <span class="name">${data.name || 'Anonymous'}</span>
                    <span class="time">${getDaysFormattedWithNoun(commentAge)}</span>
                </div>
                <p class="comment" name="comment">${removeUrlEscape(data.comment)}</p>
                <div class="add-reply"><a class="reply-btn" href="#${data.id}">Reply</a></div>

                <div class="new-reply">${newComment(articleId, data.id)}</div>
            </div>
            <div class="replies">${data.comments
              .map(c => existingComment(c, articleId))
              .join('')}</div>
        </div>
    `;
}
