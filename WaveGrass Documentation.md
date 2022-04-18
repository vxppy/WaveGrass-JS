# WaveGrass v0.1.3
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
If _colored_ is set to _true_, each object printed has a different colour, determined by its type

* `prompt(*args)`: Returns user text input as type _string_.
Prompts user using argument given (type _string_)

* `parseNum(*args)`: Converts _string_ to type _number_.
If argument given cannot be converted into _number_, returns NaN

* `isNaN(*args)`: Checks if argument given is NaN. Returns boolean

* `add(a, b)`: Adds `a` and `b` and returns the sum

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
* `object.__type__()` or `typeof object`: Returns the type of the object
* `object.__string__()`: Converts an object to type `string`
* `object.__name__()`: Returns the name of the object (`object` in this case)
* `object.__value_of__()`: Returns value of the object
* `object.__not__()` or `!object`: Returns `true` if the object is empty or equal to 0 and returns `false` for everything else, including objects of type `boolean`
* `object.__bool__()`: Returns `false` if the object is empty or equal to  0 or if it is the boolean `false`, else returns `true`
* `object.__equals__(object2)` or `object == object2`: Returns `true` if the value of `object` equals the value of `object2`, even if their types are different
* `object.__strict_equals__()`: Returns `true` if the value and type of `object` equals the value of `object2`

#### Number
**Note**: Here, `number` refers to a variable of type `number` and not a literal number.  `number2` can however be either a variable of type `number`, a literal number, or a string containing a number

* `number.__add__(number2)` or `number + number2`: Adds two numbers
* `number.__string__()`: Converts the number into type `string`
* `number.__r_add__(number2)`: Reverse Order Addition; Alias of `number.__add__()`
* `number.__mult__(number2)` or `number * number2`: Multiplies two numbers
* `number.__r_mult__(number2)`: Reverse Order Multiplication; Alias of `number.__mult__()`
* `number.__sub__(number2)` or `number - number2`: Subtracts `number2` from `number`
* `number.__r_sub__(number2)`: Subtracts `number` from `number2`
* `number.__div__(number2)` or `number/number2`: Dividing `number2` from `number`
* `number.__r_div__(number2)`: Dividing `number` from `number2`
* `number.__expo__(number2)`: Raising `number` to the power `number2`
* `number.__r_expo__(number2)`: Raising `number2` to the power `number`
* `number.__mod__(number2)`: Taking `number` modulus `number2`
* `number.__r_mod__(number2)`: Taking `number2` modulus `number`
* `number.__equals__(number2)` or `number == number2`: Returns `true` if `number` equals `number2`
* `number.__greater_than__(number2)` or `number > number2`: Returns `true` if `number` is greater than `number2`
* `number.__less_than__(number2)` or `number < number2`: Returns `true` if `number` is lesser than `number2`
* `number.__bool__()`: Returns `false` if `number` is 0, else returns `true`
* `number.__b_not__()` or `~number`: Bitwise NOT operator
* `number.__b_and__(number2)` or `number & number2`: Bitwise AND operator
* `number.__b_or__(number2)` or `number | number2`: Bitwise OR operator
* `number.__b_xor__(number2)`: Bitwise exclusive OR operator
* `number.__b_l_shift__(number2)` or `number << number2`: Shifts the binary value of `number` to the left by appending `number2` zeroes to them and returns the decimal value of the result of the operation.  **Example**: 2 in binary is 10, shifting it to the left by 1 zero would make it 100, which is 4 in decimal
* `number.__b_r_s_shift__(number2)`: Shifts the binary value of `number` to the right by removing `number2` number of succeeding zeroes and returns the decimal value of the result of the operation.  This operation retains the sign (positive or negative) of the number. **Example**: +4 in binary is 100, shifting it to the right by 1 zero would make it 10, which is +2 in decimal
* `number.__b_r_us_shift__(number2)`: Shifts the binary value of `number` to the right by removing `number2` number of succeeding zeroes and returns the decimal value of the result of the operation.  This operation DOES NOT retain the sign (positive or negative) of the number, the input and the output are assumed to be positive. **Example**: +4 in binary is 100, shifting it to the right by 1 zero would make it 10, which is +2 in decimal

#### String
* `string.__string__()`: Converts `string` to type `string`
* `string.__add__(string2)` or `string + string2`: Returns `string2` appended to `string`
* `string.__r_add__(string2)`: Returns `string` appended to `string2`
* `string.__mul__(number)` or `string*string2`: Returns a string with `string` appended to it `number` times. `number` must be of type `number` or must be a string containing a number
* `string.__r_mul__(number)`: Alias of `string.__mul__(number)`
* `string.__bool__()`: Returns `false` if `string` is empty, else returns `true`
* `string.__not__()` or `!string`: Returns `true` if `string` is empty, else returns `false`

#### Arrays
* `array.__bool__()`: Returns `false` if array is empty, else returns `true`
* `array.__string__()`: Returns `array`, converted into type `string`
* `array.__add__(array2)` or `array + array2`: Returns a new array with elements of `array` and `array2` in the same order
* `array.__r_add__(array2)`: Returns a new array with elements of `array2` and `arrays` in the same order
* `array.__mul__(number)` or `array*number`: Returns an array with `array`'s elements repeated `number` times.  `number` must be of type `number` or must be a string containing a number
* `array.__set_property__(name, value)`: Sets the `name` index of the array to be `value` if `name` is of type `number`, else sets the `name` property of the array to be `value`
* `array.__get_property__(name)`: Returns the value of the array at `name` index if `name` is of type `number`, else it returns the `name` property of the array
* `array.pop()`: Removes the last element of an array
* `array.push(*args)`: Appends the arguments to the array

#### Boolean
* `boolean.__string__()`: Returns `boolean`, converted into type `string`
* `boolean.__bool__()`: Returns the value of `boolean` (`true` or `false`)
* `boolean.__add__(val)` or `boolean + val`: If `val` is of type `number`, returns `val`.  If `val` is of type `string`, appends `val` to `boolean.__string__()` and returns
* `boolean.__r_add__(val)`: If `val` is of type `number`, returns `val`.  If `val` is of type `string`, appends `boolean.__string__()` to `val` and returns

#### Functions (type Method)
* `function.__string__()`: Returns string `[Function function]`
* `function.__name__()`:  Returns the name of the function as type `string` (`"function"` in this case)
* `function.__get_property__(property)`:

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
module = import("moduleName")  // Type the path of the module if it is not in the same directory

module.function()  // Calling a method from the module

define method(){
return 0
}

export method as some_func  // export a method so that it can be imported by other files
```
___

* `importJS` function: Imports from JavaScript code

**Syntax**:

*WaveGrass code:*
```
jsfile = importJS("JSFile.js")  // importing from JS
jsfile.some_func()  // running a method from the imported file
```

*JavaScript file that is being imported:*
```js
const some_func = () => {
  return 0
}

module.exports = { some_func }
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
* `||`: Logical OR
* `&&`: Logical AND
* `!=`: "not equal to"
* `==`: "is equal to"
* `&=`: "and also equal to"
* `|=`: "or equal to"
