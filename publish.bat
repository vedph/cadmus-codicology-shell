@echo off
echo NPM PUBLISH
echo Before continuing, ensure that:
echo - you are logged in (npm whoami)
echo - you have successfully rebuilt all the libraries (npm run...)
pause

cd .\dist\myrmidon\cadmus-codicology-ui
call npm publish --access=public
cd ..\..\..
pause

REM add other libraries...

echo ALL DONE
