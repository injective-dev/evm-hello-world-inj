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

## Specific features for this Hello World

v0.4.2 feedback

- [x] change blockscout URLs to be testnet only (MK) --> `335746d`
	- https://testnet.blockscout.injective.network/
- [x] make funding process more obvious (MK) --> `bade1a3`
	- bold/highlight "← copy this" and "← open this" in main output
	- bold/highlight "← copy this" and "← open this" in info box
	- change explorer URL position
- [x] make generation of new seed phrase more obvious by highlighting the text (MK) --> `7a1b40f`
- [x] remove extraneous logs for "msg: 'closing rlPrompt'" --> `9d7da67`
- [ ] logger file line mistakes - fix for when logger calls another logger function (cannot use hardcoded stack depth)
- [ ] remove "foo" from default config.json file
- [ ] in logger capture when script has exited prematurely (e.g. Ctrl+C), and count that as an error for the purposes of stats
- [ ] switch from hardhat solidity syntax highlighter to another more basic one
- [ ] work out if possible to disable log output from dotenv
- [ ] typo: 'bytcode'
- [ ] in 05-interact, under 'initialise smart contract' format URL to make it obvious that it is clickable
- [ ] refactor formatter such that it is easier to use for single strings (rather than arrays of strings)

v0.4.0 feedback

- [x] when prompting config values, readline/stdin issue where each input character gets printed twice, e.g. "nneeww" instead of "new" --> `b473bde`
- [x] setup script info box flashes, cannot be read, because terminal closed --> `94842cc`
- [x] make info box has single row of "=" at bottom (not double) --> `7448b11`
- [x] make info box pause before revealing --> `7368043`
- [x] see if can have the solidity syntax plugin preinstalled within VS code --> `0103a67`
- [x] in 00-fund, put the instructions for funding in an info box --> `a41df59`
- [x] in 01-compile, open the solidity file in vs code --> `eecb50f`
- [x] in 01-compile, output the exact artefact JSON field names in the info box --> `eecb50f`
- [x] in 03-deploy, output the block explorer URL based on the hash --> WONTDO because not possible, but made some semi-related tweaks `7c42705`
- [x] in 05-interact, when outputting the account address, do so as block explorer URL --> `47ac7ea`
- [x] in 05-interact, add output indicating "0n" as a BigInt --> `47ac7ea`
- [ ] feedback to engineering on faucet
	- [ ] faucet is too slow
	- [ ] faucet should output transaction hash consistently
- [ ] feedback to engineering on block explorer
	- [ ] balance shown in JSON-RPC, but not shown in block explorer, seems to be a synchronisation issue
	- [ ] ABI tab is blank immediately after verification, and only appears after switching back and forth to other tabs

v0.3.1 feedback

- [x] for the setup shell script, npm installation to split into 2 separate batches to reduce time to first interaction --> `9a71b4a`
	- [x] only install dot env and bip39 before prompting --> `9a71b4a`
- [x] at end of 00-fund:
	- [x] what just happened: highlight wallet generation and accoutn creation --> `7c7a77e`

v0.2.0 feedback

- [x] remove auto jump to line for logSection, instead only do it on begin --> `b3dbaeb`
- [x] open .env and config.json files automatically --> `9c05e03`
- [x] for the "run this script next" outputs, highlight file name with different colour --> `199e8b9`
- [x] for 00-fund, after account lookup include instructions, before "after funding account section" --> `adc78cf`
- [x] when shell command is output, highlight in a different colour --> `896e8ca`
- [x] move the logic for waiting for funds from step 0 to step 3 --> `b1dfef8`
	- [x] step 0 just outputs a warning if there are zero funds --> `b1dfef8`
	- [x] step 3 add the 30s 2nd check logic --> `b1dfef8`
- [x] for 06-stats
	- [x] remove JS object output --> `205864e`
	- [x] completion rate determine why it shows 6/8 instead of 7/8 --> `28fd995`
	- [x] convert seconds to minutes in human readable output --> `8b7da4b`
