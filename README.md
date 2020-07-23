# WebSVF-backend

## Description

This is a simple NodeJS CLI tool to easily install ***[WebSVF](https://github.com/SVF-tools/WebSVF)*** and run it.

<hr/>

## **System Requirements - Pre-Requesites**

- ### Ubuntu 18.04
WebSVF-backend can only be used with Ubuntu 18.04 at the momemt. Due to updated user management in new versions of Ubuntu, the current application does not work properly right now. Support for Ubuntu 20.04 is coming soon.

- ### NPM >=v10.0
To run the WebSVF-backend scripts, npm version greater than 10.0 is required.

- ### LLVM and Clang
The LLVM and Clang compiler tools need to be installed and accessible from the terminal.

- ### WLLVM
For compiling entire projects into a LLVM Bitcode (.bc) file for analysis.

<hr/>

## **Installation**

Install the command-line tool globally on your system using npm, by running the following command:

```
sudo npm i -g @websvf/create-analysis
```
<hr/>

## **Usage**

<hr style="width: 70%"/>

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

<hr style="width: 50%"/>


### **1. Install WebSVF components**

```
sudo create-analysis -i
```

#### Options

##### **`-i`** or **`--install`** :

To install WebSVF and all its dependencies


<hr style="width: 50%"/>


### ***(Optional) Test the installation by creating analysis for a demo project***

```
create-analysis --setup-eg
```

If you run into errors, run the `sudo create-analysis --setup-env` command and restart your system to make sure all the dependencies for the demo are installed.

<hr style="width: 70%"/>

### **2. Generate Analysis for LLVM Bitcode (.bc) file**

Generate the bitcode file for your program or project then run the following command from the same directory as the .bc file or specify the directory of the .bc file.

```
create-analysis
```

#### Options

##### **`-d bc-file-directory`** or **`--dir bc-file-directory`** (Optional):

Where `-d` or `--dir` flags indicate that the user wants to provide a path for the directory/folder containing the LLVM Bitcode (.bc) files. The `-d` flag is used cannot be left empty, it must be provided with a directory or the command will fail. If no `-d` flag is specified then the path for the directory containg the .bc files is assumed to be the current working directory from the terminal.

**How to compile a C project or program to LLVM Bitcode (.bc)**: [Detecting memory leaks](https://github.com/SVF-tools/SVF/wiki/Detecting-memory-leaks) (Step 2)

<hr style="width: 70%"/>

### **3. Generate Analysis using Custom Backend**

Generate the bitcode file for your program or project then run the following command from the same directory as the .bc file or specify the directory of the .bc file.

```
create-analysis --custom-backend path-to-backend-executable
```

#### Options

##### **`--custom-backend path-to-backend-executable`**:

If you have developed a custom backend for detecting memory leaks using the [SVF library](https://github.com/SVF-tools/SVF-npm) and the [SVF Example](https://github.com/SVF-tools/SVF-example).

You can specify the path to that executable using the --custom-backend option so that your new backend is used for generating the Bug Report instead of the default SVF backend bundled with WebSVF.

##### **`-d bc-file-directory`** or **`--dir bc-file-directory`** (Optional):

Where `-d` or `--dir` flags indicate that the user wants to provide a path for the directory/folder containing the LLVM Bitcode (.bc) files. The `-d` flag is used cannot be left empty, it must be provided with a directory or the command will fail. If no `-d` flag is specified then the path for the directory containg the .bc files is assumed to be the current working directory from the terminal.


### **4. Uninstall WebSVF Extensions and Dependencies**

```
sudo create-analysis -u
```
<hr style="width: 50%"/>

### ***(Optional) Reset the LLVM and Clang environment***

If you want to reset the environment setup by the `sudo create-analysis --setup-env`, you can do so by running the following command:

```
sudo create-analysis --reset-env
```

The dependency tools installed for testing the demo project are left installed in the system. The installed tools are as follows (if you wish to uninstall them):
- libglib2.0-dev
- libncurses5
- libtool
