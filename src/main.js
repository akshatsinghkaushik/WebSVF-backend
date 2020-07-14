import chalk from 'chalk';
import Listr from 'listr';
import path from 'path';
import { promisify } from 'util';
import execao from 'execa-output';
import fs from 'fs';
import commandExists from 'command-exists';
import getHomePath from 'home-path';

import {
  scanbc,
  whichbc
} from './helper/functions';

import {uninstallComponents} from './run/uninstall';

import {installFrontendServer} from './run/install/frontendServer';

import {installExtensions} from './run/install/extensions';

import {prepCodemap} from './run/prep/codemap';

const access = promisify(fs.access);

export async function createAnalysis(options) {
  //A JavaScript object containing boolean values representing whether a particular depndency is installed or not
  let depInstall = {
    vscode: false,
    node: false,
    nodeVers: false,
  };

  const dirPresence = {
    codemap: true,
    frontend: true,
    frontendServer: true,
    extDir: true,
    vscodeDir: true
  };

  let homePath = getHomePath();

  try {
    await access(`${homePath}/.bug-report`, fs.constants.R_OK);
  } catch (err) {
    dirPresence.frontendServer = false;
  }

  try {
    await access(
      `${homePath}/.vscode/extensions/codemap-extension`,
      fs.constants.R_OK
    );
  } catch (err) {
    dirPresence.codemap = false;
  }

  try {
    await access(
      `${homePath}/.vscode/extensions/WebSVF-frontend-extension`,
      fs.constants.R_OK
    );
  } catch (err) {
    dirPresence.frontend = false;
  }

  try {
    await access(
      `${homePath}/.vscode/extensions`,
      fs.constants.R_OK
    );
  } catch (err) {
    dirPresence.extDir = false;
  }

  try {
    await access(
      `${homePath}/.vscode`,
      fs.constants.R_OK
    );
  } catch (err) {
    dirPresence.vscodeDir = false;
  }

  let currentFileUrl = import.meta.url;
  let binPath = 
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../../bin'
    );

  let scriptsPath =
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../../scripts'
    );

  let srcPath =
    '/' +
    path.join(
      decodeURI(
        new URL(currentFileUrl).pathname.substring(
          new URL(currentFileUrl).pathname.indexOf('/') + 1
        )
      ),
      '../'
    );

  //Define the list of tasks to run using the listr node module
  const tasks = new Listr([
    {
      title: 'Checking Dependency Installations',
      enabled: () => !options.runUnInstall,
      task: () => {
    
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
            }
          ],
          { concurrent: false }
        );
      },
    },
    {
      title: 'Installing Dependencies',
      enabled: () => options.runInstall,
      skip: () => {
        if (
          depInstall.vscode === true &&
          depInstall.node === true &&
          depInstall.nodeVers === true
        ) {
          return true;
        }
      },
      task: () => {
        return new Listr(
          [
            {
              title: `Installing ${chalk.inverse(
                'VSCode'
              )} (using snap package manager)`,
              enabled: () => true,
              skip: () => depInstall.vscode,
              task: () =>
                execao('snap', ['install', 'code', '--classic'], null, () => {
                  depInstall.vscode = true;
                }),
            },
            {
              title: `Installing ${chalk.inverse('Unzip')}`,
              enabled: () => true,
              task: () => execao('sudo', ['apt', 'install', '-y', 'unzip']),
            },
          ],
          { concurrent: false }
        );
      },
    },
    {
      title: `Installing ${chalk.inverse('WebSVF frontend-server')}`,
      enabled: () => options.runInstall,
      skip: () => dirPresence.frontendServer,
      task: () => installFrontendServer(homePath)
    },
    {
      title: `Installing ${chalk.inverse('WebSVF Extensions')}`,
      enabled: () =>
        depInstall.vscode && !dirPresence.frontend && options.runInstall,
      task: () => installExtensions(homePath, depInstall, dirPresence)
    },

    //
    {
      title: `Uninstalling ${chalk.inverse('WebSVF')}`,
      enabled: () => options.runUnInstall,
      task: () => uninstallComponents(homePath),
    },

    //
    {
      title: `Generating files for ${chalk.yellow.bold('WebSVF-frontend')}`,
      enabled: () => !options.runInstall && !options.runUnInstall,
      task: () =>
        execao(
          'node',
          [`${srcPath}run/prep/generateJSON.js`, `${options.generateJSONDir}`, `${binPath}/svf-ex --leak`],
          null //,
          //(result) => {console.log(result)}
        ),
    },
    {
      title: `Generating files ${chalk.yellow.bold(
        'WebSVF-codemap-extension'
      )}`,
      enabled: () => false, //!options.runInstall && !options.runUnInstall,
      task: () => prepCodemap(whichbc(scanbc(`${options.generateJSONDir}`)), options, scriptsPath)
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
