import execao from 'execa-output';
import Listr from 'listr';
import chalk from 'chalk';
import { projectInstall } from 'pkg-install';


export function installFrontendServer(homePath){
    return new Listr(
        [
          {
            title: `Downloading ${chalk.inverse('WebSVF-frontend-server')}`,
            enabled: () => true,
            task: () =>
              execao('wget', [
                '-c',
                'https://github.com/SVF-tools/WebSVF/releases/download/0.1.0/bug_analyis_front-end-0.0.9.tgz'
              ])
          },
          {
            title: `Making directory ${chalk.blue('.bug-report')}`,
            enabled: () => true,
            task: () =>
              execao('mkdir', ['-m', 'a=rwx', '.bug-report'], {
                cwd: `${homePath}/`,
              })
          },
          {
            title: `Unpacking ${chalk.inverse.blue(
              'WebSVF-frontend-server'
            )} files`,
            enabled: () => true,
            task: () =>
              execao(
                'mv',
                [
                  '-f',
                  `bug_analyis_front-end-0.0.9.tgz`,
                  `${homePath}/.bug-report/bug_analyis_front-end-0.0.9.tgz`
                ],
                null,
                (result) => {
                  execao(
                    'tar',
                    ['-xzvf', 'bug_analyis_front-end-0.0.9.tgz'],
                    {
                      cwd: `${homePath}/.bug-report/`,
                    },
                    (result) => {
                      execao(
                        'find',
                        [
                          'package',
                          '-maxdepth',
                          '1',
                          '-mindepth',
                          '1',
                          '-exec',
                          'mv',
                          '{}',
                          '.',
                          ';',
                        ],
                        {
                          cwd: `${homePath}/.bug-report/`,
                        }
                      );
                    }
                  );
                }
              )
          },
          {
            title: `Installing ${chalk.inverse.blue(
              'WebSVF-frontend-server'
            )}`,
            enabled: () => true,
            task: () =>
              projectInstall({
                cwd: `${homePath}/.bug-report/`,
              }),
          },
          {
            title: `Granting the user access to files`,
            enabled: () => true,
            task: () =>
              execao('chmod', [
                '-R',
                'u=rwx,g=rwx,o=rwx',
                `${homePath}/.bug-report/`,
              ]),
          },
          {
            title: `Removing ${chalk.blue('Installation files')}`,
            enabled: () => true,
            task: () => {
              execao('rm', ['-rf', 'bug_analyis_front-end-0.0.9.tgz'], {
                cwd: `${homePath}/.bug-report/`,
              });
              execao('rm', ['-rf', 'package/'], {
                cwd: `${homePath}/.bug-report/`,
              });
            },
          },
        ],
        { concurrent: false }
      );
}