/Helper Functions for interpExpression/
function sameType(val1,val2){
  if ((typeof(val1) === typeof(val2)) === false){
    console.log("--Different Types");
  }
  return assert(typeof(val1) === typeof(val2));
}
function checkBooleanArithmetic(val1, val2) {
  if (typeof(val1) === 'boolean' || typeof(val2) === 'boolean') {
    console.log("--Tried to do boolean arithmetic");
    assert(false);
  }
}
function checkBooleanComparison(val1,val2){
  if (typeof(val1) !== 'boolean' || typeof(val2) !== 'boolean') {
    console.log("--Arguments must both be booleans for logic");
    assert(false);
  }
}
function arithmeticCriteria(State, ast) {
  let v1 = interpExpression(State, ast.e1);
  let v2 = interpExpression(State, ast.e2);
  sameType(v1,v2);
  checkBooleanArithmetic(v1, v2);
  return {v1: v1, v2: v2};
}
function booleanCriteria(State, ast) {
  let v1 = interpExpression(State, ast.e1);
  let v2 = interpExpression(State, ast.e2);
  sameType(v1,v2);
  checkBooleanComparison(v1,v2);
  return {v1: v1, v2: v2};
}
function equalityCriteria(State, ast) {
  let v1 = interpExpression(State, ast.e1);
  let v2 = interpExpression(State, ast.e2);
  return {v1: v1, v2: v2};
}

//helper function that finds variables in outter scope
function findVariable(state, varName) {
  let outterState = lib220.getProperty(state, "link_123");
  if(outterState.found) {
    if (lib220.getProperty(outterState.value, varName).found) { //if variable is in outter state
      return lib220.getProperty(outterState.value, varName).value;
    } else { //go to next outter state
      findVariable(outterState.value, VarName);
    }
  } else {
    console.log("--Variable " + varName + "not declared or initialized");
    assert(false);
  }
}
// Given a state object and an AST of an expression as arguments,
// interpExpression returns the result of the expression (number or boolean) 
//interpExpression(state: State, e: Expr): number | boolean
function interpExpression(state, e) {
  if (e.kind === "number" || e.kind === 'boolean') {
    return e.value;
  } else if (e.kind === 'variable') {
    let variable = lib220.getProperty(state, e.name);
    if (variable.found === false) {
      return findVariable(state, e.name);
    } else {
      return variable.value;
    }
  } else if (e.kind === "operator") {
    if (e.op === '+') { 
      let obj = arithmeticCriteria(state, e);
      return (obj.v1) + (obj.v2);
    } else if (e.op === '-') { 
      let obj = arithmeticCriteria(state, e);
      return (obj.v1) - (obj.v2);
    } else if (e.op === '*') { 
      let obj = arithmeticCriteria(state, e);
      return (obj.v1) * (obj.v2);
    } else if (e.op === "/") { 
      let obj = arithmeticCriteria(state, e);
      return (obj.v1) / (obj.v2);
    } else if (e.op === "<") { 
      let obj = arithmeticCriteria(state, e);
      return (obj.v1) < (obj.v2);
    } else if (e.op === ">") { 
      let obj = arithmeticCriteria(state, e);
      return (obj.v1) > (obj.v2);
    } else if (e.op === "&&") { 
      let obj = booleanCriteria(state, e);
      return (obj.v1) && (obj.v2);
    } else if (e.op === "||") { 
      let obj = booleanCriteria(state, e);
      return (obj.v1) || (obj.v2);
    } else if (e.op === "===") { 
      let obj = equalityCriteria(state, e);
      return (obj.v1) === (obj.v2);
    }
  } else {
    console.log("--Kind of e is not supported by interpExpression");
    assert(false);
  }
}

