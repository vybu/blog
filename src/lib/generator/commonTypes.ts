export type fileName = string;

export interface ArticleRaw {
    fileName,
    content: string
};

export interface MetaData {
    author: string,
    title: string,
    date: string,
    summary?: string
}

export interface ParsedArticle {
    metaData: MetaData,
    articleHtml: string
}

export interface ProcessedArticle extends ArticleRaw {
    parsedArticle: ParsedArticle
}
