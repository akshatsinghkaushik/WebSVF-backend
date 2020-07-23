import chalk from 'chalk';
import Listr from 'listr';
import path from 'path';
import execao from 'execa-output';
import { promisify } from 'util';
import fs from 'fs';
import getHomePath from 'home-path';

import { checkDependencies } from './checks/dependencies';

import { scanbc, whichbc } from './helper/functions';

import { uninstallComponents } from './run/uninstall';

import { installFrontendServer } from './run/install/frontendServer';

import { installExtensions } from './run/install/extensions';

import { depInstallDesktop } from './run/install/dependencies/dekstop';

import { prepCodemap } from './run/prep/codemap';

import { generateJSON } from './run/prep/frontend';

const access = promisify(fs.access);

//Function that checks for the presence of installation directories of required WebSVF components and dependencies
async function checkDirPresence(dirPresence, homePath) {
  //Check if the Installation directory for the WebSVF-frontend-server exists (~/.bug-report/)
  await access(`${homePath}/.bug-report`, fs.constants.R_OK).catch(() => {
    dirPresence.frontendServer = false;
  });

  //Check if the VSCode home directory exists (~/.vscode)
  await access(`${homePath}/.vscode`, fs.constants.R_OK).catch(() => {
    dirPresence.vscodeDir = false;
  });

  //Check if the VSCode extensions directory exists (~/.vscode/extensions)
  await access(`${homePath}/.vscode/extensions`, fs.constants.R_OK).catch(
    () => {
      dirPresence.extDir = false;
    }
  );

  //Check if the Installation directory for the WebSVF-codemap-extension exists (~/.vscode/extensions/codemap-extension)
  await access(
    `${homePath}/.vscode/extensions/codemap-extension`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.codemap = false;
  });

  //Check if the Installation directory for the WebSVF-frontend-extension exists (~/.vscode/extensions/WebSVF-frontend-extension)
  await access(
    `${homePath}/.vscode/extensions/WebSVF-frontend-extension`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.frontend = false;
  });

  await access(`${homePath}/svf/svf-ex`, fs.constants.R_OK).catch(() => {
    dirPresence.svfLite = false;
  });

  return dirPresence;
}

