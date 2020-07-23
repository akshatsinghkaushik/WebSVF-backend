# WebSVF-backend

## Description

This is a simple NodeJS CLI tool to easily install ***[WebSVF](https://github.com/SVF-tools/WebSVF)*** and run it.

## System Requirements - Pre-Requesites

### - Ubuntu 18.04
Currently due to limitions of the WebSVF's dependency, SVF. WebSVF-backend can only be used with Ubuntu 18.04.

### - NPM >=v10.0
To run the WebSVF-backend scripts, npm version greater than 10.0 is required.

### - LLVM and Clang
The LLVM and Clang compiler tools need to be installed and accessible from the terminal.

### - WLLVM
For compiling entire projects into a LLVM Bitcode (.bc) file for analysis.

## Installation

Install the command-line tool globally on your system using npm, by running the following command:

```
sudo npm i -g @websvf/create-analysis
```


## Usage

### ***(Optional) Setup Additional Project Dependencies (LLVM, Clang, Python, WLLVM)***

Skip this step if you already have the required dependencies.

```
sudo create-analysis --setup-env
```

**PLEASE NOTE:** A system RESTART is required for changes to take effect after running the above command

This command also installs dependencies for the project demo which requires the following tools:
- libglib2.0-dev
- libncurses5
- libtool


### **1. Install WebSVF componenmts**

```
sudo create-analysis -i
```

#### Options

##### **`-i`** or **`--install`** :

To install WebSVF and all its dependencies


### ***(Optional) Test the installation by creating analysis for a demo project***

```
create-analysis --setup-eg
```

If you run into errors, run the `sudo create-analysis --setup-env` command and restart your system to make sure all the dependencies for the demo are installed.


### **2. Generate Analysis for LLVM Bitcode (.bc) file**

Generate the bitcode file for your program or project then run the following command from the same directory as the .bc file or specify the directory of the .bc file.

```
create-analysis
```

#### Options

##### **`-d bc-file-directory`** or **`--dir bc-file-directory`** (Optional):

Where `-d` or `--dir` flags indicate that the user wants to provide a path for the directory/folder containing the LLVM Bitcode (.bc) files. The `-d` flag is used cannot be left empty, it must be provided with a directory or the command will fail. If no `-d` flag is specified then the path for the directory containg the .bc files is assumed to be the current working directory from the terminal.

**How to compile a C project or program to LLVM Bitcode (.bc)**: [Detecting memory leaks](https://github.com/SVF-tools/SVF/wiki/Detecting-memory-leaks) (Step 2)



### **3. Uninstall WebSVF Extensions and Dependencies**

```
sudo create-analysis -u
```

### ***(Optional) Reset the LLVM and Clang environment***

If you want to reset the environment setup by the `sudo create-analysis --setup-env`, you can do so by running the following command:

```
sudo create-analysis --reset-env
```

The dependency tools installed for testing the demo project are left installed in the system. The installed tools are as follows (if you wish to uninstall them):
- libglib2.0-dev
- libncurses5
- libtool
