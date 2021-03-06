import arg from 'arg';
import inquirer from 'inquirer';
import {
  createAnalysis,
  runCloudInstall,
  
  runEgSetup,
} from './main';

import { runUninstall } from './run/uninstall'

import {runEnvReset} from './run/uninstallLLVM-Clang'

import {
  runInstall,
} from './run/install/svf';

import {
  runEnvSetup,
} from './run/install/llvm-clang';

import chalk from 'chalk';
import { promisify } from 'util';
import fs from 'fs';
import isElevated from 'is-elevated';
import execa from 'execa';

import { checkOS } from './checks/os';
import { mapExclude } from './helper/excludedUserNames';

const access = promisify(fs.access);

//Function that parses the arguements entered by the user when they executed the cli command, into key value pairs inside an object called options
function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--install': Boolean,
      '--install-all': Boolean,
      '--cloud-install': Boolean,
      '--uninstall': Boolean,
      '--uninstall-all': Boolean,
      '--dir': String,
      '--setup-env': Boolean,
      '--reset-env': Boolean,
      '--setup-eg': Boolean,
      '--reinstall-svf': Boolean,
      '--custom-backend': String,
      '-i': '--install',
      '-u': '--uninstall',
      '-d': '--dir',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    //skipPrompts: args['--yes'] || false,
    template: args._[0],
    arguements: args._,
    generateJSONDir: args['--dir'], // || process.cwd(),
    output: args['--output'] || '',
    customBackendDir: args['--custom-backend'],
    runInstall: args['--install'] || false,
    runInstallAll: args['--install-all'] || false,
    runCloudInstall: args['--cloud-install'] || false,
    runUnInstall: args['--uninstall'] || false,
    runUnInstallAll: args['--uninstall-all'] || false,
    runEnvSetup: args['--setup-env'] || false,
    runEnvReset: args['--reset-env'] || false,
    runEgSetup: args['--setup-eg'] || false,
    runSVFReset: args['--reinstall-svf'] || false,
  };
}

async function checkBackendDir(options) {
  const dirPresence = {
    backendDir: true,
  };

  await access(`${options.customBackendDir}`, fs.constants.R_OK).catch(() => {
    dirPresence.backendDir = false;
  });

  if (dirPresence.backendDir) {
    return {
      ...options,
      backendDir: options.customBackendDir,
    };
  }

  console.log(
    `${chalk.red('ERROR: ')} The specified directory '${
      options.customBackendDir
    }' does not exist or is not accessible`
  );
  process.exit(1);
}

