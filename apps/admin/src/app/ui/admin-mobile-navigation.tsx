import { ActionButton, Portal, SidePanel } from '@seed-design/react';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { navigationItems } from './admin-navigation';
import { AdminSidebar } from './admin-sidebar';
import * as styles from './admin-shell.css';

export function AdminMobileNavigation({ menu }: { menu: keyof typeof navigationItems }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = router.subscribe('onResolved', () => {
      setOpen(false);
    });

    return unsubscribe;
  }, [router]);

  return (
    <SidePanel.Root direction="left" open={open} onOpenChange={setOpen}>
      <SidePanel.Trigger asChild>
        <ActionButton variant="neutralWeak" size="small" className={styles.menuButton}>
          메뉴
        </ActionButton>
      </SidePanel.Trigger>
      <Portal>
        <SidePanel.Backdrop className={styles.panelBackdrop} />
        <SidePanel.Positioner>
          <SidePanel.Content className={styles.mobilePanel} data-seed-color-mode="dark-only">
            <SidePanel.Header>
              <SidePanel.Title>관리자 메뉴</SidePanel.Title>
              <SidePanel.CloseButton className={styles.closeButton} aria-label="메뉴 닫기">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </SidePanel.CloseButton>
            </SidePanel.Header>
            <SidePanel.Description className={styles.srOnly}>
              이동할 관리자 화면을 선택하세요.
            </SidePanel.Description>
            <AdminSidebar menu={menu} onNavigate={() => setOpen(false)} />
          </SidePanel.Content>
        </SidePanel.Positioner>
      </Portal>
    </SidePanel.Root>
  );
}
