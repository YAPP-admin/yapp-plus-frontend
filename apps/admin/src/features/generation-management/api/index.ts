/** 관리자 기수 API adapter와 Query 옵션의 공개 진입점입니다. */
export {
  getGenerations,
  listGenerations,
  type GenerationListItem,
  type GenerationListResponse,
} from './generation-api';
export { generationsQueryKey, generationsQueryOptions } from './generation-queries';
