import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src="/logo.svg" alt="" width={24} height={24} />
          <span className="font-semibold">{appName}</span>
        </>
      ),
    },
    links: [
      { text: 'Documentation', url: '/docs', active: 'nested-url' },
      { text: 'Try Online', url: 'https://peranti.vercel.app', external: true },
      { text: 'Download', url: `https://github.com/${gitConfig.user}/${gitConfig.repo}/releases`, external: true },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
