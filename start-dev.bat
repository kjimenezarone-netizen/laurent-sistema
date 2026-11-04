@echo off
set "PROJ_DIR=%~dp0"
start "Backend Laurent" cmd /k "cd /d %PROJ_DIR%backend && set JAVA_HOME=C:\Program Files\Java\jdk-21&& set PATH=C:\Program Files\Java\jdk-21\bin;%%PATH%%&& mvn spring-boot:run"
start "Frontend Laurent" cmd /k "cd /d %PROJ_DIR%frontend && npm run dev"
