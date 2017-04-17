import { ContainerIds } from './constants';
import { a } from './elements';

export function header(): string {
    return `
        <header>
            <nav>
                <span>${a(ContainerIds.App, '/', 'Home')}</span>    
                <span>${a(ContainerIds.App, '/about', 'About')}</span>                    
            </nav>
        </header>
`;
}
