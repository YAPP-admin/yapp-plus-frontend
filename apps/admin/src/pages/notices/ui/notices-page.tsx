import {
  noticeCategoryLabels,
  noticeCategorySchema,
  type NoticeCategory,
} from '../model/notice-search';
import { page, title, description, filter, select, placeholder } from './notices-page.css';

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
      <div className={filter}>
        <label htmlFor="notice-category">공지 종류</label>
        <select
          id="notice-category"
          className={select}
          value={category}
          onChange={(event) =>
            onCategoryChange(noticeCategorySchema.parse(event.currentTarget.value))
          }
        >
          {noticeCategorySchema.options.map((value) => (
            <option key={value} value={value}>
              {noticeCategoryLabels[value]}
            </option>
          ))}
        </select>
      </div>
      <p className={placeholder}>공지 목록을 준비 중입니다.</p>
    </main>
  );
}
