import execao from 'execa-output';
import Listr from 'listr';
import chalk from 'chalk';

export function installExtensions(homePath, dirPresence) {
  return new Listr(
    [
      {
        title: `Downloading ${chalk.inverse('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.frontend,
        task: () =>
          execao('wget', [
            '-c',
            'https://github.com/SVF-tools/WebSVF/releases/download/0.9.0/WebSVF-frontend-extension_working.vsix',
          ]),
      },
      {
        title: `Downloading ${chalk.inverse('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.codemap,
        task: () =>
          execao('wget', [
            '-c',
            'https://github.com/SVF-tools/WebSVF/releases/download/0.0.1/codemap-extension-0.0.1.vsix',
          ]),
      },
      {
        title: `Making directory ${chalk.blue('VSCode Extensions')}`,
        enabled: () => !dirPresence.vscodeDir,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', '.vscode'], {
            cwd: `${homePath}/`,
          }),
      },
      {
        title: `Making directory ${chalk.blue('VSCode Extensions')}`,
        enabled: () => !dirPresence.extDir,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', '-p', 'extensions'], {
            cwd: `${homePath}/.vscode`,
          }),
      },
      {
        title: `Moving ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.frontend,
        task: () =>
          execao('mv', [
            '-f',
            'WebSVF-frontend-extension_working.vsix',
            `${homePath}/.vscode/extensions/WebSVF-frontend-extension_working.zip`,
          ]),
      },
      {
        title: `Moving ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.codemap,
        task: () =>
          execao('mv', [
            '-f',
            'codemap-extension-0.0.1.vsix',
            `${homePath}/.vscode/extensions/codemap-extension-0.0.1.zip`,
          ]),
      },
      {
        title: `Making directory ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.codemap,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', 'codemap-extension-0.0.1'], {
            cwd: `${homePath}/.vscode/extensions`,
          }),
      },
      {
        title: `Making directory ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.frontend,
        task: () =>
          execao(
            'mkdir',
            ['-m', 'a=rwx', 'WebSVF-frontend-extension_working'],
            {
              cwd: `${homePath}/.vscode/extensions`,
            }
          ),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.codemap,
        task: () =>
          execao(
            'unzip',
            [
              'codemap-extension-0.0.1.zip',
              '-d',
              `${homePath}/.vscode/extensions/codemap-extension-0.0.1`,
            ],
            {
              cwd: `${homePath}/.vscode/extensions`,
            }
          ),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.frontend,
        task: () =>
          execao(
            'unzip',
            [
              'WebSVF-frontend-extension_working.zip',
              '-d',
              `${homePath}/.vscode/extensions/WebSVF-frontend-extension_working`,
            ],
            {
              cwd: `${homePath}/.vscode/extensions`,
            }
          ),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.codemap,
        task: () =>
          execao('mv', [
            '-f',
            `${homePath}/.vscode/extensions/codemap-extension-0.0.1/extension/`,
            `${homePath}/.vscode/extensions/codemap-extension/`,
          ]),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.frontend,
        task: () =>
          execao('mv', [
            '-f',
            `${homePath}/.vscode/extensions/WebSVF-frontend-extension_working/extension/`,
            `${homePath}/.vscode/extensions/WebSVF-frontend-extension/`,
          ]),
      },
      {
        title: `Allowing ${chalk.blue('access to extensions')}`,
        enabled: () => !dirPresence.frontend && !dirPresence.codemap,
        task: () => {
          execao('chmod', [
            '-R',
            'u=rwx,g=rwx,o=rwx',
            `${homePath}/.vscode/extensions/WebSVF-frontend-extension/`,
          ]);
          execao('chmod', [
            '-R',
            'u=rwx,g=rwx,o=rwx',
            `${homePath}/.vscode/extensions/codemap-extension/`,
          ]);
        },
      },
      {
        title: `Removing Extension files`,
        enabled: () => !dirPresence.frontend && !dirPresence.codemap,
        task: () =>
          execao(
            'rm',
            [
              '-rf',
              'WebSVF-frontend-extension_working.zip',
              'codemap-extension-0.0.1.zip',
              'WebSVF-frontend-extension_working/',
              'codemap-extension-0.0.1/',
            ],
            {
              cwd: `${homePath}/.vscode/extensions`,
            }
          ),
      },
    ],
    { concurrent: false }
  );
}
