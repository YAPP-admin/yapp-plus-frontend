import { StarterKit } from '@tiptap/starter-kit';

export function noticeExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      link: { openOnClick: false, autolink: true },
    }),
  ];
}
