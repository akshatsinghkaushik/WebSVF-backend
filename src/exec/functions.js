import fs from 'fs';
import ncp from 'ncp';
import execa from 'execa';
import execao from 'execa-output';
import chalk from 'chalk';
import Listr from 'listr';
import path from 'path';
import { promisify } from 'util';
import inquirer from 'inquirer';

const copy = promisify(ncp);

String.prototype.endWith = function (endStr) {
  var d = this.length - endStr.length;
  return d >= 0 && this.lastIndexOf(endStr) == d;
};

export function uninstallComponents(options, scriptsPath) {
  return new Listr(
    [
      {
        title: `Removing ${chalk.blue('Extension files')}`,
        enabled: () => true,
        task: () =>
          execao(
            'rm',
            [
              '-rf',
              'WebSVF-frontend-extension',
              'codemap-extension',
              'codemap-extension-0.0.1/',
              'WebSVF-frontend-extension_0.9.0/',
            ],
            {
              cwd: `/home/${options.account}/.vscode/extensions`,
            }
          ),
      }
    ],
    { concurrent: false }
  );
}

export async function whichbc(bcFileList) {
  const questions = [];

  let defaultbc = bcFileList.filter((e) => e.charAt(0) !== '.');

  questions.push({
    type: 'list',
    name: 'selection',
    message: 'Please choose which .bc file to use for generating CodeMap:',
    choices: bcFileList,
    default: defaultbc || bcFileList[0],
  });

  const answers = await inquirer.prompt(questions);
  return answers.selection;
}

export async function copyFiles(from, to) {
  return copy(from, to, {
    clobber: true,
  });
}

export async function download(dir, link) {
  return execaout('wget', ['-c', link], {
    cwd: dir,
  });
}

export async function installVSCodeDependencies() {
  const result = await execa('sudo', ['apt', 'install', '-y', 'wget']);
  if (result.failed) {
    return Promise.reject(
      new Error(`Failed to install ${chalk.yellow.bold('VSCode Dependencies')}`)
    );
  }
  return;
}

export async function generateJSON(path, projectDir) {
  const result = await execa.node(`${path}generateJSON.js`, [`${projectDir}`]);

  if (result.failed) {
    return Promise.reject(
      new Error(`Failed to install ${chalk.yellow.bold('SVF')}`)
    );
  }
  return;
}

function readFileList(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item, index) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    filesList.push(fullPath);
  });
  return filesList;
}

function readAllFileList(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item, index) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList);
    } else {
      filesList.push(fullPath);
    }
  });
  return filesList;
}

export function scanbc(dir) {
  var bcFilesList = [];

  var filesList = [];
  var filesDir = dir;
  readFileList(filesDir, filesList);
  var allFilesList = [];
  readAllFileList(filesDir, allFilesList);
  filesList.forEach((element) => {
    if (element.endWith('.bc')) {
      bcFilesList.push(element);
    }
  });

  return bcFilesList;
}
