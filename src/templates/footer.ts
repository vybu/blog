import { a } from './elements';
import { ContainerIds } from './constants';

export function footer(commitsCount: number): string {
  const currentYear = `${new Date().getFullYear()}`;
  const originalDate = '2017';

  return `
        <footer>
            <div class="footer-inner">
                <div class="built-by">Built by Vytenis Butkevicius, ©  ${
                  currentYear !== originalDate ? `${originalDate} - ` : ''
                } ${currentYear}</div>
                <div class="powered-by">Proudly Powered By ${a(
                  ContainerIds.Noop,
                  'https://github.com/vybu/blog',
                  `${commitsCount} Commits`,
                )}</div>
            </div>
        </footer>
`;
}
