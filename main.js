const Environment = require("./execute");
const Lexer = require("./lexer");
const Parser = require("./parser");

const run = async () => {
    let parser = new Parser(new Lexer('main.wg'))

    let tree = await parser.parseNext();
    let asts = []
    while(true) {
        if(tree) {
            if(tree.type == 'end') break;
            asts.push(tree)
        }
        tree = await parser.parseNext()

    }

    let env = new Environment()
    env.executeAll(asts)
}

run()