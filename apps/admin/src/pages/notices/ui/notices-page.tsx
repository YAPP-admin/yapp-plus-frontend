import { FilterSelect } from '~/shared/ui/filter-select';
import { Link } from '@tanstack/react-router';
import {
  noticeCategoryLabels,
  noticeCategorySchema,
  type NoticeCategory,
} from '../model/notice-search';
import { page, title, description, filter, placeholder, createLink } from './notices-page.css';

export function NoticesPage({
  category,
  onCategoryChange,
}: {
  category: NoticeCategory;
  onCategoryChange: (category: NoticeCategory) => void;
}) {
  return (
    <main className={page}>
      <h1 className={title}>공지 목록</h1>
      <p className={description}>종류별 공지를 확인합니다.</p>
      <Link className={createLink} to="/notices/new" search={{}}>
        공지 작성
      </Link>
      <FilterSelect
        className={filter}
        label="공지 종류"
        value={category}
        options={noticeCategorySchema.options}
        labels={noticeCategoryLabels}
        onChange={onCategoryChange}
      />
      <p className={placeholder}>공지 목록을 준비 중입니다.</p>
    </main>
  );
}
