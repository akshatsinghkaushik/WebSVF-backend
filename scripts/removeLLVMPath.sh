#!/bin/bash
# System: Ubuntu 20.04

########
# 1. set path
#########
ETC_PROFILE=/etc/profile # path file
# 1.1 delete related path
sudo sed -i '/export LLVM_DIR=/ d' $ETC_PROFILE # delete LLVM_DIR
sudo sed -i '/export PATH=$LLVM_DIR\/bin:$PATH/ d' $ETC_PROFILE # delete LLVM_DIR from PATH
sudo sed -i '/export LLVM_COMPILER=/ d' $ETC_PROFILE # delete LLVM_COMPILER
# 1.2 refresh path
sh $ETC_PROFILE # refresh path