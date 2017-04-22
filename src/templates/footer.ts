import { a } from './elements';
import { ContainerIds } from './constants';

export function footer(commitsCount: number): string {
    return `
        <footer>
            <div class="footer-inner">
                <div class="built-by">Built by Vytenis Butkevicius, 2017</div>
                <div class="powered-by">Proudly Powered By ${a(ContainerIds.Noop, 'https://github.com/CanisMajorisLT/blog', `${commitsCount} Commits`)}</div>
            </div>
        </footer>
`;
}
