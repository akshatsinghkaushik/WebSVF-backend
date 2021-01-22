# WebSVF-backend

## Description

This is a simple NodeJS CLI tool to easily install **_[WebSVF](https://github.com/SVF-tools/WebSVF)_** and run it.

<hr/>

## **System Requirements - Pre-Requesites**

- ### Ubuntu 18.04

  WebSVF-backend can only be used with Ubuntu 18.04 at the momemt. Due to updated user management in new versions of Ubuntu, the current application does not work properly right now. Support for Ubuntu 20.04 is coming soon.

- ### NodeJS >=v10.0

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

### **_(Optional) Setup Additional Project Dependencies (LLVM, Clang, Python, WLLVM)_**

Skip this step if you already have the required dependencies.

```
sudo create-analysis --setup-env
```

<hr style="width: 50%"/>

### **1. Install SVF**

```
sudo create-analysis -i
```

#### Options

##### **`-i`** or **`--install`** :

Installs SVF

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

### **4. Uninstall SVF**

```
sudo create-analysis -u
```

##### **`-u`** or **`--uninstall`** :

To uninstall SVF

<hr style="width: 50%"/>

### **_(Optional) Install SVF, LLVM and Clang_**

If you want to install SVF, LLVM and Clang together, you can do so by running the following command:

```
sudo create-analysis --install-all
```

### **_(Optional) Re-Install Latest SVF_**

If you want to re-install SVF installed by the `sudo create-analysis --install` command, you can do so by running the following command:

```
sudo create-analysis --reinstall-svf
```

### **_(Optional) Uninstall LLVM and Clang_**

If you want to reset the environment setup by the `sudo create-analysis --setup-env`, you can do so by running the following command:

```
sudo create-analysis --reset-env
```

### **_(Optional) Uninstall SVF, LLVM and Clang_**

If you want to SVF, LLVM and Clang altogether, you can do so by running the following command:

```
sudo create-analysis --uninstall-all
```
