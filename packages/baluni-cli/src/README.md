This is the cli to access baluni features via command line.

You can run the cli in 2 ways:

## build watch and run the build with node
This way allows to easily call the cli with specific arguments.

To run the cli:

launch in a shel the build command:
```bash
npx nx run baluni-cli:build:development
```
this will build the project and watch for changes, 
then in a new shell you can run the build with node:
```bash
# assuming you are in the root of the project
node 'dist/packages/baluni-cli/main.js'
```

## use specific nx targets
This is more straightforward, but the arguments are hardcoded in the nx target,
like in the rebalance target in project.json.
This target lanches the cli with specific, predefined arguments.

```bash
yarn nx run baluni-cli:rebalance
```

you can create specific targets in the project.json file to run the cli with different arguments.
