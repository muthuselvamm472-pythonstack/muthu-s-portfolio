@echo off
set PATH=C:\Users\Muthu selvam.M\node-env\node-v20.18.0-win-x64;%~dp0node_modules\.bin;%PATH%
cd /d "%~dp0"
call npm.cmd run dev -- --host 127.0.0.1 --port 3000
