import { ICommentWithReplies } from '../../server/db';
export type fileName = string;

export interface ArticleRaw {
  fileName;
  content: string;
}

export interface ArticlesReadersData {
  likes: number[];
  comments: ICommentWithReplies[];
}

export interface MetaData {
  author: string;
  title: string;
  date: string;
  tags: string[];
  summary?: string;
  id: string;
}

export interface ParsedArticle {
  metaData: MetaData;
  articleHtml: string;
}

export interface ProcessedArticle extends ArticleRaw {
  parsedArticle: ParsedArticle;
  articlesReadersData: ArticlesReadersData;
}

export interface PageJson {
  renderedHtml: string;
}

export interface BuiltPage {
  fullPage: string;
  content: string;
}
