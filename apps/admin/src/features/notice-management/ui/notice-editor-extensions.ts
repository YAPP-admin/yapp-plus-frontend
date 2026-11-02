import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { StarterKit } from '@tiptap/starter-kit';

export function noticeExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      link: { openOnClick: false, autolink: true },
    }),
    Extension.create({
      name: 'noticeLinkNavigation',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            props: {
              handleClick(view, _position, event) {
                if (!view.editable || event.button !== 0 || !(event.target instanceof Element)) {
                  return false;
                }
                const link = event.target.closest('a[href]');
                if (!(link instanceof HTMLAnchorElement) || !view.dom.contains(link)) {
                  return false;
                }
                event.preventDefault();
                window.open(link.href, '_blank', 'noopener,noreferrer');
                return true;
              },
            },
          }),
        ];
      },
    }),
  ];
}
