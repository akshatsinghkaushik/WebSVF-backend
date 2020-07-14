import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import inquirer from 'inquirer';

const copy = promisify(ncp);

String.prototype.endWith = function (endStr) {
  var d = this.length - endStr.length;
  return d >= 0 && this.lastIndexOf(endStr) == d;
};

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
  return execao('wget', ['-c', link], {
    cwd: dir,
  });
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
