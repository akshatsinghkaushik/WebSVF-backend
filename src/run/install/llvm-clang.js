import chalk from 'chalk';
import Listr from 'listr';
import commandExists from 'command-exists';
import getHomePath from 'home-path';
import execao from 'execa-output';

import { promisify } from 'util';
import fs from 'fs';

import {rootPath} from '../../main';

const access = promisify(fs.access);

export async function runEnvSetup(options) {
    let homePath = getHomePath();
  
    if (options.account) {
      homePath = `/home/${options.account}/`;
    }
  
    //let binPath = `${rootPath}bin/`;
    const scriptsPath = `${rootPath}scripts/`;
  
    let dirPresence = {
      llvmDir: true,
      llvm10Dir: true,
      llvmDL: false,
      llvmUnpack: true,
      llvmInstall: true,
    };
  
    //A JavaScript object containing boolean values representing whether a particular dependency is installed or not
    let depInstall = {
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
                                  )} version ${chalk.yellow.bold(
                                    '>=10'
                                  )} ${'\n'.repeat(
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
                          if (
                            parseFloat(version.substr(1, version.length)) >= 10
                          ) {
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
                        title: `Checking ${chalk.inverse('Unzip')} Installation`,
                        enabled: () => true,
                        task: () =>
                          commandExists('unzip')
                            .then(() => {
                              depInstall.unzip = true;
                            })
                            .catch(() => {}),
                      },
                      {
                        title: `Checking ${chalk.inverse('wget')} Installation`,
                        enabled: () => true,
                        task: () =>
                          commandExists('wget')
                            .then(() => {
                              depInstall.wget = true;
                            })
                            .catch(() => {}),
                      },
                    ],
                    { concurrent: true }
                  ),
              },
              {
                title: 'Installing Dependencies',
                enabled: () => true,
                skip: () => {
                  if (
                    depInstall.node &&
                    depInstall.nodeVers &&
                    depInstall.unzip &&
                    depInstall.wget
                  ) {
                    return 'Dependencies already installed';
                  }
                },
                task: () =>
                  new Listr(
                    [
                      {
                        title: `Installing ${chalk.inverse('Unzip')}`,
                        enabled: () => true,
                        skip: () => depInstall.unzip,
                        task: () =>
                          execao('sudo', ['apt', 'install', '-y', 'unzip']),
                      },
                      {
                        title: `Installing ${chalk.inverse('wget')}`,
                        enabled: () => true,
                        skip: () => depInstall.wget,
                        task: () =>
                          execao('sudo', ['apt', 'install', '-y', 'wget']),
                      },
                    ],
                    { concurrent: false }
                  ),
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
                enabled: () => true,
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
            //   {
            //     title: 'Installing Dependencies for Demo Project',
            //     enabled: () => true,
            //     task: () =>
            //       execao('sudo', [
            //         'apt',
            //         'install',
            //         '-y',
            //         'libglib2.0-dev',
            //         'libncurses5',
            //         'libtool',
            //       ]),
            //   },
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