@echo off
magick convert -background none -size 16x16 img/icon.svg img/icon16.png
magick convert -background none -size 32x32 img/icon.svg img/icon32.png
magick convert -background none -size 48x48 img/icon.svg img/icon48.png
magick convert -background none -size 64x64 img/icon.svg img/icon64.png
magick convert -background none -size 128x128 img/icon.svg img/icon128.png
echo Icons generated successfully!
pause 