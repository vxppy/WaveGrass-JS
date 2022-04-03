# WaveGrass v0.1.2
An Experimental Language made in JS.

## How to run a `.wg` file
---

Run the following command to set up for first time to download all dependencies
```
npm i
```

In the console type the following command after replacing the `filename` with the name of the file you are running.

```
node . filename
```

- Make sure your file is in the `tests` folder
- Make sure your file has the extension `.wg`

<span style='border-radius:2px padding:2px border: 1px'>Make sure you have nodejs v`17.0+`</span>

# Documentation
## Global Inbuilt Functions
* `print(*args, sep:"", end:"\n", colored:false)`: Prints object/objects, separated by _sep_, ending with _end_. 
If _colored_ is set to _true_, each object printed has a different colour, determined by its type.

* `prompt(*args)`: Returns user text input as type _string_. 
Prompts user using argument given (type _string_).

* `parseNum(*args)`: Converts _string_ to type _number_.
If argument given cannot be converted into _number_, returns NaN.


* `isNaN(*args)`: Checks if argument given is NaN. Returns boolean.

## Objects
### Types
* _number_: Type used for numbers, including float and integers
* _string_: Type used for strings
* _boolean_: Type used for boolean (`true` or `false`)
* _null_: Null type
* _array_: Type used for arrays/lists
* _method_: Type used for functions and methods
* _error_: Type used for exceptions

### Methods
#### Object (common for all types)
* `object.__mutable__()`: Returns `true` if the object's value can changed
* `object.__type__()`: Returns the type of the object
* `object.__string__()`: Converts an object to type string
* `object.__name__()`: Returns the name of the object (`object`)
* `object.__value_of__()`: Returns value of the object


#### Number
**Note**: Here, `number` refers to a variable of type `number` and not a literal number.  `number2` can however be either a variable of type `number`, a literal number, or a string containing a number

* `number.__add__(number2)`: Adds two numbers
* `number.__string__()`: Converts the number into type `string`
* `number.__r_add__(number2)`: Reverse Order Addition; Alias of `number.__add__()`
* `number.__mult__(number2)`: Multiplies two numbers
* `number.__r_mult__(number2)`: Reverse Order Multiplication; Alias of `number.__mult__()`
* `number.__sub__(number2)`: Subtracts `number2` from `number`
* `number.__r_sub__(number2)`: Subtracts `number` from `number2`
* `number.__div__(number2)`: Dividing `number2` from `number`
* `number.__r_div__(number2)`: Dividing `number` from `number2`
* `number.__expo__(number2)`: Raising `number` to the power `number2`
* `number.__r_expo__(number2)`: Raising `number2` to the power `number`
* `number.__mod__(number2)`: Taking `number` modulus `number2`
* `number.__r_mod__(number2)`: Taking `number2` modulus `number`
* `number.__equals__(number2)`: Returns `true` if `number` equals `number2`
* `number.__greater_than__(number2)`: Returns `true` if `number` is greater than `number2`
* `number.__less_than__(number2)`: Returns `true` if `number` is lesser than `number2`
* `number.__bool__()`: Returns `false` if `number` is 0, else returns `true`
* `number.__b_not__(number2)`:
* `number.__b_and__(number2)`:
* `number.__b_or__(number2)`:
* `number.__b_xor__(number2)`:
* `number.__b_l_shift__(number2)`:
* `number.__b_r_s_shift__(number2)`:
* `number.__b_r_us_shift__(number2)`:

#### String
* `string.__string__()`: Converts `string` to type `string`
* `string.__add__(string2)`: Returns `string2` appended to `string`
* `string.__r_add__(string2)`: Returns `string` appended to `string2`
* `string.__mul__(number)`: Returns a string with `string` appended to it `number` times. `number` must be of type `number` or must be a string containing a number
* `string.__r_mul__(number)`: Alias of `string.__mul__(number)`
* `string.__bool__()`: Returns `false` if `string` is empty, else returns `true`
* `string.__not__()`: Returns `true` if `string` is empty, else returns `false`

