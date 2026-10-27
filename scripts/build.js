// src/를 dist/에 압축 해제된 확장으로 빌드한다.
// content script는 ES module로 로드할 수 없으므로 진입점마다 IIFE 한 파일로 묶는다.
import { build, context } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';

const watch = process.argv.includes('--watch');

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
for (const file of ['manifest.json', 'popup.html']) {
  copyFileSync(`src/${file}`, `dist/${file}`);
}

const options = {
  entryPoints: ['src/content.ts', 'src/popup.ts'],
  outdir: 'dist',
  bundle: true,
  format: 'iife',
  target: 'chrome111',
  charset: 'utf8',
  logLevel: 'info',
};

if (watch) {
  // manifest.json 변경은 감시하지 않는다. 바꾸면 다시 실행한다.
  await (await context(options)).watch();
} else {
  await build(options);
}