- [x] step 3 for deploy, link directly to the bytecode tab --> `a70be3e`
- [x] step 5 interact don't output full ABI, just truncate --> `d79680f`
- [x] investigate if there's an additional ethersjs wait needed on the SC interaction transaction --> `da99ce0`
	- feedback to engineering that transaction doesn't appear in block explorer after transaction has happened --> not needed
- [x] for the setup shell script, npm installation to split into 2 separate batches to reduce time to first interaction --> done in v0.3.1 feedback
	- [x] only install dot env and bip39 before prompting --> done in v0.3.1 feedback
- [ ] feedback to engineering that faucet dispense needs to be faster
- [ ] feedback to engineering that there is a 90s+ delay for account to be funded

v0.1.0 feedback

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
- [ ] feedback to engineering that:
	- faucet needs to be faster to dispense, and
	- even when there's an error message, blockscout URL should be provided to account
	- faucet display transaction should show in blockscout (even after the RPC return value shows that the account balance has indeed increased already)
	- faucet should also include blockscout URL for dispense transaction
- [ ] setup script
	- [x] refactor to shift this function to logger --> `f41d44b`
	- [ ] investigate double input characters upon first prompt --> TODO still unknown, even though now there's only a single instance of `readline` in the entire repo
- [x] at start of main shell: prompt user to start the first script --> `dc03404`
- [x] at the end of each script: prompt user to run the command for the next script --> `dc03404`
- [x] upon each log:
	- [x] investigate if possible to automate line number when using the `code` command
		- use `code --goto "${PATH}:${LINE_NUM}:${COLUMN_NUM}"`
		- note that `file://` must be removed
	- [x] if possible: scroll the script file to the specific line of code for the log for each section --> `3360e89`
- [x]  at the beginning of each script:
	- [x] open the script file itself in vscode --> `7271477`
	- [x] add ability to disable this via a flag in config file --> WONTDO, no longer relevant
- [x] at end of setup script:
	- [x] what just happened here: explain the files, where they will be used --> `b2ab906`
	- [x] open config.json in vscode --> impl in v0.2.0 feedback
	- [x] open .env file in vscode --> impl in v0.2.0 feedback
- [x] add an 06-stats script
	- [x] analyse time spent --> `f393787`
	- [x] read and parse log files for analysis --> `9dca73b`
	- [x] open the script file itself in vscode --> `7271477`
	- [x] print human-readable summary --> `b8debc6`
	- [x] calculations for setup time --> `6de4806`
	- [x] include setup buffer time if gitpod is detected --> WONTDO as not possible to estimate
		- [x] instead will include instructions in README --> `4e40f40`
- [x] logs from yesterday's stale gitpod image (logs.json.txt)
	- [x] extract them before it gets deleted
	- [x] perform time spent analysis
	- [x] hold onto it for later comparison
- [x] at end of 01-compile:
	- [x] open the counter.json artefact --> `e97b09d`
	- [x] what just happened: highlight where the ABI is, and where the bytecode is --> `8e41bd1`
- [x]  in middle of 02-test:
	- [x] open Counter.test.js --> `a842176`
	- [x] what just happened: describe the tests in the file --> `5a3b2d4`
- [x] in 03-deploy
	- [x] consider moving funding step from 03-deploy to a new 00-fund --> done in v0.2.0
	- [x] what just happened: after deployment, include explanation for why an unverified contract still shows its source code --> `152f3d6`
	- [x] link to `tab=contract_bytecode` blockscout URL --> done in v0.2.0
- [x] in 04-verify
	- [x] after verification, open up the source code of Counter.sol so that it is convenient to compare --> `e440451`
	- [x] what just happened: after verification, explain what the ABI and source code are --> `c86f324`
- [x] in 05-interact
	- [x] do not console.log the full ABI --> already done in v0.2.0 output
	- [x] what just happened here: for all 3x interactions (query before, transaction, query after) --> `c08968a`
	- [x] rename the outputs to make query before and after more clearL --> done in v0.2.0
	- [x] for the transaction output the blockscout URL instead of the hash --> `484fc32`
