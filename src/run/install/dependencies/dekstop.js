import execao from 'execa-output';
import Listr from 'listr';
import chalk from 'chalk';

export async function depInstallDesktop(depInstall) {
  return new Listr(
    [
      {
        title: `Installing ${chalk.inverse(
          'VSCode'
        )} (using snap package manager)`,
        enabled: () => true,
        skip: () => depInstall.vscode,
        task: () =>
          execao('snap', ['install', 'code', '--classic'], null, () => {}),
      },
      {
        title: `Installing ${chalk.inverse('Unzip')}`,
        enabled: () => true,
        skip: () => depInstall.unzip,
        task: () => execao('sudo', ['apt', 'install', '-y', 'unzip']),
      },
      {
        title: `Installing ${chalk.inverse('wget')}`,
        enabled: () => true,
        skip: () => depInstall.wget,
        task: () => execao('sudo', ['apt', 'install', '-y', 'wget']),
      },
      {
        title: `Installing ${chalk.inverse('wget')}`,
        enabled: () => true,
        skip: () => depInstall.git,
        task: () => execao('sudo', ['apt', 'install', '-y', 'git']),
      },
    ],
    { concurrent: false }
  );
}
