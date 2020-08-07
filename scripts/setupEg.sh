cd $1
export LLVM_COMPILER=clang
export LLVM_COMPILER_PATH=$3
export $2
CC=wllvm ./configure
make
extract-bc pkg-config -o pkg-config.bc
cd ../