#### Arrays
* `array.__bool__()`: Returns `false` if array is empty, else returns `true`
* `array.pop()`: Removes the last element of an array
* `array.push(*args)`: Appends the arguments to the array
#### Boolean

#### Functions (type Method)


## Keywords and Examples
* `let` keyword: Used to declare variables

**Syntax**:
```
let variableName = value
```
**Note**: You can declare variables without `let`.  For example:`variableName = value`
___ 
* `hoist` keyword: Used to use a variable before it is declared

**Example**:
```
print(var)  // Usage
hoist var = 27  // Variable is declared after usage using hoist
```
___
* `const` keyword: To declare immutable variables; values of constants cannot be changed
  
**Syntax**: 
```
const variableName = value
```
**Example**:
```
const pi = 3.14159
pi = 2.71 // This is not allowed, a constant is unchangeable once declared
```
___
* `typeof` keyword: Tells the type of object

**Syntax**:
```
typeof object
```
___
* `import` and `export` keywords: To access code from different WaveGrass files

**Syntax**:
```
import "moduleName"  // Type the path of the module if it is not in the same directory

moduleName.function()  // Calling a method from the module

define method(){
return 0
}

export method  // export a method so that it can be used by other WaveGrass files
```
___

* `define` keyword: To create new functions
    
**Syntax**:
```
define funcName(argument){
// code
}
```
or 
```
define funcName{ // for argument-less function
//code
}
```
___
* `return` statement: To return the output of a function
  
**Syntax**:
  ```
  define funcName(argument){
  return argument  // without parentheses
  }
  ```
  or
  ```
  define funcName(argument){
  return(argument)  // with parentheses
  }
  ```
___
* `if` statement: 

  
  **Syntax**:
  ```
  if condition_1{        //curly braces compulsory
  //do thing
  }else if condition_2{
  //do thing
  }else{
  //do thing
  }
  ```
  
___
* `for` loop
  

**Syntax**:

**Note:** *If the iterable is a string in the first method, `c` would equal the index of each character*
```
// First method
for c in iterable{
//do thing
    }
``` 
**Note:** *If the iterable is a string in the second method, `c` would equal each character*
```
  // Second method
  for c of iterable{
  //do thing
  }
```
  **Example**:  
  
_3rd method_
```
  for i = init_val, i < final_val, i++{
  print(i)
  }
```
___
* `while` loop
  
**Syntax**:
```
while condition{
//do thing
}
```
**Example**:
```
i = 0
while i <= 10{
print(i)
i++
}
```
___
* `throw` keyword: To raise an error

**Syntax**:
```
throw
```
___
* `break` keyword: Used to exit from a loop (`while` or `for`) before the breaking condition is satisfied

**Syntax**:
```
while condition{
//do thing
if condition_2{
break
}
}
```
and
```
for i of iterable{  // Could be any of the three methods for for-loops
if condition_2{
break
}
}
```
___
* `continue` keyword: In loops, used to go to the next iteration prematurely

**Syntax**:
```
for i in iterable{  // Could be any of the three methods for for-loops
//do thing
if condition_2{
continue // Since the loop goes to the next iteration here, do-more-things is not executed if
}        // condition_2 is true
//do more things
}
```
or
```
while condition_1{
//do thing
if condition_2{
continue // Since the loop goes to the next iteration here, do-more-things is not executed if
}        // condition_2 is true
//do more things
}
```

## Symbols
* `//`: Single-line comments
* `/* comments */`: Multi-line comments
* `number++`: Incrementing a number by 1
* `number--`: Decrementing a number by 1
* `object1 -> object2`: `object1` referencing `object2`
* `||`: "or"
* `&&`: "and"
* `!=`: "not equal to"
* `==`: "is equal to"
* `&=`: "and also equal to"
* `|=`: "or equal to"
