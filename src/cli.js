import arg from 'arg';
import inquirer from 'inquirer';
import { createAnalysis } from './main';
import chalk from 'chalk';
import { promisify } from 'util';
import fs from 'fs';
//import isElevated from 'is-elevated';

import { checkOS } from './checks/os';

const access = promisify(fs.access);

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--yes': Boolean,
      '--install': Boolean,
      '--dir': String,
      '--uninstall': Boolean,
      '-d': '--dir',
      '-y': '--yes',
      '-i': '--install',
      '-u': '--uninstall',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    //skipPrompts: args['--yes'] || false,
    template: args._[0],
    arguements: args._,
    generateJSONDir: args['--dir'] || process.cwd(),
    output: args['--output'] || '',
    runInstall: args['--install'] || false,
    runUnInstall: args['--uninstall'] || false,
  };
}

async function promptForMissingOptions(options) {

  let questions = [];

  const dirPresence = {
    argsDir: true,
  };

  try {
    await access(options.generateJSONDir, fs.constants.R_OK);
  } catch (err) {
    dirPresence.argsDir = false;
  }

  if (
    options.generateJSONDir &&
    !dirPresence.argsDir &&
    !options.runInstall &&
    !options.runUnInstall
  ) {
    questions.push({
      type: 'list',
      name: 'cancel',
      message:
        'The specified directory is not reachable, proceed with process directory ?',
      choices: [
        `${process.cwd()}`,
        'Quit Operation: Directory does not exist or is not accesible',
      ],
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    cancel: answers.cancel || false,
  };
}

async function quitOnError(options) {
  if (
    options.cancel ===
    'Quit Operation: Directory does not exist or is not accesible'
  ) {
    console.error(
      `%s Sorry the directory ${options.generateJSONDir} does not exist or is not accessible`,
      chalk.red.bold('ERROR')
    );
    process.exit(1);
  } else if (options.cancel !== false) {
    return {
      ...options,
      generateJSONDir: options.cancel,
    };
  } else {
    return {
      ...options,
    };
  }
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);

  try {
    options = await checkOS(options);
    if (options.check) {
      options = await promptForMissingOptions(options);

      options = await quitOnError(options);

      await createAnalysis(options);
    }
  } catch (err) {
    console.error(err);
  }
}
