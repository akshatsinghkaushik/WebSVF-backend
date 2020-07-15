import Listr from 'listr';
import chalk from 'chalk';
import commandExists from 'command-exists';


export async function checkDependencies(depInstall){
    return new Listr(
        [
          {
            title: `Checking ${chalk.inverse('NodeJS')} Installation`,
            enabled: () => true,
            task: () =>
              commandExists('node')
                .then(() => {
                  depInstall.node = true;
                })
                .catch(() => {
                  console.error(
                    `${chalk.inverse(
                      `${chalk.blue.bold(
                        'node'
                      )} command not found${'\n'.repeat(
                        2
                      )} Please install ${chalk.blue.bold(
                        'NodeJS'
                      )} version ${chalk.yellow.bold('>=10')} ${'\n'.repeat(
                        2
                      )} Then Run the command ${chalk.green.italic(
                        'sudo create-analysis'
                      )} again to finish setting up`
                    )}`
                  );
                  process.exit(1);
                }),
          },
          {
            title: `Checking ${chalk.inverse('NodeJS')} Version`,
            enabled: () => true,
            task: () => {
              const version = process.version;
              if (parseFloat(version.substr(1, version.length)) >= 10) {
                depInstall.nodeVers = true;
              } else {
                console.error(
                  `${chalk.inverse(
                    `The current version of node ${chalk.blue.bold(
                      version
                    )} is outdated${'\n'.repeat(
                      2
                    )}Please Update node to version ${chalk.yellow.bold(
                      '>=10'
                    )} ${'\n'.repeat(
                      2
                    )} Then Run the command ${chalk.green.italic(
                      'sudo create-analysis'
                    )} again to finish setting up`
                  )}`
                );
                process.exit(1);
              }
            },
          },
          {
            title: `Checking ${chalk.inverse('VSCode')} Installation`,
            enabled: () => true,
            task: () =>
              commandExists('code')
                .then(() => {
                  depInstall.vscode = true;
                })
                .catch(() => {}),
          },
          {
            title: `Checking ${chalk.inverse('Unzip')} Installation`,
            enabled: () => true,
            task: () =>
              commandExists('unzip')
                .then(() => {
                  depInstall.unzip = true;
                })
                .catch(() => {}),
          }
        ],
        { concurrent: true }
      )
} 