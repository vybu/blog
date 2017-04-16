import { ContainerIds } from './constants';
import { a } from './elements';

export function header(): string {
    return `
        <header>
            <span>${a(ContainerIds.App, '/about', 'About')}</span>    
            <span>${a(ContainerIds.App, '/', 'Home')}</span>    
        </header>
`;
}
