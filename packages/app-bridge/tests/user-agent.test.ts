import { describe, expect, it } from 'vitest';

import { YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN, isYappPlusWebViewUserAgent } from '../src';

const expectedToken = 'YAPPPlusWebView';

describe('isYappPlusWebViewUserAgent', () => {
  it('공개 앱 식별 토큰을 고정한다', () => {
    expect(YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN).toBe(expectedToken);
  });

  it.each([
    expectedToken,
    `Existing/User-Agent ${expectedToken}`,
    `Existing/User-Agent\t${expectedToken}\nAnotherToken`,
  ])('독립된 앱 식별 토큰이 있는 %j을 WebView로 판별한다', (userAgent) => {
    expect(isYappPlusWebViewUserAgent(userAgent)).toBe(true);
  });

  it.each([
    undefined,
    null,
    '',
    'Existing/User-Agent',
    `Not${expectedToken}`,
    `${expectedToken}Beta`,
    `${expectedToken}/1.0`,
  ])('정확한 앱 식별 토큰이 없는 %j을 일반 웹으로 판별한다', (userAgent) => {
    expect(isYappPlusWebViewUserAgent(userAgent)).toBe(false);
  });
});
