# Records the README demo GIF with VHS: https://github.com/charmbracelet/vhs
#
#   npm run build
#   vhs docs/demo.tape      # writes docs/demo.gif
#
# Uses throwaway repos from docs/demo-setup.mjs and a fictional author, so no real data is shown.

Output docs/demo.gif

Set Shell "bash"
Set FontSize 18
Set Width 1200
Set Height 760
Set Padding 24
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms

Hide
Type `export DEMO="$(node docs/demo-setup.mjs)" && export GIT_CONFIG_GLOBAL="$DEMO/.gitconfig"` Enter
Type `alias standup-scribe="node $PWD/dist/cli.js"` Enter
Type "clear" Enter
Show

Sleep 500ms
Type "# Monday morning. What did I do on Friday?" Sleep 800ms Enter
Type "standup-scribe --dir $DEMO --since yesterday --group --exclude ^wip" Sleep 500ms Enter
Sleep 4500ms

Type "clear" Enter
Type "# Ready to paste into Slack" Sleep 800ms Enter
Type "standup-scribe --dir $DEMO --since yesterday --group --exclude ^wip -o markdown --copy" Sleep 500ms Enter
Sleep 5000ms
