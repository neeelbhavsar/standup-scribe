# Records the README demo GIF with VHS on Windows (PowerShell): https://github.com/charmbracelet/vhs
# Same recording as docs/demo.tape, which is for macOS / Linux.
#
#   winget install charmbracelet.vhs tsl0922.ttyd Gyan.FFmpeg
#   npm run build
#   vhs docs/demo-windows.tape      # writes docs/demo.gif
#
# Uses throwaway repos from docs/demo-setup.mjs and a fictional author, so no real data is shown.

Output docs/demo.gif

Set Shell "powershell"
Set FontSize 16
Set Width 1200
Set Height 1000
Set Padding 24
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms

Hide
Type `$cli = Join-Path $PWD 'dist\cli.js'; function standup-scribe { node $cli @args }` Enter
Type `Set-Location (node docs/demo-setup.mjs); $env:GIT_CONFIG_GLOBAL = Join-Path $PWD '.gitconfig'` Enter
Type `function prompt { '> ' }; Clear-Host` Enter
Show

Sleep 500ms
Type "# Monday morning. What did I do on Friday?" Sleep 800ms Enter
Type "standup-scribe --dir . --since yesterday --group --exclude ^wip" Sleep 500ms Enter
Sleep 6s

Type "Clear-Host" Enter
Type "# Ready to paste into Slack" Sleep 800ms Enter
Type "standup-scribe --dir . --since yesterday --group --exclude ^wip -o markdown --copy" Sleep 500ms Enter
Sleep 5s

Hide
Type `Set-Location ..; Remove-Item -Recurse -Force .demo` Enter
