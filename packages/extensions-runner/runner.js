const { NodeVM, VMScript } = require("./node_modules/vm2");
const fs = require("fs");

const args = process.argv[2]
const inputParams = JSON.parse(args)

const { external, builtin, file, input } = inputParams

// Read the content of index.js
const indexJsCode = fs.readFileSync(file, "utf-8");

// Create a new VM instance
const vm = new NodeVM({
  argv: [...process.argv.slice(0, 2), JSON.stringify(input)],
  require: {
    external: external,
    builtin: builtin,
  },
});

// Create a script
const script = new VMScript(indexJsCode, file);

// Run the script in the VM context
vm.run(script);
