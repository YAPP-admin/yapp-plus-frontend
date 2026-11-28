import { Select, SideNavigation, Text } from '@seed-design/react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Badge } from '@yapp-plus/ui';
import { Check, ChevronDown } from 'lucide-react';
import { Fragment } from 'react';
import { useAdminGeneration } from '~/features/admin-generation';
import type { MemberSearch } from '~/pages/members';
import {
  navigationItems,
  memberNavigationItems,
  teamMappingNavigationItem,
} from './admin-navigation';
import * as styles from './admin-shell.css';

type AdminSidebarProps = {
  menu: keyof typeof navigationItems;
  memberSearch?: MemberSearch;
  teamMapping?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({ menu, memberSearch, teamMapping, onNavigate }: AdminSidebarProps) {
  const { generations, currentGeneration, selectGeneration } = useAdminGeneration();
  const isRoster = useRouterState({
    select: (state) => state.location.pathname === '/members/roster',
  });

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
          <Select.Root
            value={[String(currentGeneration.generationId)]}
            onValueChange={(values) => {
              const generationId = Number(values[0]);
              selectGeneration(generationId);
            }}
          >
            <Select.Trigger className={styles.generationSelect} aria-label="기수 선택">
              <Select.Value>{currentGeneration.generationName}</Select.Value>
              <Select.SuffixIcon svg={<ChevronDown aria-hidden="true" size={18} />} />
            </Select.Trigger>
            <Select.Positioner>
              <Select.Content data-seed-color-mode="dark-only">
                <Select.ScrollArea>
                  <Select.Group>
                    {generations.map((generation) => (
                      <Select.Item
                        key={generation.generationId}
                        value={String(generation.generationId)}
                        label={`${generation.generationName} · ID ${generation.generationId}`}
                      >
                        <Select.ItemBody>
                          <Select.ItemLabel />
                        </Select.ItemBody>
                        <Select.ItemIndicator selected={<Check aria-hidden="true" size={16} />} />
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.ScrollArea>
              </Select.Content>
            </Select.Positioner>
            <Select.HiddenSelect />
          </Select.Root>
          <Text textStyle="t2Regular" color="fg.neutralMuted">
            {currentGeneration.generationNumber}기 운영 워크스페이스
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
                    <Fragment key={item.to}>
                      <SideNavigation.Item
                        current={
                          navigationItems[menu].to === item.to &&
                          !(
                            item.to === '/members' &&
                            (memberSearch !== undefined || teamMapping === true || isRoster)
                          )
                        }
                        asChild
                      >
                        {item.to === '/members' ? (
                          <span
                            className={styles.navigationLink}
                            aria-current={
                              menu === 'members' && !memberSearch && !isRoster
                                ? 'location'
                                : undefined
                            }
                          >
                            <SideNavigation.ItemLabel className={styles.navigationLabel}>
                              회원 관리
                            </SideNavigation.ItemLabel>
                          </span>
                        ) : (
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
                              navigationItems[menu].to === item.to
                                ? { 'aria-current': 'location' }
                                : {}
                            }
                          >
                            <SideNavigation.ItemLabel className={styles.navigationLabel}>
                              {item.label}
                            </SideNavigation.ItemLabel>
                          </Link>
                        )}
                      </SideNavigation.Item>
                      {item.to === '/members' && (
                        <div className={styles.memberSubmenu}>
                          {memberNavigationItems.map(({ tab, label }) => (
                            <SideNavigation.Item
                              key={tab}
                              current={memberSearch?.tab === tab}
                              asChild
                            >
                              <Link
                                to="/members"
                                search={{ ...memberSearch, tab }}
                                resetScroll={false}
                                onClick={onNavigate}
                                className={styles.navigationLink}
                                aria-current={memberSearch?.tab === tab ? 'page' : undefined}
                                activeOptions={{ exact: true, includeSearch: true }}
                              >
                                <SideNavigation.ItemLabel>{label}</SideNavigation.ItemLabel>
                                {tab === 'pending' && (
                                  <Badge variant="weak" tone="neutral" aria-label="가입 대기 0건">
                                    0
                                  </Badge>
                                )}
                              </Link>
                            </SideNavigation.Item>
                          ))}
                          <SideNavigation.Item current={isRoster} asChild>
                            <Link
                              to="/members/roster"
                              search={{}}
                              onClick={onNavigate}
                              className={styles.navigationLink}
                              activeOptions={{ exact: true }}
                            >
                              <SideNavigation.ItemLabel>업로드 명단</SideNavigation.ItemLabel>
                            </Link>
                          </SideNavigation.Item>
                          <SideNavigation.Item current={teamMapping === true} asChild>
                            <Link
                              to={teamMappingNavigationItem.to}
                              search={{}}
                              resetScroll={false}
                              onClick={onNavigate}
                              className={styles.navigationLink}
                              aria-current={teamMapping ? 'page' : undefined}
                              activeOptions={{ exact: true, includeSearch: true }}
                            >
                              <SideNavigation.ItemLabel>
                                {teamMappingNavigationItem.label}
                              </SideNavigation.ItemLabel>
                            </Link>
                          </SideNavigation.Item>
                        </div>
                      )}
                    </Fragment>
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
