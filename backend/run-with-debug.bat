@echo off
echo Running LearnLink with full debug output...
echo Output will be saved to debug-output.log

mvn spring-boot:run > debug-output.log 2>&1

echo Application finished. Check debug-output.log for details.
