import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

export type ApiOptions = {
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  paginate?: boolean;
};
type Api = (endpoint: string, options: ApiOptions) => unknown;
type Git = (...args: string[]) => string;
type Context = { repo: string; projectId: string | undefined; api?: Api; git?: Git };
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
const task = 'deploy:yapp-plus';
const shaPattern = /^[a-f0-9]{40}$/;
const gitCommand = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();

function github(
  endpoint: string,
  { query = {}, body, paginate = false }: ApiOptions = {},
): unknown {
  const args = [
    'api',
    endpoint,
    '--method',
    body ? 'POST' : 'GET',
    '-H',
    'X-GitHub-Api-Version: 2022-11-28',
  ];
  for (const [key, value] of Object.entries(query)) {
    args.push('-f', `${key}=${value}`);
  }
  if (paginate) {
    args.push('--paginate', '--slurp');
  }
  if (body) {
    args.push('--input', '-');
  }
  const result: unknown = JSON.parse(
    execFileSync('gh', args, { encoding: 'utf8', input: body ? JSON.stringify(body) : undefined }),
  );
  if (paginate) {
    if (!Array.isArray(result)) {
      throw new Error('배포 페이지 응답이 올바르지 않습니다.');
    }
    const pages: unknown[] = result;
    return pages.flat();
  }
  return result;
}

function environment(projectId: string | undefined) {
  if (!/^[A-Za-z0-9_-]+$/.test(projectId ?? '')) {
    throw new Error('Vercel 프로젝트 ID가 필요합니다.');
  }
  return `production-${projectId}`;
}

export function resolveComparison({
  repo,
  projectId,
  head,
  api = github,
  git = gitCommand,
}: Context & { head: string | undefined }) {
  if (!shaPattern.test(head ?? '')) {
    throw new Error('검증된 HEAD SHA가 필요합니다.');
  }
  const response = api(`repos/${repo}/deployments`, {
    query: { environment: environment(projectId), task, per_page: '100' },
    paginate: true,
  });
  if (!Array.isArray(response)) {
    throw new Error('배포 이력 응답이 올바르지 않습니다.');
  }
  const deployments = response.map((value: unknown) => {
    if (
      !isRecord(value) ||
      typeof value.id !== 'number' ||
      !Number.isSafeInteger(value.id) ||
      typeof value.sha !== 'string' ||
      !shaPattern.test(value.sha)
    ) {
      throw new Error('배포 이력 응답이 올바르지 않습니다.');
    }
    return { id: value.id, sha: value.sha };
  });
  const latest = deployments.reduce<{ id: number; sha: string } | undefined>(
    (found, current) => (!found || current.id > found.id ? current : found),
    undefined,
  );
  if (!latest) {
    return { force_all: 'true' };
  }
  const statuses = api(`repos/${repo}/deployments/${latest.id}/statuses`, {
    query: { per_page: '1' },
  });
  if (
    !Array.isArray(statuses) ||
    statuses.some((s: unknown) => !isRecord(s) || typeof s.state !== 'string')
  ) {
    throw new Error('배포 상태 응답이 올바르지 않습니다.');
  }
  // 실제 배포 후 기록 실패도 가능하므로 과거 성공 이력으로 돌아가지 않습니다.
  const status: unknown = statuses[0];
  if (!isRecord(status) || status.state !== 'success') {
    return { force_all: 'true' };
  }
  try {
    git('merge-base', '--is-ancestor', latest.sha, head ?? '');
  } catch {
    return { force_all: 'true' };
  }
  return { base_sha: latest.sha, force_all: 'false' };
}

export function beginDeployment({ repo, projectId, api = github, git = gitCommand }: Context) {
  const sha = git('rev-parse', 'HEAD');
  if (!shaPattern.test(sha)) {
    throw new Error('checkout SHA가 올바르지 않습니다.');
  }
  const result = api(`repos/${repo}/deployments`, {
    body: {
      ref: sha,
      task,
      environment: environment(projectId),
      auto_merge: false,
      required_contexts: [],
      production_environment: true,
    },
  });
  if (!isRecord(result) || typeof result.id !== 'number' || !Number.isSafeInteger(result.id)) {
    throw new Error('배포 시도 생성에 실패했습니다.');
  }
  return result.id;
}

export function finishDeployment({
  repo,
  deploymentId,
  deploymentUrl,
  logUrl,
  api = github,
}: {
  repo: string;
  deploymentId: string | undefined;
  deploymentUrl: string | undefined;
  logUrl: string;
  api?: Api;
}) {
  if (!/^\d+$/.test(deploymentId ?? '')) {
    throw new Error('배포 시도 ID가 필요합니다.');
  }
  for (const url of [deploymentUrl, logUrl]) {
    if (new URL(url ?? '').protocol !== 'https:') {
      throw new Error('배포와 로그 URL은 HTTPS여야 합니다.');
    }
  }
  const result = api(`repos/${repo}/deployments/${deploymentId}/statuses`, {
    body: {
      state: 'success',
      environment_url: deploymentUrl,
      log_url: logUrl,
      auto_inactive: false,
    },
  });
  if (!isRecord(result) || result.state !== 'success') {
    throw new Error('배포 성공 기록에 실패했습니다.');
  }
}

if (import.meta.main) {
  const repo = process.env.GITHUB_REPOSITORY ?? '';
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? '')) {
    throw new Error('GitHub 저장소가 필요합니다.');
  }
  const projectId = process.env.VERCEL_PROJECT_ID;
  const mode = process.argv[2];
  if (mode === 'resolve') {
    const result = resolveComparison({ repo, projectId, head: process.env.HEAD_SHA });
    appendFileSync(
      process.env.GITHUB_OUTPUT ?? '',
      Object.entries(result)
        .map(([key, value]) => `${key}=${value}\n`)
        .join(''),
    );
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `### Production 비교 기준 (${projectId})\n\nBase: ${result.base_sha ?? '없음'}\n\n강제 배포: ${result.force_all}\n`,
      );
    }
  } else if (mode === 'begin') {
    const id = beginDeployment({ repo, projectId });
    process.stdout.write(String(id));
  } else if (mode === 'success') {
    finishDeployment({
      repo,
      deploymentId: process.env.DEPLOYMENT_ID,
      deploymentUrl: process.env.DEPLOYMENT_URL,
      logUrl: `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    });
  } else {
    throw new Error('resolve, begin, success 중 하나를 지정하세요.');
  }
}
