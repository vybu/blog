import { serverPort, isDevMode } from '../../lib/constants';

export function newComment(articleId: string, parentId: string = null) {
  return `
        <form class="new-comment" action="${
          isDevMode ? `http://localhost:${serverPort}` : ''
        }/comments/${articleId}" data-articleId="${articleId}" method="post">
            <input style="display: none" name="parent" type="text" value="${parentId || articleId}"></input>
            <textarea required="true" class="comment-area" name="comment" placeholder="Your comment goes here"></textarea>
            <div class="formatting-info">Only spacing is supported as formatting. To include a link escape it with @ i.e. @https://example.com@</div>
            <div class="bottom">
                <input class="name" name="name" type="text" placeholder="Francis Underwood (optional)"></input>            
                <button class="add">Add comment</button>
            </div>
        </form>
    `;
}
