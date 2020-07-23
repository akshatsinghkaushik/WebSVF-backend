import Listr from 'listr';
import execao from 'execa-output';
import chalk from 'chalk';

export function uninstallComponents(homePath) {
  return new Listr(
    [
      {
        title: `Removing ${chalk.blue('Extension files')}`,
        enabled: () => true,
        task: () =>
          execao(
            'rm',
            [
              '-rf',
              'WebSVF-frontend-extension',
              'codemap-extension',
              'codemap-extension-0.0.1/',
              'WebSVF-frontend-extension_0.9.0/',
            ],
            {
              cwd: `${homePath}/.vscode/extensions`,
            }
          ),
      },
      {
        title: `Removing ${chalk.blue('WebSVF-frontend-server')}`,
        enabled: () => true,
        task: () =>
          execao('rm', ['-rf', '.bug-report', 'svf'], {
            cwd: `${homePath}/`,
          }),
      },
    ],
    { concurrent: false }
  );
}
