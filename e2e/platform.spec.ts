import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
});
test.afterEach(({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

test('dataset filtering and document preview match the reference flow', async ({ page }) => {
  await page.goto('/datasets');
  await expect(page.getByRole('heading', { name: '数据集管理' })).toBeVisible();
  await page.screenshot({ path: '/tmp/spatiotemporal-e2e-datasets.png', fullPage: true });

  await page.getByPlaceholder('请输入数据集名称').fill('土地管理法');
  await page.getByRole('button', { name: /查\s*询/ }).click();
  await expect(page.getByText('中华人民共和国土地管理法.txt')).toBeVisible();
  await expect(page.getByText('土地利用总体规划编制审批规定.txt')).toHaveCount(0);

  await page.getByRole('button', { name: /重\s*置/ }).click();
  await page.getByRole('button', { name: /eye 预览/ }).first().click();
  await expect(page).toHaveURL(/\/datasets\/ds-001$/);
  await expect(page.getByRole('heading', { name: '土地利用总体规划编制审批规定' })).toBeVisible();
  await page.screenshot({ path: '/tmp/spatiotemporal-e2e-document.png', fullPage: true });
});

test('knowledge chunks can be edited in the modal', async ({ page }) => {
  await page.goto('/knowledge/kb-001/chunks/doc-001');
  await expect(page.getByText('切片列表')).toBeVisible();
  await page.screenshot({ path: '/tmp/spatiotemporal-e2e-chunks.png', fullPage: true });

  await page.getByRole('button', { name: '编辑', exact: true }).first().click();
  const editor = page.getByLabel('切片内容');
  await editor.fill('土地利用总体规划实行分级审批，编辑后的浏览器验证内容。');
  await page.getByRole('button', { name: /保\s*存/ }).click();
  await expect(page.locator('.chunk-content-cell').filter({ hasText: '土地利用总体规划实行分级审批，编辑后的浏览器验证内容。' })).toBeVisible();
});

test('agent chat returns evidence and opens highlighted source text', async ({ page }) => {
  await page.goto('/agents');
  await expect(page.getByText('自然资源智能问答')).toBeVisible();
  await page.screenshot({ path: '/tmp/spatiotemporal-e2e-agents.png', fullPage: true });

  await page.getByRole('button', { name: '体验', exact: true }).first().click();
  await expect(page.getByText('您好，我是自然资源智能管家')).toBeVisible();
  await page.screenshot({ path: '/tmp/spatiotemporal-e2e-chat-welcome.png', fullPage: true });

  await page.getByPlaceholder('请输入您的问题，Shift + Enter 换行').fill('土地利用总体规划如何审批？');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await expect(page.getByText('二、核心回答')).toBeVisible();
  await page.getByRole('button', { name: /土地利用总体规划编制审批规定/ }).first().click();
  await expect(page.getByText('原文预览')).toBeVisible();
  await expect(page.locator('mark.source-highlight')).toBeVisible();
  await page.screenshot({ path: '/tmp/spatiotemporal-e2e-chat-source.png', fullPage: true });
});

test('uploaded knowledge survives reload and remains traceable from conversation records', async ({ page }) => {
  const fileName = '玄武岩监测巡检规程.txt';
  await page.goto('/datasets');
  await page.getByRole('button', { name: /新建数据集/ }).click();
  await page.getByLabel('选择数据文件').setInputFiles({ name: fileName, mimeType: 'text/plain', buffer: Buffer.from('玄武岩监测点巡检周期为每七天一次，巡检时记录地表温度与岩体裂隙。') });
  await page.getByRole('button', { name: /确\s*定/ }).click();
  await expect(page.getByRole('link', { name: fileName })).toBeVisible();

  await page.goto('/knowledge/import?knowledgeId=kb-001');
  await page.getByRole('row').filter({ hasText: fileName }).getByRole('checkbox').check();
  await page.getByRole('button', { name: /导入选中数据/ }).click();
  await expect(page).toHaveURL(/\/knowledge\/kb-001$/);
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: fileName })).toBeVisible();

  await page.goto('/settings');
  await page.getByRole('combobox', { name: '默认模型' }).click();
  await page.getByText('Qwen-Max', { exact: true }).last().click();
  await page.getByRole('button', { name: /保存配置/ }).click();
  await expect(page.getByText('配置已保存')).toBeVisible();
  await page.reload();
  await expect(page.locator('.settings-form')).toContainText('Qwen-Max');

  await page.goto('/agents/agent-natural/chat');
  await page.getByPlaceholder('请输入您的问题，Shift + Enter 换行').fill('玄武岩监测点巡检周期是多少？');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await expect(page.locator('.message.assistant')).toContainText('每七天一次');
  await page.getByRole('button', { name: /玄武岩监测巡检规程/ }).click();
  await expect(page.locator('mark.source-highlight')).toContainText('每七天一次');

  await page.getByRole('link', { name: '问答记录', exact: true }).click();
  await page.getByRole('row').filter({ hasText: '玄武岩监测点巡检周期是多少？' }).getByRole('button', { name: '继续问答' }).click();
  await page.reload();
  await expect(page.locator('.message.assistant')).toContainText('每七天一次');
  await expect(page.getByLabel('参考来源')).toContainText('玄武岩监测巡检规程');
});

