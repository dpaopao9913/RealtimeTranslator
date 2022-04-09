@echo off
pushd %~dp0
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
--use-fake-ui-for-media-stream ^
--allow-file-access-from-files ^
--use-fake-device-for-media-stream ^
%CD%\RealtimeTranslator.html