export async function runInstall(options) {
  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}/`;
  }

  let currentFileUrl = import.meta.url;

  let rootPath =
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../../'
    );

  let binPath = `${rootPath}bin/`;

  //A JavaScript object containing boolean values representing whether a particular depndency is installed or not
  let depInstall = {
    vscode: false,
    node: false,
    nodeVers: false,
    unzip: false,
    wget: false,
  };

  let dirPresence = {
    codemap: true,
    frontend: true,
    frontendServer: true,
    extDir: true,
    vscodeDir: true,
    svfLite: true,
  };

  dirPresence = await checkDirPresence(dirPresence, homePath);

  const installTasks = new Listr([
    {
      title: 'Checking Dependency Installations',
      enabled: () => true,
      task: () => checkDependencies(depInstall),
    },
    {
      title: 'Installing Dependencies',
      enabled: () => true,
      skip: () => {
        if (
          depInstall.vscode &&
          depInstall.node &&
          depInstall.nodeVers &&
          depInstall.unzip &&
          depInstall.wget
        ) {
          return 'Dependencies already installed';
        }
      },
      task: () => depInstallDesktop(depInstall),
    },
    {
      title: `Installing ${chalk.inverse('SVF-Lite')}`,
      enabled: () => true,
      skip: () => dirPresence.svfLite,
      task: () =>
        new Listr([
          {
            title: `Creating svf directory`,
            enabled: () => true,
            task: () => execao('mkdir', ['svf'], { cwd: `${homePath}` }),
          },
          {
            title: `Copying SVF-Lite executable`,
            enabled: () => true,
            task: () =>
              execao('cp', [`${binPath}svf-ex`, `${homePath}svf/`], () => {
                dirPresence.svfLite = true;
              }),
          },
        ]),
    },
    {
      title: `Installing ${chalk.inverse('WebSVF frontend-server')}`,
      enabled: () => true,
      skip: () => dirPresence.frontendServer,
      task: () => installFrontendServer(homePath),
    },
    {
      title: `Installing ${chalk.inverse('WebSVF Extensions')}`,
      enabled: () => true,
      skip: () => {
        if (dirPresence.frontend && dirPresence.codemap) {
          return 'Extensions already installed';
        }
      },
      task: () => installExtensions(homePath, dirPresence),
    },
  ]);

  //Run the list of Installation tasks defined above
  try {
    await installTasks.run();
  } catch (e) {
    console.error(e);
  }
}

export async function runUninstall(options) {
  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}/`;
  }

  const unInstallTasks = new Listr([
    {
      title: `Uninstalling ${chalk.inverse('WebSVF')}`,
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

export async function runEnvReset() {
  let homePath = getHomePath();

  let currentFileUrl = import.meta.url;

  let rootPath =
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../../'
    );

  let scriptsPath = `${rootPath}scripts/`;

  let dirPresence = {
    llvmDir: true,
    llvm10Dir: true,
    llvmDL: false,
    llvmUnpack: true,
    llvmInstall: true,
  };

  await access(`${homePath}/llvm-clang/`, fs.constants.R_OK).catch(() => {
    dirPresence.llvmDir = false;
  });

  await access(`${homePath}/llvm-clang/10`, fs.constants.R_OK).catch(() => {
    dirPresence.llvm10Dir = false;
  });

  await access(
    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.llvmUnpack = false;
  });

  await access(
    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04/bin/llvm-c-test`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.llvmInstall = false;
  });

  const envResetTasks = new Listr([
    {
      title: `Resetting Environment `,
      enabled: () => true,
      task: () => {
        const tasks = new Listr(
          [
            {
              title: `Removing LLVM files`,
              enabled: () => true,
              task: () =>
                execao('rm', ['-rf', 'llvm-clang/'], {
                  cwd: `${homePath}/`,
                }),
            },
            {
              title: `Refresh PATH`,
              enabled: () => true,
              task: () =>
                execao('sh', ['removeLLVMPath.sh'], {
                  cwd: `${scriptsPath}/`,
                }),
            },
          ],
          { concurrent: false }
        );

        return tasks;
      },
    },
  ]);

  //Run the list of Installation tasks defined above
  try {
    await envResetTasks.run();
  } catch (e) {
    console.error(e);
  }
}

export async function runEnvSetup(options) {
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}/`;
  }

  let currentFileUrl = import.meta.url;

  let rootPath =
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../../'
    );

  let binPath = `${rootPath}bin/`;
  let scriptsPath = `${rootPath}scripts/`;

  let dirPresence = {
    llvmDir: true,
    llvm10Dir: true,
    llvmDL: false,
    llvmUnpack: true,
    llvmInstall: true,
  };

  //A JavaScript object containing boolean values representing whether a particular dependency is installed or not
  let depInstall = {
    vscode: false,
    node: false,
    nodeVers: false,
    unzip: false,
    wget: false,
  };

  await access(`${homePath}/llvm-clang/`, fs.constants.R_OK).catch(() => {
    dirPresence.llvmDir = false;
  });

  await access(`${homePath}/llvm-clang/10`, fs.constants.R_OK).catch(() => {
    dirPresence.llvm10Dir = false;
  });

  await access(
    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.llvmUnpack = false;
  });

  await access(
    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04/bin/llvm-c-test`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.llvmInstall = false;
  });

  const envSetupTasks = new Listr([
    {
      title: `Setting up Environment `,
      enabled: () => true,
      task: () =>
        new Listr(
          [
            {
              title: 'Checking Dependency Installations',
              enabled: () => true,
              task: () => checkDependencies(depInstall),
            },
            {
              title: 'Installing Dependencies',
              enabled: () => true,
              skip: () => {
                if (
                  depInstall.vscode &&
                  depInstall.node &&
                  depInstall.nodeVers &&
                  depInstall.unzip &&
                  depInstall.wget
                ) {
                  return 'Dependencies already installed';
                }
              },
              task: () => depInstallDesktop(depInstall),
            },
            {
              title: `Create llvm-clang directory`,
              enabled: () => !dirPresence.llvmDir,
              task: () => {
                execao('mkdir', ['-m', 'a=rwx', 'llvm-clang'], {
                  cwd: `${homePath}/`,
                });

                execao('mkdir', ['-m', 'a=rwx', '10'], {
                  cwd: `${homePath}/llvm-clang/`,
                });

                dirPresence.llvmDir = true;
                dirPresence.llvm10Dir = true;
              },
            },
            {
              title: `Create llvm-clang/10 directory`,
              enabled: () => !dirPresence.llvm10Dir,
              task: () => {
                execao('mkdir', ['-m', 'a=rwx', '10'], {
                  cwd: `${homePath}/llvm-clang/`,
                });

                dirPresence.llvm10Dir = true;
              },
            },
            {
              title: `Downloading ${chalk.blue('LLVM-Clang 10.0')} binary`,
              enabled: () =>
                dirPresence.llvmDir &&
                dirPresence.llvm10Dir &&
                !dirPresence.llvmUnpack,
              task: () =>
                execao(
                  'wget',
                  [
                    '-c',
                    'https://github.com/llvm/llvm-project/releases/download/llvmorg-10.0.0/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz',
                  ],
                  {
                    cwd: `${homePath}/llvm-clang/10/`,
                  },
                  () => {
                    dirPresence.llvmDL = true;
                  }
                ),
            },
            {
              title: `Unpacking ${chalk.inverse.blue(
                'LLVM-Clang 10.0'
              )} binary`,
              enabled: () => dirPresence.llvmDL,
              task: () =>
                new Listr(
                  [
                    {
                      title: `Removing incomplete extraction`,
                      enabled: () => dirPresence.llvmUnpack,
                      task: () =>
                        execao(
                          'rm',
                          [
                            '-rf',
                            'clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04/',
                          ],
                          {
                            cwd: `${homePath}/llvm-clang/10/`,
                          },
                          (result) => {
                            dirPresence.llvmUnpack = false;
                          }
                        ),
                    },
                    {
                      title: `Unpacking files`,
                      enabled: () => true,
                      task: () =>
                        execao(
                          'tar',
                          [
                            '-xvf',
                            'clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz',
                            '-C',
                            `${homePath}/llvm-clang/10/`,
                          ],
                          {
                            cwd: `${homePath}/llvm-clang/10/`,
                          },
                          (result) => {
                            dirPresence.llvmUnpack = true;
                          }
                        ),
                    },
                    {
                      title: `Removing Downloaded LLVM-10 Binary`,
                      enabled: () => true,
                      task: () =>
                        execao(
                          'rm',
                          [
                            '-rf',
                            'clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz',
                          ],
                          {
                            cwd: `${homePath}/llvm-clang/10/`,
                          },
                          (result) => {
                            dirPresence.llvmDL = false;
                          }
                        ),
                    },
                  ],
                  { concurrent: false }
                ),
            },
            {
              title: `Installing Dependencies (Python and WLLVM)`,
              enabled: () => dirPresence.llvmUnpack,
              task: () => {
                if (options.osRelease.includes('18.04')) {
                  return execao(
                    'sudo',
                    ['apt-get', 'install', `-y`, 'python-pip'],
                    null,
                    () => {
                      execao('pip', ['install', 'wllvm']);
                    }
                  );
                } else if (options.osRelease.includes('20.04')) {
                  return execao(
                    'sudo',
                    ['apt-get', 'install', `-y`, 'python3-pip'],
                    null,
                    () => {
                      execao('pip3', ['install', 'wllvm']);
                    }
                  );
                }
              },
            },
            {
              title: 'Installing Dependencies for Demo Project',
              enabled: () => true,
              task: () =>
                execao('sudo', [
                  'apt',
                  'install',
                  '-y',
                  'libglib2.0-dev',
                  'libncurses5',
                  'libtool',
                ]),
            },
            {
              title: `Refresh PATH with updated ${chalk.inverse(
                'LLVM_DIR'
              )} and ${chalk.inverse('LLVM_COMPILER')} variables`,
              enabled: () => dirPresence.llvmUnpack,
              task: () =>
                execao(
                  'sh',
                  [
                    'updateLLVMPath.sh',
                    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04`,
                  ],
                  {
                    cwd: `${scriptsPath}/`,
                  }
                ),
            },
          ],
          { concurrent: false }
        ),
    },
  ]);

  //Run the list of Installation tasks defined above
  try {
    await envSetupTasks.run();
  } catch (e) {
    console.error(e);
  }
}

