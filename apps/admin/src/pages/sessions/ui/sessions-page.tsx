import { sessionPartLabels, sessionPartSchema, type SessionPart } from '../model/session-search';
import { page, title, description, filter, select, placeholder } from './sessions-page.css';

export function SessionsPage({
  part,
  onPartChange,
}: {
  part: SessionPart;
  onPartChange: (part: SessionPart) => void;
}) {
  return (
    <main className={page}>
      <h1 className={title}>세션 관리</h1>
      <p className={description}>직군별 세션을 확인합니다.</p>
      <div className={filter}>
        <label htmlFor="session-part">직군</label>
        <select
          id="session-part"
          className={select}
          value={part}
          onChange={(event) => onPartChange(sessionPartSchema.parse(event.currentTarget.value))}
        >
          {sessionPartSchema.options.map((value) => (
            <option key={value} value={value}>
              {sessionPartLabels[value]}
            </option>
          ))}
        </select>
      </div>
      <p className={placeholder}>세션 목록을 준비 중입니다.</p>
    </main>
  );
}
