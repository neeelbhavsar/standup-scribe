# Records the README demo GIF with VHS on macOS / Linux: https://github.com/charmbracelet/vhs
# On Windows, use docs/demo-windows.tape instead.
#
#   npm run build
#   vhs docs/demo.tape      # writes docs/demo.gif
#
# Uses throwaway repos from docs/demo-setup.mjs and a fictional author, so no real data is shown.

Output docs/demo.gif

Set Shell "bash"
Set FontSize 16
Set Width 1200
Set Height 1000
Set Padding 24
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms

Hide
Type `CLI="$PWD/dist/cli.js" && standup-scribe() { node "$CLI" "$@"; }` Enter
Type `cd "$(node docs/demo-setup.mjs)" && export GIT_CONFIG_GLOBAL="$PWD/.gitconfig"` Enter
Type `PS1='> ' && clear` Enter
Show

Sleep 500ms
Type "# Monday morning. What did I do on Friday?" Sleep 800ms Enter
Type "standup-scribe --dir . --since yesterday --group --exclude ^wip" Sleep 500ms Enter
Sleep 6s

Type "clear" Enter
Type "# Ready to paste into Slack" Sleep 800ms Enter
Type "standup-scribe --dir . --since yesterday --group --exclude ^wip -o markdown --copy" Sleep 500ms Enter
Sleep 5s

Hide
Type `cd .. && rm -rf .demo` Enter