export async function runEgSetup(options) {
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}/`;
  }

  let currentFileUrl = import.meta.url;

  let rootPath =
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../../'
    );

  let binPath = `${rootPath}bin/`;
  let scriptsPath = `${rootPath}scripts/`;

  let dirPresence = {
    llvmDir: true,
    llvm10Dir: true,
    llvmDL: false,
    llvmUnpack: true,
    llvmInstall: true,
    demoProgZip: true,
    demoProgDir: true,
  };

  //A JavaScript object containing boolean values representing whether a particular dependency is installed or not
  let depInstall = {
    vscode: false,
    node: false,
    nodeVers: false,
    unzip: false,
    wget: false,
  };

  await access(
    `${process.cwd()}/pkg-config-0.26.tar.gz`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.demoProgZip = false;
  });

  await access(`${process.cwd()}/pkg-config-0.26/`, fs.constants.R_OK).catch(
    () => {
      dirPresence.demoProgDir = false;
    }
  );

  await access(`${homePath}/llvm-clang/`, fs.constants.R_OK).catch(() => {
    dirPresence.llvmDir = false;
  });

  await access(`${homePath}/llvm-clang/10`, fs.constants.R_OK).catch(() => {
    dirPresence.llvm10Dir = false;
  });

  await access(
    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.llvmUnpack = false;
  });

  await access(
    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04/bin/llvm-c-test`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.llvmInstall = false;
  });

  const egSetupTasks = new Listr([
    {
      title: `Setting up WebSVF Example (Demo) `,
      enabled: () => true,
      task: () =>
        new Listr(
          [
            {
              title: 'Checking Dependency Installations',
              enabled: () => true,
              task: () => checkDependencies(depInstall),
            },
            {
              title: 'Checking Environment',
              enabled: () => true,
              task: () => {
                if (!dirPresence.llvmInstall) {
                  console.error(
                    chalk.red(
                      `Please Run the command ${chalk.white.inverse(
                        'sudo create-analysis --setup-env'
                      )} followed by a system restart then run the operation again`
                    )
                  );
                  throw Error('Operation Failed');
                }
              },
            },
            {
              title: 'Downloading Demo Program',
              enabled: () => !dirPresence.demoProgDir,
              task: () =>
                execao(
                  'wget',
                  [
                    '-c',
                    'https://pkgconfig.freedesktop.org/releases/pkg-config-0.26.tar.gz',
                  ],
                  {
                    cwd: `${process.cwd()}`,
                  },
                  () => {
                    dirPresence.demoProgZip = true;
                  }
                ),
            },
            {
              title: 'Extracting Demo Program',
              enabled: () =>
                dirPresence.demoProgZip && !dirPresence.demoProgDir,
              task: () =>
                execao(
                  'tar',
                  ['xf', 'pkg-config-0.26.tar.gz'],
                  {
                    cwd: `${process.cwd()}`,
                  },
                  () => {
                    execao('rm', ['-rf', 'pkg-config-0.26.tar.gz'], {
                      cwd: `${process.cwd()}`,
                    });

                    dirPresence.demoProgZip = false;
                    dirPresence.demoProgDir = true;
                  }
                ),
            },
            {
              title: 'Build Demo Program',
              enabled: () => true,
              task: () =>
                execao(
                  'sh',
                  ['setupEg.sh', `${process.cwd()}/pkg-config-0.26/`],
                  {
                    cwd: `${scriptsPath}`,
                  },
                  (result) => {}
                ),
            },
            {
              title: 'Generate LLVM Bitcode (.bc) for the Demo Program',
              enabled: () => true,
              task: () =>
                execao('extract-bc', ['pkg-config', '-o', 'pkg-config.bc'], {
                  cwd: `${process.cwd()}/pkg-config-0.26/`,
                }),
            },
            {
              title: `Generating files for ${chalk.yellow.bold(
                'WebSVF-frontend'
              )}`,
              enabled: () => true,
              task: () =>
                generateJSON(
                  `${process.cwd()}/pkg-config-0.26/`,
                  `${binPath}/svf-ex --leak`
                ),
            },
            {
              title: `Launch VSCode`,
              enabled: () => true,
              task: () =>
                execao('code', ['.'], {
                  cwd: `${process.cwd()}/pkg-config-0.26/`,
                }),
            },
          ],
          { concurrent: false }
        ),
    },
  ]);

  //Run the list of Installation tasks defined above
  try {
    await egSetupTasks.run();
  } catch (e) {
    console.error(e);
  }
}

