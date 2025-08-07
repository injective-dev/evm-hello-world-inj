# Features

## General and utility features

- [x] run locally
    - trigger set up script
- [x] run in gitpod
    - trigger set up script
    - config for gitpod
- [x] set up script
    - set up .env file
    - generate account
    - checks account has been funded
    - interactive prompts
    - invoke logging
- [x] logging utility methods
    - log message
    - save locally to disk
- [ ] save remotely (anon)
- [ ] analyse remote logs (metrics)
- [x] tutorial steps script
    - pause 
    - check result
    - invoke logging
- [ ] run in github code spaces
    - trigger set up script
    - config for github code spaces
- [ ] templating
    - extract template based on this 1st implementation
    - updates to upstream template can be used to update downstream repos (including this)
    - templates can be used to spin up more hello world repos or other accompanying demo repos

## Specific feature for this Hello World

- [x] for logger waits: include timestamps of *start* of wait and *end* of wait --> `58bd164`
- [x] for all scripts: logs which include a command - change to use a different ANSI colouring --> `b1492c6`
- [x] for util, add new function to run CLI commands --> `0267e7d`
- [x] setup shell, after it is complete --> `513731f`
	- [x] investigate if possible to close a shell in gitpod (perhaps `exit`?)
		- it was `exit` in the `setup` shell
		- plus `gp tasks stop "$( gp tasks list --no-color | grep 'setup' | awk '{print $2}' )"` in the main shell --> ref https://www.gitpod.io/docs/classic/user/configure/workspaces/gitpod-cli#stop-2
	- [x] if possible, switch to main shell after setup shell is closed
- [-] in 00-fund (new script) --> `00616c3`
	- [x] create new script
	- [x] output blockscout URL for account address in output --> `4f0eabe`
	- [x] refactor 03-deploy to replace this
- [ ] setup script
	- [x] refactor to shift this function to logger --> `f41d44b`
	- [ ] investigate double input characters upon first prompt --> TODO still unknown, even though now there's only a single instance of `readline` in the entire repo
