import execao from 'execa-output';
import Listr from 'listr';
import chalk from 'chalk';

export function installExtensionsOnCloud(homePath, dirPresence) {
  return new Listr(
    [
      {
        title: `Downloading ${chalk.inverse('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.coderFrontend,
        task: () =>
          execao('wget', [
            '-c',
            'https://github.com/SVF-tools/WebSVF/releases/download/0.9.0/WebSVF-frontend-extension_0.9.0.vsix',
          ]),
      },
      {
        title: `Downloading ${chalk.inverse('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.coderCodemap,
        task: () =>
          execao('wget', [
            '-c',
            'https://github.com/SVF-tools/WebSVF/releases/download/0.0.1/codemap-extension-0.0.1.vsix',
          ]),
      },
      {
        title: `Making directory ${chalk.blue('.local')}`,
        enabled: () => !dirPresence.local,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', '.local'], {
            cwd: `${homePath}/`,
          }),
      },
      {
        title: `Making directory ${chalk.blue('share')}`,
        enabled: () => !dirPresence.localShare,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', 'share'], {
            cwd: `${homePath}/.local/`,
          }),
      },
      {
        title: `Making directory ${chalk.blue('code-server')}`,
        enabled: () => !dirPresence.codeServer,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', 'share'], {
            cwd: `${homePath}/.local/share/`,
          }),
      },
      {
        title: `Making directory ${chalk.blue('code-server Extensions')}`,
        enabled: () => !dirPresence.coderExtDir,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', '-p', 'extensions'], {
            cwd: `${homePath}/.local/share/code-server`,
          }),
      },
      {
        title: `Moving ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.coderFrontend,
        task: () =>
          execao('mv', [
            '-f',
            'WebSVF-frontend-extension_0.9.0.vsix',
            `${homePath}/.local/share/code-server/extensions/WebSVF-frontend-extension_0.9.0.zip`,
          ]),
      },
      {
        title: `Moving ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.coderCodemap,
        task: () =>
          execao('mv', [
            '-f',
            'codemap-extension-0.0.1.vsix',
            `${homePath}/.local/share/code-server/extensions/codemap-extension-0.0.1.zip`,
          ]),
      },
      {
        title: `Making directory ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.coderCodemap,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', 'codemap-extension-0.0.1'], {
            cwd: `${homePath}/.local/share/code-server/extensions/`,
          }),
      },
      {
        title: `Making directory ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.coderFrontend,
        task: () =>
          execao('mkdir', ['-m', 'a=rwx', 'WebSVF-frontend-extension_0.9.0'], {
            cwd: `${homePath}/.local/share/code-server/extensions/`,
          }),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.coderCodemap,
        task: () =>
          execao(
            'unzip',
            [
              'codemap-extension-0.0.1.zip',
              '-d',
              `${homePath}/.local/share/code-server/extensions/codemap-extension-0.0.1`,
            ],
            {
              cwd: `${homePath}/.local/share/code-server/extensions/`,
            }
          ),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.coderFrontend,
        task: () =>
          execao(
            'unzip',
            [
              'WebSVF-frontend-extension_0.9.0.zip',
              '-d',
              `${homePath}/.local/share/code-server/extensions/WebSVF-frontend-extension_0.9.0`,
            ],
            {
              cwd: `${homePath}/.local/share/code-server/extensions/`,
            }
          ),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-codemap-extension')}`,
        enabled: () => !dirPresence.coderCodemap,
        task: () =>
          execao('mv', [
            '-f',
            `${homePath}/.local/share/code-server/extensions/codemap-extension-0.0.1/extension/`,
            `${homePath}/.local/share/code-server/extensions/codemap-extension/`,
          ]),
      },
      {
        title: `Extracting ${chalk.blue('WebSVF-frontend-extension')}`,
        enabled: () => !dirPresence.coderFrontend,
        task: () =>
          execao('mv', [
            '-f',
            `${homePath}/.local/share/code-server/extensions/WebSVF-frontend-extension_0.9.0/extension/`,
            `${homePath}/.local/share/code-server/extensions/WebSVF-frontend-extension/`,
          ]),
      },
      {
        title: `Allowing ${chalk.blue('access to extensions')}`,
        enabled: () => !dirPresence.coderFrontend && !dirPresence.coderCodemap,
        task: () => {
          execao('chmod', [
            '-R',
            'u=rwx,g=rwx,o=rwx',
            `${homePath}/.local/share/code-server/extensions/WebSVF-frontend-extension/`,
          ]);
          execao('chmod', [
            '-R',
            'u=rwx,g=rwx,o=rwx',
            `${homePath}/.local/share/code-server/extensions/codemap-extension/`,
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
              'WebSVF-frontend-extension_0.9.0.zip',
              'codemap-extension-0.0.1.zip',
              'WebSVF-frontend-extension_0.9.0/',
              'codemap-extension-0.0.1/',
            ],
            {
              cwd: `${homePath}/.local/share/code-server/extensions/`,
            }
          ),
      },
    ],
    { concurrent: false }
  );
}
