import { container } from './container';
import { header } from './header';
import { footer } from './footer';
import { ContainerIds } from './constants';

export function base({ body = '', head = ''}: {body: string, head?: string}): string {
    return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Blog</title>
            <meta name="description" content="Blog">
            <!--<meta property="og:site_name" content="https://keepcalm.top/">-->
            ${head}
        </head>
        <body>
            ${header()}
            ${container(body, ContainerIds.App, 'main')}            
            ${footer()}
        </body>
        </html>
`;
}
