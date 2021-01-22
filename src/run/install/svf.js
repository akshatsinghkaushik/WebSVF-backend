import chalk from 'chalk';
import Listr from 'listr';
import commandExists from 'command-exists';
import execao from 'execa-output';

import getHomePath from 'home-path';

import {checkDirPresence} from '../../checks/dirPresence';

//import { installExtensions } from './run/install/extensions';

export async function runInstall(options) {
    //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
    let homePath = getHomePath();
  
    if (options.account) {
      homePath = `/home/${options.account}`;
    }
  
    //A JavaScript object containing boolean values representing whether a particular depndency is installed or not
    let depInstall = {
      //vscode: false,
      node: false,
      nodeVers: false,
      //unzip: false,
      //wget: false,
      git: false,
      cmake: false,
    };
  
    let dirPresence = {
      codemap: true,
      frontend: true,
      frontendServer: true,
      extDir: true,
      vscodeDir: true,
      svfLite: true,
      svflib: true,
    };
  
    dirPresence = await checkDirPresence(dirPresence, homePath);
  
    const installTasks = new Listr([
      {
        title: 'Checking Dependency Installations',
        enabled: () => true,
        task: () =>
          new Listr(
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
            //   {
            //     title: `Checking ${chalk.inverse('VSCode')} Installation`,
            //     enabled: () => true,
            //     task: () =>
            //       commandExists('code')
            //         .then(() => {
            //           depInstall.vscode = true;
            //         })
            //         .catch(() => {}),
            //   },
              {
                title: `Checking ${chalk.inverse('git')} Installation`,
                enabled: () => true,
                task: () =>
                  commandExists('git')
                    .then(() => {
                      depInstall.git = true;
                    })
                    .catch(() => {}),
              },
              {
                title: `Checking ${chalk.inverse('cmake')} Installation`,
                enabled: () => true,
                task: () =>
                  commandExists('cmake')
                    .then(() => {
                      depInstall.cmake = true;
                    })
                    .catch(() => {}),
              },
            //   {
            //     title: `Checking ${chalk.inverse('Unzip')} Installation`,
            //     enabled: () => true,
            //     task: () =>
            //       commandExists('unzip')
            //         .then(() => {
            //           depInstall.unzip = true;
            //         })
            //         .catch(() => {}),
            //   },
            //   {
            //     title: `Checking ${chalk.inverse('wget')} Installation`,
            //     enabled: () => true,
            //     task: () =>
            //       commandExists('wget')
            //         .then(() => {
            //           depInstall.wget = true;
            //         })
            //         .catch(() => {}),
            //   },
            ],
            { concurrent: true }
          ),
      },
      {
        title: 'Installing Dependencies',
        enabled: () => true,
        skip: () => {
          if (
            //depInstall.vscode &&
            depInstall.node &&
            depInstall.nodeVers &&
            // depInstall.unzip &&
            // depInstall.wget &&
            depInstall.git &&
            depInstall.cmake
          ) {
            return 'Dependencies already installed';
          }
        },
        task: () =>
          new Listr(
            [
            //   {
            //     title: `Installing ${chalk.inverse(
            //       'VSCode'
            //     )} (using snap package manager)`,
            //     enabled: () => true,
            //     skip: () => depInstall.vscode,
            //     task: () =>
            //       execao(
            //         'snap',
            //         ['install', 'code', '--classic'],
            //         null,
            //         () => {}
            //       ),
            //   },
            //   {
            //     title: `Installing ${chalk.inverse('Unzip')}`,
            //     enabled: () => true,
            //     skip: () => depInstall.unzip,
            //     task: () => execao('sudo', ['apt', 'install', '-y', 'unzip']),
            //   },
            //   {
            //     title: `Installing ${chalk.inverse('wget')}`,
            //     enabled: () => true,
            //     skip: () => depInstall.wget,
            //     task: () => execao('sudo', ['apt', 'install', '-y', 'wget']),
            //   },
              {
                title: `Installing ${chalk.inverse('git')}`,
                enabled: () => true,
                skip: () => depInstall.git,
                task: () => execao('sudo', ['apt', 'install', '-y', 'git']),
              },
              {
                title: `Installing ${chalk.inverse('cmake')}`,
                enabled: () => true,
                skip: () => depInstall.cmake,
                task: () => execao('sudo', ['apt', 'install', '-y', 'cmake']),
              },
            ],
            { concurrent: false }
          ),
      },
      {
        title: `Installing ${chalk.inverse('SVF (SVF-example and svf-lib)')}`,
        enabled: () => true,
        skip: () => dirPresence.svfLite,
        task: () =>
          new Listr([
            {
              title: `Creating svf directory`,
              enabled: () => true,
              task: () =>
                execao('mkdir', ['-m', 'a=rwx', 'svf'], { cwd: `${homePath}` }),
            },
            {
              title: `Creating svf-lib directory`,
              enabled: () => true,
              task: () =>
                execao('mkdir', ['-m', 'a=rwx', 'svf-lib'], {
                  cwd: `${homePath}/svf`,
                }),
            },
            {
                title: `Clone SVF-npm for svf-lib`,
                enabled: () => true,
                task: () =>
                  execao(
                    'git',
                    ['clone', 'https://github.com/SVF-tools/SVF-npm.git'],
                    { cwd: `${homePath}/svf` }
                  ),
            },
            {
              title: `Copying over svf-lib files`,
              enabled: () => true,
              task: () =>
                execao(
                  'cp',
                  ['-arv', `include`, `Release-build`, `${homePath}/svf/svf-lib`],
                  { cwd: `${homePath}/svf/SVF-npm/SVF-linux/` },
                  () => {
                    dirPresence.svfLite = true;
                    execao('chmod', [
                      '-R',
                      'u=rwx,g=rwx,o=rwx',
                      `${homePath}/svf/svf-lib`,
                    ]);
                  }
                ),
            },
            {
                title: `Removing SVF-npm`,
                enabled: () => true,
                task: () =>
                  execao(
                    'rm',
                    ['-rf', 'SVF-npm/'],
                    { cwd: `${homePath}/svf` }
                  ),
            },
            {
              title: `Cloning SVF-example`,
              enabled: () => true,
              task: () =>
                execao(
                  'git',
                  ['clone', 'https://github.com/SVF-tools/SVF-example.git'],
                  { cwd: `${homePath}/svf` }
                ),
            },
            {
              title: `CMAKE SVF-example`,
              enabled: () => true,
              task: () =>
                execao(
                  'cmake',
                  [
                    `-DSVF_DIR=${homePath}/svf/svf-lib`,
                    `-DLLVM_DIR=${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04`,
                  ],
                  { cwd: `${homePath}/svf/SVF-example` }
                ),
            },
            {
              title: `Installing libtinfo-dev`,
              enabled: () => true,
              task: () =>
                execao('sudo', ['apt', 'install', '-y', 'libtinfo-dev'], {}),
            },
            {
              title: `Installing graphviz`,
              enabled: () => true,
              task: () =>
                execao('sudo', ['apt', 'install', '-y', 'graphviz'], {}),
            },
            {
              title: `make SVF-example binary/executable`,
              enabled: () => true,
              task: () =>
                execao('make', [], { cwd: `${homePath}/svf/SVF-example` }),
            },
            {
              title: `move SVF-example binary/executable to svf root folder`,
              enabled: () => true,
              task: () =>
                execao(
                  'mv',
                  ['svf-ex', `${homePath}/svf/`],
                  { cwd: `${homePath}/svf/SVF-example/bin` },
                  () => {
                    dirPresence.svfLite = true;
                    execao('chmod', [
                      '-R',
                      'u=rwx,g=rwx,o=rwx',
                      `${homePath}/svf/`,
                    ]);
                  }
                ),
            },
          ]),
      },
    //   {
    //     title: `Installing ${chalk.inverse('WebSVF frontend-server')}`,
    //     enabled: () => true,
    //     skip: () => dirPresence.frontendServer,
    //     task: () => installFrontendServer(homePath),
    //   },
    //   {
    //     title: `Installing ${chalk.inverse('WebSVF Extensions')}`,
    //     enabled: () => true,
    //     skip: () => {
    //       if (dirPresence.frontend && dirPresence.codemap) {
    //         return 'Extensions already installed';
    //       }
    //     },
    //     task: () => installExtensions(homePath, dirPresence),
    //   },
    ]);
  
    //Run the list of Installation tasks defined above
    try {
      await installTasks.run();
    } catch (e) {
      console.error(e);
    }
  }