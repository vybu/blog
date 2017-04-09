
export function articlesList(articles: string[]): string {
    return `
        <ul>
            ${articles.map(a => `<li>${a}</li>`)}
        </ul>
`;
}