/interpStatement Helper Functions/
//this helper functions checks whether outer states has given variable name,
//If it does it returns nothing and changes variable assignment in current state
//else it return a variable missing declaration error if no state is found
function assignVariable(state, varName, value) {
  let outterState = lib220.getProperty(state, "link_123");
  if(outterState.found) {
    if (lib220.getProperty(outterState.value, varName).found) { //if variable is in next state
      lib220.setProperty(outterState.value, varName, value);
    } else { //go to next outter state
      assignVariable(outterState.value, VarName, value);
    }
  } else {
    console.log("--Variable " + varName + " missing declaration");
    assert(false);
  }
}
// The State type is explained further down the document.
// Given a state object and an AST of a statement,
// interpStatement updates the state object and returns nothing
//interpStatement(state: State, p: Stmt): void
function interpStatement(state, p) {
  if (p.kind === 'let') {
    if (lib220.getProperty(state, p.name).found) { //Check if variable has already been declared
      console.log("--Declaring " + p.name + " more than once");
      assert(false);
    } else { //variable not declared yet
      let value = interpExpression(state, p.expression);
      lib220.setProperty(state, p.name, value);
    }
  } else if (p.kind === 'assignment') {
    let value = interpExpression(state, p.expression);
    if (lib220.getProperty(state, p.name).found) { //variable is declared 
      lib220.setProperty(state, p.name, value);
    } else { //assigning without declaration first
      //check outer states/scopes
      assignVariable(state, p.name, value);
    }
  } else if (p.kind === 'if') {
    let value = interpExpression(state, p.test);
    if (value) {
      interpBlock(state, p.truePart);
    } else {
      interpBlock(state, p.falsePart);
    }
  } else if (p.kind === 'while') {
    while (interpExpression(state, p.test)) {
      interpBlock(state, p.body);
    }
  } else if (p.kind === 'print') {
    console.log(interpExpression(state, p.expression));
  }
}

//interpBlock(state: State, s: Stmt[]): void
function interpBlock(state, s) {
  let innerState = {link_123: state};
  s.forEach(statement => interpStatement(innerState, statement));
}

// Given the AST of a program,
// interpProgram returns the final state of the program
//interpProgram(p: Stmt[]): State
function interpProgram(p) {
  let state = {};
  p.forEach(statement => interpStatement(state, statement));
  return state;
}

/*
let program0 = "let x=10;let y=0;";
let p0 = parser.parseProgram(program0).value;

let program1 = 
"let x=10; " +
"if (x===10) {let y=x*2;} else {}";
let p1 = parser.parseProgram(program1).value;

let program2 = 
  "let x = 3; " +
  "let y = 0; " +
  "while(x > 1){"+
    "x = x-1;"+
    "let z = 3;"+
    "print(z);"+
  "}";
let p2 = parser.parseProgram(program2).value;
let p2b = [
  {
    kind: "let",
    name: "x",
    expression: {
      kind: "number",
      value: 3
    }
  },
  {
    kind: "let",
    name: "y",
    expression: {
      kind: "number",
      value: 0
    }
  },
  {
    kind: "while",
    test: {
      kind: "operator",
      op: ">",
      e1: {
        kind: "variable",
        name: "x"
      },
      e2: {
        kind: "number",
        value: 1
      }
    },
    body: [
      {
        kind: "assignment",
        name: "x",
        expression: {
          kind: "operator",
          op: "-",
          e1: {
            kind: "variable",
            name: "x"
          },
          e2: {
            kind: "number",
            value: 1
          }
        }
      },
      {
        kind: "let",
        name: "y",
        expression: {
          kind: "number",
          value: 3
        }
      },
      {
        kind: "print",
        expression: {
          kind: "variable",
          name: "y"
        }
      }
    ]
  }
] 

let p3 = [
  {
    kind: "let",
    name: "x",
    expression: {
      kind: "number",
      value: 10
    }
  },
  {
    kind: "if",
    test: {
      kind: "operator",
      op: "===",
      e1: {
        kind: "variable",
        name: "x"
      },
      e2: {
        kind: "number",
        value: 10
      }
    },
    truePart: [
      {
        kind: "let",
        name: "x",
        expression: {
          kind: "operator",
          op: "*",
          e1: {
            kind: "variable",
            name: "x"
          },
          e2: {
            kind: "number",
            value: 2
          }
        }
      }
    ],
    falsePart: []
  }
] 
*/