async function promptUserOptions(options) {
  //An array for storing the questions to prompt the user with using 'inquirer' (npm package)
  let questions = [];

  const result = await execa('cut', ['-d:', '-f1', '/etc/passwd']);

  const mapT = result.stdout
    .split('\n')
    .filter((item) => !mapExclude.has(item));

  const defaultAccount = mapT[0];

  if (mapT.length !== 1) {
    questions.push({
      type: 'list',
      name: 'account',
      message: 'Please choose which user account to install WebSVF for:',
      choices: mapT,
      default: defaultAccount,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    account: answers.account || defaultAccount,
  };
}

//Function to prompt the user with an option if they specify an invalid directory to run analysis in
async function promptIfWrongDir(options) {
  //An array for storing the questions to prompt the user with using 'inquirer' (npm package)
  let questions = [];

  //Check whether the directory specified using the '--dir' or '-d' arguement, exists or not
  let argsDirPresent = true;

  await access(options.generateJSONDir, fs.constants.R_OK).catch(() => {
    argsDirPresent = false;
  });

  //If the directory does not exist, then push a question to the inquirer questions array defined above
  if (
    options.generateJSONDir &&
    !argsDirPresent &&
    !options.runInstall &&
    !options.runUnInstall
  ) {
    questions.push({
      type: 'list',
      name: 'wrongDir',
      message:
        'The specified directory is not reachable, proceed with process directory ?',
      choices: [
        `${process.cwd()}`,
        'Quit Operation: Directory does not exist or is not accesible',
      ],
      default: false,
    });
  }

  //Execute inquirer with the array of questions defined above and store the result in the answers variable
  const answers = await inquirer.prompt(questions);

  //Based on the above checks, return the appropriate version of the options object
  if (answers.wrongDir) {
    if (
      answers.wrongDir ===
      'Quit Operation: Directory does not exist or is not accesible'
    ) {
      //Display Error Message
      console.error(
        `%s Sorry the path ${options.generateJSONDir} does not exist or is not accessible`,
        chalk.red.bold('ERROR')
      );
      //Terminate program execution
      process.exit(1);
    } else {
      //Return the user's selected directory from the inquirer prompt as the directory to run analysis in
      return {
        ...options,
        generateJSONDir: answers.wrongDir,
      };
    }
  }

  //Return the options object as it is if there is no issue with the specified directory
  return options;
}

//The Highest Level function that is executed when the user runs any cli command using the program
export async function cli(args) {
  //try block for the high level functions of the program execution
  try {
    //Parse user arguements from the terminal into JSON
    let options = parseArgumentsIntoOptions(args);

    //checkOS function is executed to check if the program can be executed on the system
    //The result from the function is stored in the checkOS key of the options objkect
    options = await checkOS(options);

    //Proceed with further operations if OS Check is successful
    if (options.checkOS) {
      //Offer user account options if not Ubuntu 18.04
      if (!options.osRelease.includes('18.04')) {
        options = await promptUserOptions(options);
      }

      //If the directory was specified check directory existence on system
      if (options.generateJSONDir) {
        //Prompts the user with an option if they enter a wrong directory to run analysis in
        options = await promptIfWrongDir(options);
      }
      //Else specify the directory to run analysis in as the directory opened in the terminal from which the program is executed
      else {
        options = {
          ...options,
          generateJSONDir: process.cwd(),
        };
      }

      //Run Different Listr (npm package) tasks based on the user's specified cli arguements (as stored in the options object)
      if (options.runInstall) {
        if (await isElevated()) {
          await runInstall(options);
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Elevated priviledges (sudo) required to perform the operation`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runInstallAll) {
        if (await isElevated()) {
          await runEnvSetup(options);
          await runInstall(options);
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Elevated priviledges (sudo) required to perform the operation`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runUnInstallAll) {
        if (await isElevated()) {
          await runEnvReset(options);
          await runUninstall(options);
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Elevated priviledges (sudo) required to perform the operation`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runSVFReset) {
        if (await isElevated()) {
          await runUninstall(options);
          await runInstall(options);
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Elevated priviledges (sudo) required to perform the operation`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runCloudInstall) {
        if (await isElevated()) {
          await runCloudInstall(options);
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Elevated priviledges (sudo) required to perform the operation`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runEgSetup) {
        if (!(await isElevated())) {
          await runEgSetup(options);
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Operation cannot proceed with Elevated priviledges (sudo)`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runEnvSetup) {
        if (await isElevated()) {
          await runEnvSetup(options);
          console.log(
            `${chalk.green(
              'SUCCESS: '
            )} LLVM-10 is installed in the ${chalk.inverse(
              '~/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04'
            )} directory`
          );
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Elevated priviledges (sudo) required to perform the operation`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runEnvReset) {
        if (await isElevated()) {
          await runEnvReset(options);
        } else {
          console.log(
            `${chalk.red(
              'ERROR: '
            )}Elevated priviledges (sudo) required to perform the operation`
          );
          throw Error('Operation Failed');
        }
      } else if (options.runUnInstall) {
        await runUninstall(options);
      } else {
        if (options.customBackendDir) {
          options = await checkBackendDir(options);
        }
        await createAnalysis(options);
      }
    }
  } catch (err) {
    //catch block for the high level functions of the program execution
    console.error(err);
  }
}