test('malformed persisted tree rows cannot crash the dataset table', async ({ page }) => {
  await page.goto('/datasets');
  await page.getByRole('switch', { name: '启用 土地利用总体规划编制审批规定.txt', exact: true }).click();
  await page.evaluate(() => {
    const key = 'industry-llm-platform-state-v1';
    const state = JSON.parse(localStorage.getItem(key)!);
    state.datasets[0].children = {};
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await expect(page.getByRole('link', { name: '土地利用总体规划编制审批规定.txt' })).toBeVisible();
});

test('a storage quota failure leaves uploads open and existing datasets unchanged', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); };
  });
  await page.goto('/datasets');
  await page.getByRole('button', { name: /新建数据集/ }).click();
  await page.getByLabel('选择数据文件').setInputFiles({ name: '未保存文件.txt', mimeType: 'text/plain', buffer: Buffer.from('存储失败测试') });
  await page.getByRole('button', { name: /确\s*定/ }).click();
  await expect(page.getByRole('dialog')).toContainText('文件未保存');
  await expect(page.getByRole('link', { name: '未保存文件.txt' })).toHaveCount(0);
  await page.getByRole('button', { name: /取\s*消/ }).click();
  await expect(page.getByRole('link', { name: '土地利用总体规划编制审批规定.txt' })).toBeVisible();
});

test('chat remains usable on short and narrow viewports', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 600 }, { width: 1280, height: 560 }, { width: 720, height: 354 }, { width: 390, height: 600 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/agents/agent-natural/chat');
    const send = page.getByRole('button', { name: '发送', exact: true });
    const input = page.getByPlaceholder('请输入您的问题，Shift + Enter 换行');
    await expect(send).toBeInViewport({ ratio: 1 });
    await expect(input).toBeInViewport({ ratio: 1 });
    await input.fill('土地利用总体规划如何审批？');
    await send.click();
    await expect(page.getByText('二、核心回答')).toBeVisible();
    await expect(send).toBeInViewport({ ratio: 1 });
    const overflow = await page.evaluate(() => ({ horizontal: document.documentElement.scrollWidth > window.innerWidth, vertical: document.documentElement.scrollHeight > window.innerHeight }));
    expect(overflow).toEqual({ horizontal: false, vertical: false });
    await page.screenshot({ path: `/tmp/spatiotemporal-e2e-chat-${viewport.width}-${viewport.height}.png`, fullPage: true });
    await page.getByRole('button', { name: '关闭引用' }).click();
    await input.fill('zxqvunknown');
    await send.click();
    await expect(page.locator('.message.assistant').last()).toContainText('暂未在已连接知识库中找到相关内容');
    if (viewport.width < 560) {
      await page.getByRole('button', { name: '历史会话', exact: true }).click();
      await page.getByRole('button', { name: /新建会话/ }).click();
      await expect(page.getByRole('button', { name: '历史会话', exact: true })).toHaveAttribute('aria-expanded', 'false');
      await expect(input).toBeInViewport({ ratio: 1 });
      await page.screenshot({ path: '/tmp/spatiotemporal-e2e-mobile-welcome.png', fullPage: true });
    }
  }
});

