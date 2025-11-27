command_exists () {
  command -v "$1" >/dev/null 2>&1
}

# Workaround for Windows 10, Git Bash and Yarn
if command_exists winpty && test -t 1; then
  exec < /dev/tty
fi

# Export FONTAWESOME_NPM_TOKEN (reads from ~/.huskyrc via husky.sh, with fallback)
export FONTAWESOME_NPM_TOKEN=${FONTAWESOME_NPM_TOKEN:-placeholder-token}