# WaveGrass v0.1.3
An Experimental Language made in JS.

## How to run a `.wg` file
---

Run the following command the first time to download all dependencies
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
## Table of Contents
1. [Table of Contents](#table-of-contents)
2. [WaveGrass Installation](#how-to-run-a-wg-file)
3. [Inbuilt Functions](#inbuilt-functions)
4. [Keywords and Examples](#keywords-and-examples)
5. [WaveGrass Object Types and Methods](#objects)
6. [Other Classes](#other-classes)
7. [Basics](#basics)

If you have just installed WaveGrass, start from [Inbuilt Functions](#inbuilt-functions) and [Keywords and Examples](#keywords-and-examples), then go to [Basics](#basics).

## Inbuilt Functions
* `print(*args, sep:"", end:"\n", colored:false)`: <br> &emsp; Prints object/objects, separated by `sep`, ending with `end`.  If `colored` is set to `true`, each object printed is colored by its type as specifed [here](#object-common-for-all-types).

* `prompt(prompt)`: <br> &emsp; Returns user text input as type `string`. Prompts user using argument given (`prompt`, type `string`) 

* `parseNum(obj, base)`: <br> &emsp;  Converts `string` / `boolean` to type `number`. 
  * If argument given cannot be converted into `number`, returns NaN. `base` must be a value between 2 and 36 that specifies the base of the number in string.  
  * If `base` is not specified and `obj` (as type `string`) starts with `0x`, `obj` is assumed to have base 16, else the base is assumed to be 10 

* `isNaN(obj)`: <br> &emsp;  Checks if argument given is a number or not. Returns a boolean 

* `module = import("path-or-filename")`: <br> &emsp;  Imports the given **WaveGrass** file (by path if the file is not in the same directory) and returns an object of type _`module`_, and the objects, functions and variables in it can be accessed using `module.obj`
* `module = importJS("path-or-filename")`: <br> &emsp; Imports the given **JavaScript** file (by path if the file is not in the same directory) and returns an object of type _`module`_, and the objects, functions and variables in it can be accessed using `module.obj` 


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
```wg
print(var)  // Usage
hoist var = 27  // Variable is declared after usage using hoist
```
___
* `const` keyword: To declare immutable variables; values of constants cannot be changed
  
**Syntax**: 
```wavegrass
const variableName = value
```
**Example**:
```wg
const pi = 3.14159
pi = 2.71 // This is not allowed, a constant is unchangeable once declared
```
___
* `typeof` keyword: Returns the type of object

**Syntax**:
```wg
typeof object
```
___
* `import` function and `export` keyword: To access code from different WaveGrass files

**Syntax**:
```wg
module = import("moduleName")  // Type the path of the module if it is not in the same directory

module.function()  // Calling a method from the module

define method(){
return 0
}

export method as some_func  // export a method so that it can be imported by other files
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
define funcName{ // for functions with no arguments
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
// do something
}
``` 
**Note:** *If the iterable is a string in the second method, `c` would equal each character*
```
// Second method
for c of iterable{
// do something
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
* `break` keyword: Used to exit from a loop (`while` / `for`) before the breaking condition is satisfied

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
```wg
while condition_1{
//do thing
if condition_2{
continue // Since the loop goes to the next iteration here, do-more-things is not executed if
}        // condition_2 is true
//do more things
}
```

## Object Types and Methods
### Types
* _`object`_: All other types are extensions of this type
* _`number`_: Type used for numbers, including float and integers
* _`string`_: Type used for strings
* _`boolean`_: Type used for boolean (`true` / `false`)
* _`null`_: Null type
* _`array`_: Type used for arrays/lists
* _`method`_: Type used for functions and methods
* _`module`_: Type used for WaveGrass modules
* _`error`_: Type used for exceptions

### Methods

**Note**: Methods under type _`object`_ apply to objects of all types, and therefore methods for all other types are only specified if they have differing behavior from the ones under type _`object`_ or are not present under type _`object`_.

#### Object (common for all types and used for classes)
* `object.__mutable__()`:  <br> &emsp;  Returns `true` if the object's value can changed 
* `object.__type__()` / `typeof object`:  <br> &emsp;  Returns the type of the object 
* `object.__string__(colored)`:  <br> &emsp; Converts an object to type `string`. &ensp;`colored` is of type _`boolean`_ and defaults to `false`, it is set to `true`, the string is colored by its type using ANSI escape codes:
  * Type _`object`_: <font color="cyan">Cyan</font>
    * String returned: `"[Object <name-of-object>]"`
    * ANSI escape code: `\x1b[36m`
  * Type _`number`_: <font color="yellow">Yellow</font>
    * String returned: `"<number-in-given-base>"`
    * ANSI escape code: `\x1b[33m`
  * Type _`string`_: None
    * String returned: `"<content-of-string>"`
    * ANSI escape code: `\x1b[0m`
  * Type _`boolean`_: <font color="blue">Blue</font>
    * String returned: `"true"` / `"false"`
    * ANSI escape code: `\x1b[34m`
  * Type _`function`_: <font color="cyan">Cyan</font>
    * String returned: `"[Function <name-of-function>]"`
    * ANSI escape code: `\x1b[36m`
  * Type _`array`_: Elements are colored by their respective types (except _`string`_, specified below)
    * String returned: `"[<element1>, <element2>....]"`
    * Type _`string`_ when is element inside an array: <font color="green">Green</font>
      * ANSI escape code: `\x1b[32m`
  * Type _`null`_: <font color = "blue">Blue</font>
    * String returned: `"null"`
    * ANSI escape code: `\x1b[34m` 
  * Type _`module`_: <font color = "cyan">Cyan</font>
    * String returned: `"[Module <name-of-module>]"`
    * ANSI escape code: `\x1b[36m`
  
* `object.__name__()`:   <br> &emsp; Returns the name of the object (`object` in this case) 
* `object.__value_of__()`:  <br> &emsp; Returns value of the object 
* `object.__not__()` / `!object`:  <br> &emsp; Returns `true` if the object is empty or equal to 0 and returns `false` for everything else, including objects of type `boolean` 
* `object.__bool__()`:  <br> &emsp; Returns `false` if the object is empty or equal to  0 or if it is the boolean `false`, else returns `true` 
* `object.__equals__(object2)` / `object == object2`:   <br> &emsp;  Returns `true` if the value of `object` equals the value of `object2`, even if their types are different 
* `object.__strict_equals__()` / `object === object2`:   <br> &emsp;  Returns `true` if the value and type of `object` equals the value of `object2` 
* `object.__and__(object2)`/ `object && object2`:   <br> &emsp;  Logical AND operator 
* `object.__r_and__(object2)`:   <br> &emsp; Alias of `object.__and__` 
* `object.__or__(object2)` / `object || object2`:   <br> &emsp; Logical OR operator 
* `object.__r_or__(object2)`:   <br> &emsp; Alias of `object.__or__` 
* `object.__get_property__(property)` / `object[property]`:   <br> &emsp; Returns `property` of the `object`. &ensp; `property` must be of type _`string`_ if `object` is not of type _`array`_, else it can be of type _`string`_ or _`number`_ 
* `object.__set_property__(property, new_val)`/ `object[property] = new_val`:   <br> &emsp;  Sets `property` of `object` to `new_val`.  `property` must be of type `string` if `object` is not of type `array` 
* `object.__in__(val)`:   <br> &emsp;
* `object.__of__(val)`:

#### Number
**Note**: Here, `number` refers to a variable of type `number` and not a literal number.  `number2` can however be either a variable of type `number`, a literal number, or a string containing a number

* `number.__add__(number2)` / `number + number2`:  <br> &emsp;  Adds two numbers 
* `number.__r_add__(number2)`:  <br> &emsp; Reverse Order Addition; alias of `number.__add__` 
* `number.__mult__(number2)` / `number * number2`:  <br> &emsp;  Multiplies two numbers 
* `number.__r_mult__(number2)` / `number * number2`:  <br> &emsp; Reverse Order Multiplication; alias of `number.__mult__` 
* `number.__sub__(number2)` / `number - number2`:  <br> &emsp;  Subtracts `number2` from `number` 
* `number.__r_sub__(number2)`:  <br> &emsp; Subtracts `number` from `number2` 
* `number.__div__(number2)` / `number / number2`:  <br> &emsp; Dividing `number2` from `number` 
* `number.__r_div__(number2)`:   <br> &emsp;  Dividing `number` from `number2` 
* `number.__expo__(number2)` / `number ** number2`:  <br> &emsp; Raising `number` to the power `number2` 
* `number.__r_expo__(number2)`:  <br> &emsp; Raising `number2` to the power `number` 
* `number.__mod__(number2)` / `number % number2`:  <br> &emsp; Taking `number` modulus `number2` 
* `number.__r_mod__(number2)`:  <br> &emsp; Taking `number2` modulus `number` 
* `number.__equals__(number2)` / `number == number2`:   <br> &emsp; Returns `true` if `number` equals `number2`
* `number.__greater_than__(number2)` / `number > number2`:   <br> &emsp; Returns `true` if `number` is greater than `number2` 
* `number.__less_than__(number2)` / `number < number2`:  <br> &emsp; Returns `true` if `number` is lesser than `number2` 
* `number.__bool__()`:   <br> &emsp;  Returns `false` if `number` is 0, else returns `true` 
* `number.__b_not__()` / `~number`:  <br> &emsp;  Bitwise NOT operator 
* `number.__b_and__(number2)` / `number & number2`:   <br> &emsp;  Bitwise AND operator 
* `number.__b_or__(number2)` / `number | number2`:   <br> &emsp; Bitwise OR operator 
* `number.__b_xor__(number2)` / `number ^ number2`:   <br> &emsp;  Bitwise exclusive OR operator 
* `number.__b_l_shift__(number2)` / `number << number2`: <br>  &emsp;  Shifts the binary value of `number` to the left by appending `number2` zeroes to them and returns the decimal value of the result of the operation.  **Example**: 2 in binary is 10, shifting it to the left by 1 zero would make it 100, which is 4 in decimal 
* `number.__b_r_s_shift__(number2)` / `number >> number2`:   <br id="binrightsignedshift"> &emsp; Shifts the binary value of `number` to the right by removing `number2` number of succeeding zeroes and returns the decimal value of the result of the operation.  This operation retains the sign (positive or negative) of the number. 
  * **Example**: +4 in binary is 100, shifting it to the right by 1 zero would make it 10, which is +2 in decimal 
* `number.__b_r_us_shift__(number2)` / `number >>> number2`:  <br id="binrightunsignedshift"> &emsp; Shifts the binary value of `number` to the right by removing `number2` number of succeeding zeroes and returns the decimal value of the result of the operation.  This operation DOES NOT retain the sign (positive or negative) of the number, the input and the output are assumed to be positive. 
  * **Example**: +4 in binary is 100, shifting it to the right by 1 zero would make it 10, which is +2 in decimal 

#### String
* `string.__add__(string2)` / `string + string2`:   <br> &emsp;  Returns `string2` appended to `string` 
* `string.__r_add__(string2)`:   <br> &emsp;  Returns `string` appended to `string2` 
* `string.__mul__(number)` / `string * string2`:  <br> &emsp; Returns a string with `string` appended to it `number` times. `number` must be of type `number` or must be a string containing a number 
* `string.__r_mul__(number)`:   <br> &emsp;  Alias of `string.__mul__(number)` 
* `string.__bool__()`:   <br> &emsp; Returns `false` if `string` is empty, else returns `true` 
* `string.__not__()` / `!string`:   <br> &emsp;  Returns `true` if `string` is empty, else returns `false` 

#### Arrays
* `array.__bool__()`:   <br> &emsp; Returns `false` if array is empty, else returns `true` 
* `array.__string__()`:   <br> &emsp;  Returns `array`, converted into type _`string`_ 
* `array.__add__(array2)` / `array + array2`:  <br> &emsp;  Returns a new array with elements of `array` and `array2` in the same order 
* `array.__r_add__(array2)`:  <br> &emsp;  Returns a new array with elements of `array2` and `arrays` in the same order 
* `array.__mul__(number)` / `array * number`:  <br> &emsp;  Returns an array with `array`'s elements repeated `number` times.  `number` must be of type _`number`_ or must be a string containing a number 
* `array.__set_property__(name, value)` / `array[name] = value`:   <br> &emsp; Sets the `name` index of the array to be `value` if `name` is of type `number`, else sets the `name` property (`name` of type _`string`_) of the array to be `value` 
* `array.__get_property__(name)` / `array[name]`:   <br> &emsp; Returns the value of the array at `name` index if `name` is of type _`number`_, else if `name` is of type _`string`_ it returns the `name` property of the array. The properties of `array` are (other than the elements in it):
    * `"length"` 
* `array.pop()`:   <br> &emsp; Removes the last element of an array and returns 
* `array.push(*args)`:   <br> &emsp; Appends the arguments to the array 

#### Boolean
* `boolean.__string__()`:   <br> &emsp;  Returns `'boolean'` (converted into type _`string`_) 
* `boolean.__bool__()`:   <br> &emsp;  Returns `boolean` (`true` / `false`) 
* `boolean.__add__(val)` / `boolean + val`:  <br> &emsp;  If `val` is of type _`number`_, returns `val`.  If `val` is of type _`string`_, appends `val` to the value returned by `boolean.__string__` and returns 
* `boolean.__r_add__(val)`:  <br> &emsp; If `val` is of type _`number`_, returns `val`.  If `val` is of type _`string`_, appends the value returned by `boolean.__string__` to `val` and returns 

#### Functions (type Method)
* `function.__name__()`:  <br> &emsp; Returns the name of the function as type _`string`_ (`"function"`)
* `function.__get_args__()`: <br> &emsp; Returns the arguments `function` takes as an array
* `function.__get_statements__()`: <br> &emsp; Returns the 
* `function.__get_property__('property')`:   <br> &emsp; Returns `'property'` of the function

#### Module
* `module.set(key, value)`: <br> &emsp; 
* `module.__get_property__('property')` / `module['property']`: <br> &emsp; Returns `'property'` of the module.  The properties of type _`module`_ are:
  * `"name"` 

#### Errors
* `TypeError`: <br> &emsp; Raised when methods or operations specific to certain types are used with inapplicable types
* `


## Other Classes
* `JSON` object: To generate and read JSON strings
  * `JSON.toStr(obj, indent)`: <br> &emsp; Converts `obj` into a JSON string and returns.  `indent` specifies the indent of the JSON string and is of type _`number`_

## Basics
* `variableName = value`:  Declares and sets the value of the variable by value 
* `variableName -> object`: Declares and sets `variableName` to be an alias of `object` if `object` is a function or mutable, else the value of `variableName` is set to `object` 
* `//`: Single-line comments
* `/* comments */`: Multi-line comments

### Arithmetic Operations
* `+`: Addition
* `-`: Subtraction
* `*`: Multiplication
* `/`: Division
* `%`: Modulo
* `**`: Exponentiation
* `++`: Increment operator
* `--`: Decrement operator
### Binary Operations
* `~`: Binary NOT operator
* `|`: Binary OR operator
* `&`: Binary AND operator
* `^`: Binary XOR operator
* `<<`: Binary left shift operator
* `>>`: Binary right signed shift operator
* `>>>`: Binary right unsigned shift operator
### Logical Operations
* `!`: Logical NOT operator
* `||`: Logical OR operator
* `&&`: Logical AND operator
### Relational Operators
These operations always return `true` or `false`:
* `==`: Equality operator (checks only values)
* `===`: Strict-equality operator (checks both value and type)
* `!=`: Inequality operator
* `<`: "less than" operator
* `>`: "greater than" operator
* `<=`: "lesser or equal to" operator
* `>=`: "greater or equal to" operator
* `&=`: "and equal to" operator
* `|=`: "or equal to" operator
### String Operators
* `+`: Concatenation operator
* `*`: Multiple self-concatenation 
### Array Operators
* `+`: Concatenation operator
###
