import { ContainerIds } from './constants';
import { a } from './elements';

export function header(): string {
    return `
        <header>
            <h1>${a(ContainerIds.App, '/', 'Vytenis Blog')}</h1>
            <nav>
                <span class="about">${a(ContainerIds.Noop, 'https://github.com/CanisMajorisLT', 'Github')}</span>                    
                <span class="about">${a(ContainerIds.App, '/about', 'About')}</span>                    
            </nav>
        </header>
`;
}
