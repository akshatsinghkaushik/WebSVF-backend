import arg from 'arg';
import inquirer from 'inquirer';
import { createAnalysis, runInstall, runUninstall, runEnvSetup, runEnvReset } from './main';
import chalk from 'chalk';
import { promisify } from 'util';
import fs from 'fs';
import isElevated from 'is-elevated';

import { checkOS } from './checks/os';

const access = promisify(fs.access);

//Function that parses the arguements entered by the user when they executed the cli command, into key value pairs inside an object called options
function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--install': Boolean,
      '--uninstall': Boolean,
      '--dir': String,
      '--setup-env': Boolean,
      '--reset-env': Boolean,
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
    generateJSONDir: args['--dir'],// || process.cwd(),
    output: args['--output'] || '',
    runInstall: args['--install'] || false,
    runUnInstall: args['--uninstall'] || false,
    runEnvSetup: args['--setup-env'] || false,
    runEnvReset: args['--reset-env'] || false,
  };
}

//Function to prompt the user with an option if they specify an invalid directory to run analysis in
async function promptIfWrongDir(options) {

  //An array for storing the questions to prompt the user with using 'inquirer' (npm package)
  let questions = [];

  //Check whether the directory specified using the '--dir' or '-d' arguement, exists or not
  let argsDirPresent = true;

  await access(options.generateJSONDir, fs.constants.R_OK).catch(()=>{
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
  if(answers.wrongDir){
    if(answers.wrongDir==='Quit Operation: Directory does not exist or is not accesible'){
      //Display Error Message
      console.error(
        `%s Sorry the directory ${options.generateJSONDir} does not exist or is not accessible`,
        chalk.red.bold('ERROR')
      );
      //Terminate program execution
      process.exit(1);
    }
    else{
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

      //Offer options on options chaining or 

      //If the directory was specified check directory existence on system
      if(options.generateJSONDir){
        //Prompts the user with an option if they enter a wrong directory to run analysis in
        options = await promptIfWrongDir(options);
      }
      //Else specify the directory to run analysis in as the directory opened in the terminal from which the program is executed
      else{
        options = {
          ...options,
          generateJSONDir: process.cwd()
        };
      }
      
      //Run Different Listr (npm package) tasks based on the user's specified cli arguements (as stored in the options object)
      if(options.runInstall){
        if(await isElevated()){
          await runInstall();
        }
        else{
          console.log(`${chalk.red('ERROR: ')}Elevated priviledges required to perform the operation`);
          throw Error('Operation Failed');
        }
      }
      else if(options.runUnInstall){
        await runUninstall();
      }
      else if(options.runEnvSetup){
        if(await isElevated()){
          await runEnvSetup();
        }
        else{
          console.log(`${chalk.red('ERROR: ')}Elevated priviledges required to perform the operation`);
          throw Error('Operation Failed');
        }
      }
      else if(options.runEnvReset){
        if(await isElevated()){
          await runEnvReset();
        }
        else{
          console.log(`${chalk.red('ERROR: ')}Elevated priviledges required to perform the operation`);
          throw Error('Operation Failed');
        }
      }
      else{
        await createAnalysis(options);
      }      
    }

  }
  //catch block for the high level functions of the program execution
  catch (err) {
    console.error(err);
  }
}
