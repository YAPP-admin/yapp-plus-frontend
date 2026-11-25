import { StarterKit } from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';

export function noticeExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      link: { openOnClick: false, autolink: true },
    }),
    Markdown,
  ];
}
