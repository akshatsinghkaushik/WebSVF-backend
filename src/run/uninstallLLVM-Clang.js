import Listr from 'listr';
import execao from 'execa-output';
import getHomePath from 'home-path';

import { promisify } from 'util';
import fs from 'fs';

const access = promisify(fs.access);

import {rootPath} from '../main';

export async function runEnvReset(options) {
    let homePath = getHomePath();
  
    if (options.account) {
      homePath = `/home/${options.account}/`;
    }
  
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
        title: `Uninstalling LLVM and Clang`,
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