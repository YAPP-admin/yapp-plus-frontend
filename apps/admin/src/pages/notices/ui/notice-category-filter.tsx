/** URL 기반 공지 종류 선택을 라디오 그룹으로 제공한다. */
import { RadioGroup } from '@seed-design/react/primitive';
import {
  noticeCategoryLabels,
  noticeCategorySchema,
  type NoticeCategory,
} from '../model/notice-search';
import * as styles from './notice-category-filter.css';

/** URL의 공지 종류를 라디오 선택과 동기화한다. */
export function NoticeCategoryFilter({
  category,
  onCategoryChange,
}: {
  category: NoticeCategory;
  onCategoryChange: (category: NoticeCategory) => void;
}) {
  return (
    <RadioGroup.Root
      className={styles.filter}
      aria-label="공지 종류"
      value={category}
      onValueChange={(value) => onCategoryChange(noticeCategorySchema.parse(value))}
    >
      {noticeCategorySchema.options.map((value) => (
        <RadioGroup.Item key={value} value={value} className={styles.filterItem}>
          {noticeCategoryLabels[value]}
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
