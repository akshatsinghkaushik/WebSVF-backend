import chalk from 'chalk';
import Listr from 'listr';
import path from 'path';
import execao from 'execa-output';
import commandExists from 'command-exists';

import { promisify } from 'util';
import fs from 'fs';
import getHomePath from 'home-path';

import { scanbc, whichbc } from './helper/functions';

import { installFrontendServer } from './run/install/frontendServer';

import { installExtensionsOnCloud } from './run/install/extensionsOnCloud';

import { prepCodemap } from './run/prep/codemap';

import { generateJSON } from './run/prep/frontend';

const access = promisify(fs.access);

const currentFileUrl = import.meta.url;
  
export const rootPath =
  '/' +
  path.join(
    decodeURI(
      new URL(currentFileUrl).pathname.substring(
        new URL(currentFileUrl).pathname.indexOf('/') + 1
      )
    ),
    '../../'
  );

async function checkCloudDirPresence(dirPresence, homePath) {
  //Check if the Installation directory for the WebSVF-frontend-server exists (~/.bug-report/)
  await access(`${homePath}/.bug-report`, fs.constants.R_OK).catch(() => {
    dirPresence.frontendServer = false;
  });

  //Check if the code-servr extensions directory exists (~/.vscode/extensions)
  await access(
    `${homePath}/.local/share/code-server/extensions/`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.coderExtDir = false;
  });

  await access(`${homePath}/.local/`, fs.constants.R_OK).catch(() => {
    dirPresence.local = false;
  });

  await access(`${homePath}/.local/share/`, fs.constants.R_OK).catch(() => {
    dirPresence.localShare = false;
  });

  await access(
    `${homePath}/.local/share/code-server/`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.codeServer = false;
  });

  //Check if the Installation directory for the WebSVF-codemap-extension exists (~/.vscode/extensions/codemap-extension)
  await access(
    `${homePath}/.local/share/code-server/extensions/codemap-extension`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.coderCodemap = false;
  });

  //Check if the Installation directory for the WebSVF-frontend-extension exists (~/.vscode/extensions/WebSVF-frontend-extension)
  await access(
    `${homePath}/.local/share/code-server/extensions/WebSVF-frontend-extension`,
    fs.constants.R_OK
  ).catch(() => {
    dirPresence.coderFrontend = false;
  });

  await access(`${homePath}/svf/`, fs.constants.R_OK).catch(() => {
    dirPresence.svfLite = false;
  });

  await access(`${homePath}/svf/svf-lib`, fs.constants.R_OK).catch(() => {
    dirPresence.svfLite = false;
  });

  return dirPresence;
}



export async function runCloudInstall(options) {
  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}`;
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

  //A JavaScript object containing boolean values representing whether a particular depndency is installed or not
  let depInstall = {
    coder: false,
    node: false,
    nodeVers: false,
    unzip: false,
    wget: false,
    git: false,
    cmake: false,
  };

  let dirPresence = {
    local: true,
    localShare: true,
    coderCodemap: true,
    coderFrontend: true,
    frontendServer: true,
    coderExtDir: true,
    svfLite: true,
    svflib: true,
  };

  dirPresence = await checkCloudDirPresence(dirPresence, homePath);

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
            {
              title: `Checking ${chalk.inverse('code-server')} Installation`,
              enabled: () => true,
              task: () =>
                commandExists('code-server')
                  .then(() => {
                    depInstall.coder = true;
                  })
                  .catch(() => {}),
            },
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
          depInstall.coder &&
          depInstall.node &&
          depInstall.nodeVers &&
          depInstall.unzip &&
          depInstall.wget &&
          depInstall.git &&
          depInstall.cmake
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
              task: () => execao('sudo', ['apt', 'install', '-y', 'unzip']),
            },
            {
              title: `Installing ${chalk.inverse('wget')}`,
              enabled: () => true,
              skip: () => depInstall.wget,
              task: () => execao('sudo', ['apt', 'install', '-y', 'wget']),
            },
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
      title: `Installing ${chalk.inverse('SVF-example')}`,
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
            title: `Copying over svf-lib files`,
            enabled: () => true,
            task: () =>
              execao(
                'cp',
                ['-arv', `include`, `Release-build`, `${homePath}/svf/svf-lib`],
                { cwd: `${binPath}/SVF-linux/` },
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
        if (dirPresence.coderfrontend && dirPresence.codercodemap) {
          return 'Extensions already installed';
        }
      },
      task: () => installExtensionsOnCloud(homePath, dirPresence),
    },
  ]);

  //Run the list of Installation tasks defined above
  try {
    await installTasks.run();
  } catch (e) {
    console.error(e);
  }
}

export async function runEgSetup(options) {
  let homePath = getHomePath();

  if (options.account) {
    homePath = `/home/${options.account}`;
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

  const cwd = process.cwd();

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
                    cwd: `${cwd}`,
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
                    cwd: `${cwd}`,
                  },
                  () => {
                    execao('rm', ['-rf', 'pkg-config-0.26.tar.gz'], {
                      cwd: `${cwd}`,
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
                  [
                    'setupEg.sh',
                    `${cwd}/pkg-config-0.26/`,
                    `LLVM_DIR=${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04`,
                    `${homePath}/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04/bin/`,
                  ],
                  {
                    cwd: `${scriptsPath}`,
                  },
                  (result) => {}
                ),
            },
            {
              title: `Generating files for ${chalk.yellow.bold(
                'WebSVF-frontend'
              )}`,
              enabled: () => true,
              task: () => {
                generateJSON(
                  `${cwd}/pkg-config-0.26/`,
                  `${homePath}/svf/svf-ex --leak`
                );
              },
            },
            {
              title: `Launch VSCode`,
              enabled: () => true,
              task: () =>
                execao('code', ['.'], {
                  cwd: `${cwd}/pkg-config-0.26/`,
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
    homePath = `/home/${options.account}`;
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
