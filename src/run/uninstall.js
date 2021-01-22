import Listr from 'listr';
import execao from 'execa-output';
import chalk from 'chalk';
import getHomePath from 'home-path';

export async function runUninstall(options) {
  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}/`;
  }

  const unInstallTasks = new Listr([
    {
      title: `Uninstalling ${chalk.inverse('SVF')}`,
      enabled: () => true,
      task: () => uninstallComponents(homePath),
    },
  ]);

  //Run the list of Installation tasks defined above
  try {
    await unInstallTasks.run();
  } catch (e) {
    console.error(e);
  }
}

export function uninstallComponents(homePath) {
  return new Listr(
    [
      // {
      //   title: `Removing ${chalk.blue('Extension files')}`,
      //   enabled: () => true,
      //   task: () =>
      //     execao(
      //       'rm',
      //       [
      //         '-rf',
      //         'WebSVF-frontend-extension',
      //         'codemap-extension',
      //         'codemap-extension-0.0.1/',
      //         'WebSVF-frontend-extension_0.9.0/',
      //       ],
      //       {
      //         cwd: `${homePath}/.vscode/extensions`,
      //       }
      //     ),
      // },
      // {
      //   title: `Removing ${chalk.blue('WebSVF-frontend-server')}`,
      //   enabled: () => true,
      //   task: () =>
      //     execao('rm', ['-rf', '.bug-report', 'svf'], {
      //       cwd: `${homePath}/`,
      //     }),
      // },
      {
        title: `Removing ${chalk.blue('WebSVF-frontend-server')}`,
        enabled: () => true,
        task: () =>
          execao('rm', ['-rf', 'svf'], {
            cwd: `${homePath}/`,
          }),
      },
    ],
    { concurrent: false }
  );
}