export async function createAnalysis(options) {
  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}/`;
  }

  //A JavaScript object containing boolean values representing whether a particular dependency is installed or not
  let depInstall = {
    vscode: false,
    node: false,
    nodeVers: false,
    unzip: false,
    wget: false,
  };

  //A JavaScript object containing boolean values representing whether a particular dependency is installed or not
  //(Initialized as true instead of false)
  let dirPresence = {
    codemap: true,
    frontend: true,
    frontendServer: true,
    extDir: true,
    vscodeDir: true,
  };

  //The checkDirPresence function is executed to check the existence of various directory and the result is stored in the dirPresence object
  dirPresence = await checkDirPresence(dirPresence, homePath);

  let currentFileUrl = import.meta.url;

  let rootPath =
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../../'
    );

  let binPath = `${rootPath}bin/`;
  let scriptsPath = `${rootPath}scripts/`;

  //Define the list of tasks to run using the listr node module
  const tasks = new Listr([
    {
      title: 'Checking Dependency Installations',
      enabled: () => !options.runUnInstall,
      task: () => checkDependencies(depInstall),
    },
    {
      title: `Generating files for ${chalk.yellow.bold('WebSVF-frontend')}`,
      enabled: () => true,
      task: () => {
        if (options.backendDir) {
          generateJSON(
            `${options.generateJSONDir}`,
            `${options.backendDir} --leak`
          );
        } else {
          generateJSON(
            `${options.generateJSONDir}`,
            `${homePath}/svf/svf-ex --leak`
          );
        }
      },
    },
    {
      title: `Generating files ${chalk.yellow.bold(
        'WebSVF-codemap-extension'
      )}`,
      enabled: () => false, //!options.runInstall && !options.runUnInstall,
      task: () =>
        prepCodemap(
          whichbc(scanbc(`${options.generateJSONDir}`)),
          options,
          scriptsPath
        ),
      // {
      //   var bcFilesList = scanbc(`${options.generateJSONDir}`);
      //   var select = whichbc(bcFilesList);

      // },
    },
  ]);

  //Run the list of tasks defined above
  try {
    await tasks.run();
  } catch (e) {
    console.error(e);
  }
}