test('agent cards settle after entrance and keep hover and keyboard feedback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/agents');
  const card = page.locator('.agent-card').first();
  await expect(card).toBeVisible();
  const entrance = await card.evaluate((element) => {
    const style = getComputedStyle(element);
    return { name: style.animationName, duration: parseFloat(style.animationDuration), iterations: style.animationIterationCount };
  });
  expect(entrance.name).not.toBe('none');
  expect(entrance.duration).toBeGreaterThan(0);
  expect(entrance.duration).toBeLessThanOrEqual(0.4);
  expect(entrance.iterations).toBe('1');
  await card.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
  await card.hover();
  await expect.poll(() => card.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)).toBeLessThan(-1);
  const filter = page.getByRole('button', { name: '行业问答', exact: true });
  await filter.focus();
  await page.keyboard.press('Enter');
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(filter).toBeFocused();
  expect(await filter.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await expect(page.locator('.agent-card')).toHaveCount(1);
});

test('header flows and route changes animate without interrupting navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/datasets');
  const header = page.locator('.app-header');
  expect(await header.evaluate((element) => getComputedStyle(element, '::after').animationName)).toBe('header-flow');
  expect(await header.evaluate((element) => getComputedStyle(element, '::before').animationName)).toBe('header-glow');
  await expect(page.locator('.dataset-workspace')).toHaveCSS('animation-name', 'section-enter');
  await page.getByRole('link', { name: '知识库管理', exact: true }).first().click();
  await expect(page).toHaveURL(/\/knowledge$/);
  const content = page.locator('.app-main > .page');
  await expect(content).toBeVisible();
  await expect(content).toHaveCSS('animation-name', 'page-enter');
  await page.getByRole('link', { name: '智能体中心', exact: true }).click();
  await expect(page).toHaveURL(/\/agents$/);
  await expect(page.locator('.agent-card').first()).toBeVisible();
});

test('reduced motion removes entrances and hover movement without hiding content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/agents');
  expect(await page.locator('.app-header').evaluate((element) => getComputedStyle(element, '::after').animationName)).toBe('none');
  expect(await page.locator('.app-header').evaluate((element) => getComputedStyle(element, '::before').animationName)).toBe('none');
  const card = page.locator('.agent-card').first();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('animation-name', 'none');
  await expect(card).toHaveCSS('animation-delay', '0s');
  await page.getByRole('button', { name: '详情', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: '体验', exact: true }).first().click();
  await expect(page.getByText('您好，我是自然资源智能管家')).toBeVisible();
  expect(await page.locator('.chat-main').evaluate((element) => getComputedStyle(element, '::after').animationName)).toBe('none');
  expect(await page.locator('.robot-avatar').evaluate((element) => getComputedStyle(element, '::before').animationName)).toBe('none');
  const input = page.getByPlaceholder('请输入您的问题，Shift + Enter 换行');
  await input.fill('土地利用总体规划如何审批？');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await expect(page.locator('.message.assistant')).toContainText('二、核心回答');
  await expect(page.getByLabel('参考来源')).toBeVisible();
  for (const selector of ['.chat-page', '.message.assistant', '.citation-panel', '.citation-card']) {
    await expect(page.locator(selector).first()).toHaveCSS('animation-name', 'none');
  }
  await page.getByRole('button', { name: /土地利用总体规划编制审批规定/ }).first().click();
  await expect(page.locator('mark.source-highlight')).toBeVisible();
});

test('agent filters and cards fit narrow screens without clipped controls', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 600 }, { width: 320, height: 560 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/agents');
    const search = page.getByPlaceholder('搜索智能体');
    const filter = page.getByRole('button', { name: '公共服务', exact: true });
    await expect(search).toBeInViewport({ ratio: 1 });
    await expect(filter).toBeInViewport({ ratio: 1 });
    const singleLine = await filter.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects().length === 1;
    });
    expect(singleLine).toBe(true);
    await filter.click();
    await expect(page.locator('.agent-card')).toHaveCount(1);
    const card = page.locator('.agent-card');
    await card.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await expect(card).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole('button', { name: '体验', exact: true })).toBeInViewport({ ratio: 1 });
    const fits = await page.locator('.app-main').evaluate((element) => element.scrollWidth <= element.clientWidth);
    expect(fits).toBe(true);
  }
});

test('upload dropzone shows keyboard focus on the native file input', async ({ page }) => {
  await page.goto('/datasets');
  await page.getByRole('button', { name: /新建数据集/ }).click();
  await page.getByRole('combobox', { name: /数据分类/ }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('选择数据文件')).toBeFocused();
  await expect(page.locator('.upload-dropzone')).toHaveCSS('outline-style', 'solid');
});
