import chalk from 'chalk';
import Listr from 'listr';
import path from 'path';
import { promisify } from 'util';
import execao from 'execa-output';
import fs from 'fs';
import getHomePath from 'home-path';

import {checkDependencies} from './checks/dependencies';

import {
  scanbc,
  whichbc
} from './helper/functions';

import {uninstallComponents} from './run/uninstall';

import {installFrontendServer} from './run/install/frontendServer';

import {installExtensions} from './run/install/extensions';

import {depInstallDesktop} from './run/install/dependencies/dekstop';

import {prepCodemap} from './run/prep/codemap';

import {generateJSON} from './run/prep/frontend';

const access = promisify(fs.access);

//Function that checks for the presence of installation directories of required WebSVF components and dependencies 
async function checkDirPresence(dirPresence, homePath){

  //Check if the Installation directory for the WebSVF-frontend-server exists (~/.bug-report/)
  await access(`${homePath}/.bug-report`, fs.constants.R_OK).catch(()=>{
    dirPresence.frontendServer = false;
  });

  //Check if the VSCode home directory exists (~/.vscode)
  await access(
    `${homePath}/.vscode`,
    fs.constants.R_OK
  ).catch(()=>{
    dirPresence.vscodeDir = false;
  });

  //Check if the VSCode extensions directory exists (~/.vscode/extensions)
  await access(
    `${homePath}/.vscode/extensions`,
    fs.constants.R_OK
  ).catch(()=>{
    dirPresence.extDir = false;
  });

  //Check if the Installation directory for the WebSVF-codemap-extension exists (~/.vscode/extensions/codemap-extension)
  await access(
    `${homePath}/.vscode/extensions/codemap-extension`,
    fs.constants.R_OK
  ).catch(()=>{
    dirPresence.codemap = false;
  });

  //Check if the Installation directory for the WebSVF-frontend-extension exists (~/.vscode/extensions/WebSVF-frontend-extension)
  await access(
    `${homePath}/.vscode/extensions/WebSVF-frontend-extension`,
    fs.constants.R_OK
  ).catch(()=>{
    dirPresence.frontend = false;
  });

  return dirPresence;
}

export async function runInstall(){

  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  const homePath = getHomePath();

  //A JavaScript object containing boolean values representing whether a particular depndency is installed or not
  let depInstall = {
    vscode: false,
    node: false,
    nodeVers: false,
    unzip: false
  };

  let dirPresence = {
    codemap: true,
    frontend: true,
    frontendServer: true,
    extDir: true,
    vscodeDir: true
  };

  dirPresence = await checkDirPresence(dirPresence, homePath);

  const installTasks = new Listr([
    {
      title: 'Checking Dependency Installations',
      enabled: () => true,
      task: () => checkDependencies(depInstall)
    },
    {
      title: 'Installing Dependencies',
      enabled: () => true,
      skip: () => {
        if (
          depInstall.vscode === true &&
          depInstall.node === true &&
          depInstall.nodeVers === true &&
          depInstall.unzip === true
        ) {
          return 'Dependencies already installed';
        }
      },
      task: () => depInstallDesktop(depInstall)
    },
    {
      title: `Installing ${chalk.inverse('WebSVF frontend-server')}`,
      enabled: () => true,
      skip: () => dirPresence.frontendServer,
      task: () => installFrontendServer(homePath)
    },
    {
      title: `Installing ${chalk.inverse('WebSVF Extensions')}`,
      enabled: () => true,
      skip: () => {
        if(dirPresence.frontend && dirPresence.codemap){
          return "Extensions already installed"
        }
      },
      task: () => installExtensions(homePath, dirPresence)
    }
  ]);

  //Run the list of Installation tasks defined above
  try {
    await installTasks.run();
  } catch (e) {
    console.error(e);
  }
}

export async function runUninstall(options){

  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  const homePath = getHomePath();

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

export async function createAnalysis(options) {

  //Variable storing the path to the current user's Home Directory (uses the npm package home-path for cross-platform support)
  const homePath = getHomePath();

  //A JavaScript object containing boolean values representing whether a particular dependency is installed or not
  let depInstall = {
    vscode: false,
    node: false,
    nodeVers: false,
    unzip: false
  };

  //A JavaScript object containing boolean values representing whether a particular dependency is installed or not 
  //(Initialized as true instead of false)
  let dirPresence = {
    codemap: true,
    frontend: true,
    frontendServer: true,
    extDir: true,
    vscodeDir: true
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
      task: () => checkDependencies(depInstall)
    },
    {
      title: `Generating files for ${chalk.yellow.bold('WebSVF-frontend')}`,
      enabled: () => !options.runInstall && !options.runUnInstall,
      task: () => generateJSON(`${options.generateJSONDir}`,`${binPath}/svf-ex --leak`)
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
