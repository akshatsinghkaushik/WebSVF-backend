cd $1
export LLVM_COMPILER=clang
export LLVM_COMPILER_PATH=$3
# export LLVM_COMPILER=clang
# export LLVM_COMPILER_PATH=~/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04/bin/
# export LLVM_DIR=~/llvm-clang/10/clang+llvm-10.0.0-x86_64-linux-gnu-ubuntu-18.04
export $2
CC=wllvm ./configure
make
extract-bc pkg-config -o pkg-config.bc
cd ../
