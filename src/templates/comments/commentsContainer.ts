import { ICommentWithReplies } from '../../server/db';
import { existingComment } from './existingComment';
import { newComment } from './newComment';

export function commentsContainer(comments: ICommentWithReplies[], articleId: string) {
  return `<div class="comments-container">
                ${newComment(articleId)}                    
                <div class="existing-comments-wrap">
                    ${comments.map(c => existingComment(c, articleId)).join('')}
                </div>
            </div>`;
}
