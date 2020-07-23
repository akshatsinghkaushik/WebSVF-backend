import execao from 'execa-output';
import Listr from 'listr';
import chalk from 'chalk';

export function prepCodemap(select, options, scriptsPath){
    return new Listr([
        {
          title: `Moving Files for ${chalk.yellow.bold(
            'WebSVF-codemap-extension'
          )}`,
          enabled: () => !options.runInstall && !options.runUnInstall,
          task: () =>
            execao(
              'cp',
              [
                `-t`,
                `${options.generateJSONDir}`,
                'CodeMap.sh',
                'Bc2Dot.sh',
                'Dot2Json.py',
              ],
              {
                cwd: scriptsPath,
              },
              () => {}
            ),
        },
        {
          title: `Generating Graphs for ${chalk.yellow.bold(
            'WebSVF-codemap-extension'
          )}`,
          enabled: () => !options.runInstall && !options.runUnInstall,
          task: () =>
            execao(
              'bash',
              [`CodeMap.sh`, select],
              {
                cwd: options.generateJSONDir,
              },
              () => {}
            ),
        },
        {
          title: `Removing files for ${chalk.yellow.bold(
            'WebSVF-codemap-extension'
          )}`,
          enabled: () => !options.runInstall && !options.runUnInstall,
          task: () =>
            execao(
              'rm',
              [`-rf`, 'CodeMap.sh', 'Bc2Dot.sh', 'Dot2Json.py'],
              {
                cwd: options.generateJSONDir,
              },
              () => {}
            ),
        },
      ]);
}