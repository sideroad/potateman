#!/bin/sh

rm -Rf dist
mkdir dist
mkdir dist/static
cp -Rf src/images dist/static/.
cp src/index.html dist/static/.
cp src/manifest.json dist/static/.
cp -Rf src/joypad dist/static/.
cp -Rf src/mirror dist/static/.
cp -Rf src/css dist/static/.
