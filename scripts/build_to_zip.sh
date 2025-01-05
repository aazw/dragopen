#!/bin/bash

set -eu

# How do I get the directory where a Bash script is located from within the script itself?
# https://stackoverflow.com/questions/59895/how-do-i-get-the-directory-where-a-bash-script-is-located-from-within-the-script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd ${SCRIPT_DIR}/..

# 出力先ディレクトリ作成
mkdir -p ./build

# zipファイルに圧縮
zip ./build/dragopen \
    background.js \
    extension.css \
    extension.js \
    icons/icon016.png \
    icons/icon032.png \
    icons/icon048.png \
    icons/icon128.png \
    manifest.json
