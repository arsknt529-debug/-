import type { Copy } from './types';

/** 専門家監修前の仮原稿として文言を登録する */
export const draft = (text: string): Copy => ({ text, review: 'draft' });

/** 監修済みの文言として登録する（監修者・日付は content/REVIEW_LOG.md に記録する） */
export const reviewed = (text: string): Copy => ({ text, review: 'reviewed' });
