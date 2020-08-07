#!/bin/bash
# System: Ubuntu 20.04

########
# 1. set path
#########
ETC_PROFILE=/etc/profile # path file
INSTALL_DIR="$1"
# 1.1 delete related path
sudo sed -i '/export LLVM_DIR=/ d' $ETC_PROFILE # delete LLVM_DIR
sudo sed -i '/export PATH=$LLVM_DIR\/bin:$PATH/ d' $ETC_PROFILE # delete LLVM_DIR from PATH
sudo sed -i '/export LLVM_COMPILER=/ d' $ETC_PROFILE # delete LLVM_COMPILER
# 1.2 add current llvm svf path
echo 'export LLVM_DIR=${INSTALL_DIR}' | sudo tee -a $ETC_PROFILE # add LLVM_DIR for llvm
echo 'export PATH=$LLVM_DIR/bin:$PATH' | sudo tee -a $ETC_PROFILE # add LLVM_DIR to PATH for llvm
echo 'export LLVM_COMPILER=clang' | sudo tee -a $ETC_PROFILE # add LLVM_COMPILER for wllvm
# 1.3 refresh path
sh $ETC_PROFILE # refresh path