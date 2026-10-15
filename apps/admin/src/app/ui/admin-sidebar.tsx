import { Badge, SideNavigation, Text } from '@seed-design/react';
import { Link } from '@tanstack/react-router';
import { navigationItems } from './admin-navigation';
import * as styles from './admin-shell.css';

type AdminSidebarProps = {
  menu: keyof typeof navigationItems;
  onNavigate?: () => void;
};

export function AdminSidebar({ menu, onNavigate }: AdminSidebarProps) {
  return (
    <SideNavigation.Root className={styles.sidebar} asChild>
      <aside aria-label="관리자">
        <SideNavigation.Header className={styles.sidebarHeader}>
          <Link className={styles.brand} to="/" search={{}} aria-label="YAPP+ Admin">
            <span className={styles.brandMark} aria-hidden="true">
              Y
            </span>
            <span className={styles.brandText}>
              <Text textStyle="t6Bold">YAPP+</Text>
              <Text textStyle="t2Regular" color="fg.neutralMuted">
                Admin workspace
              </Text>
            </span>
          </Link>
        </SideNavigation.Header>
        <div className={styles.generation}>
          <div className={styles.generationHeading}>
            <Text textStyle="t4Bold" color="fg.neutral">
              {import.meta.env.DEV ? '33기' : '운영 기수'}
            </Text>
            <Badge variant="weak" tone="neutral">
              {import.meta.env.DEV ? '예시' : '미연결'}
            </Badge>
          </div>
          <Text textStyle="t2Regular" color="fg.neutralMuted">
            현재 운영 워크스페이스
          </Text>
        </div>
        <SideNavigation.Content className={styles.navigation} asChild>
          <nav aria-label="주요 메뉴">
            {['워크스페이스', '활동 관리', '운영 관리'].map((section) => (
              <SideNavigation.Group key={section}>
                <SideNavigation.GroupLabel className={styles.groupLabel}>
                  {section}
                </SideNavigation.GroupLabel>
                {Object.values(navigationItems)
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <SideNavigation.Item
                      key={item.to}
                      current={navigationItems[menu].to === item.to}
                      asChild
                    >
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        search={{}}
                        className={styles.navigationLink}
                        activeOptions={{
                          exact: item.exact,
                          includeSearch: false,
                        }}
                        inactiveProps={
                          navigationItems[menu].to === item.to ? { 'aria-current': 'location' } : {}
                        }
                      >
                        <SideNavigation.ItemLabel className={styles.navigationLabel}>
                          {item.label}
                        </SideNavigation.ItemLabel>
                      </Link>
                    </SideNavigation.Item>
                  ))}
              </SideNavigation.Group>
            ))}
          </nav>
        </SideNavigation.Content>
        <SideNavigation.Footer className={styles.sidebarFooter}>
          <span className={styles.profileMark} aria-hidden="true">
            Y
          </span>
          <div className={styles.profileText}>
            <Text textStyle="t3Bold" color="fg.neutral">
              {import.meta.env.DEV ? '운영진 예시' : '운영진'}
            </Text>
            <Text textStyle="t2Regular" color="fg.neutralMuted">
              YAPP 운영 워크스페이스
            </Text>
          </div>
        </SideNavigation.Footer>
      </aside>
    </SideNavigation.Root>
  );
}
