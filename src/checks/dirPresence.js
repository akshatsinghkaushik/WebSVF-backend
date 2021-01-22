import { promisify } from 'util';
import fs from 'fs';

const access = promisify(fs.access);

//Function that checks for the presence of installation directories of required WebSVF components and dependencies
export async function checkDirPresence(dirPresence, homePath) {
    //Check if the Installation directory for the WebSVF-frontend-server exists (~/.bug-report/)
    await access(`${homePath}/.bug-report`, fs.constants.R_OK).catch(() => {
      dirPresence.frontendServer = false;
    });
  
    //Check if the VSCode home directory exists (~/.vscode)
    await access(`${homePath}/.vscode`, fs.constants.R_OK).catch(() => {
      dirPresence.vscodeDir = false;
    });
  
    //Check if the VSCode extensions directory exists (~/.vscode/extensions)
    await access(`${homePath}/.vscode/extensions`, fs.constants.R_OK).catch(
      () => {
        dirPresence.extDir = false;
      }
    );
  
    //Check if the Installation directory for the WebSVF-codemap-extension exists (~/.vscode/extensions/codemap-extension)
    await access(
      `${homePath}/.vscode/extensions/codemap-extension`,
      fs.constants.R_OK
    ).catch(() => {
      dirPresence.codemap = false;
    });
  
    //Check if the Installation directory for the WebSVF-frontend-extension exists (~/.vscode/extensions/WebSVF-frontend-extension)
    await access(
      `${homePath}/.vscode/extensions/WebSVF-frontend-extension`,
      fs.constants.R_OK
    ).catch(() => {
      dirPresence.frontend = false;
    });
  
    await access(`${homePath}/svf/`, fs.constants.R_OK).catch(() => {
      dirPresence.svfLite = false;
    });
  
    await access(`${homePath}/svf/svf-lib`, fs.constants.R_OK).catch(() => {
      dirPresence.svfLite = false;
    });
  
    return dirPresence;
  }