import execao from 'execa-output';
import Listr from 'listr';
import chalk from 'chalk';

export async function depInstallDesktop(depInstall){
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
        ],
        { concurrent: false }
      );
}