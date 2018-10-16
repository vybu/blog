import { container } from './container';
import { header } from './header';
import { footer } from './footer';
import { ContainerIds } from './constants';

export function base({
  body = '',
  head = '',
  commitsCount,
}: {
  body: string;
  head?: string;
  commitsCount: number;
}): string {
  return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <title>Vytenis Blog</title>        
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="description" content="Quality content about programming, computer science,
             with focus on front end technologies: HTML, CSS, JavaScript">

            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
            <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
            <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
            <link rel="manifest" href="/manifest.json">
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
            <meta name="theme-color" content="#ffffff">

            <link rel="preload" as="font" crossorigin="crossorigin" type="font/woff2" href="/fonts/Merriweather_Bold.woff2">
            <link rel="preload" as="font" crossorigin="crossorigin" type="font/woff2" href="/fonts/SourceSansPro_Regular.woff2">
            <link rel="preload" as="font" crossorigin="crossorigin" type="font/woff2" href="/fonts/SourceSansPro_Bold.woff2">
            <link rel="preload" as="font" crossorigin="crossorigin" type="font/woff2" href="/fonts/SourceSansPro_It.woff2">
            ${head}
        </head>
        <body>
            ${header()}
            ${container(body, ContainerIds.App, 'main')}            
            ${footer(commitsCount)}
        </body>
        </html>
`;
}
