export const LATEST_RESULT_CATEGORIES = ['men', 'women'] as const;

export type LatestResultCategory = (typeof LATEST_RESULT_CATEGORIES)[number];
