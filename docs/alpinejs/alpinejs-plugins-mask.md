## Mask Plugin


Alpine's Mask plugin allows you to automatically format a text input field as a user types.
This is useful for many different types of inputs: phone numbers, credit cards, dollar amounts, account numbers, dates, etc.


## [Installation](#installation)


You can use this plugin by either including it from a `<script>` tag or installing it via NPM:


### Via CDN


You can include the CDN build of this plugin as a `<script>` tag, just make sure to include it BEFORE Alpine's core JS file.
```
<!-- Alpine Plugins -->
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/[[email protected]](https://alpinejs.dev/cdn-cgi/l/email-protection)/dist/cdn.min.js"></script>
<!-- Alpine Core -->
<script defer src="https://cdn.jsdelivr.net/npm/[[email protected]](https://alpinejs.dev/cdn-cgi/l/email-protection)/dist/cdn.min.js"></script>
```


### Via NPM


You can install Mask from NPM for use inside your bundle like so:
```
npm install @alpinejs/mask
```
Then initialize it from your bundle:
```
import Alpine from 'alpinejs'
import mask from '@alpinejs/mask'
Alpine.plugin(mask)
...
```

The primary API for using this plugin is the `x-mask` directive.
Let's start by looking at the following simple example of a date field:
```
<input x-mask="99/99/9999" placeholder="MM/DD/YYYY">
```
Notice how the text you type into the input field must adhere to the format provided by `x-mask`. In addition to enforcing numeric characters, the forward slashes `/` are also automatically added if a user doesn't type them first.
The following wildcard characters are supported in masks:
| Wildcard | Description |
| --- | --- |
| * | Any character |
| a | Only alpha characters (a-z, A-Z) |
| 9 | Only numeric characters (0-9) |


## [Dynamic Masks](#mask-functions)


Sometimes simple mask literals (i.e. `(999) 999-9999`) are not sufficient. In these cases, `x-mask:dynamic` allows you to dynamically generate masks on the fly based on user input.
Here's an example of a credit card input that needs to change it's mask based on if the number starts with the numbers "34" or "37" (which means it's an Amex card and therefore has a different format).
```
<input x-mask:dynamic="
$input.startsWith('34') || $input.startsWith('37')
? '9999 999999 99999' : '9999 9999 9999 9999'
">
```
As you can see in the above example, every time a user types in the input, that value is passed to the expression as `$input`. Based on the `$input`, a different mask is utilized in the field.
Try it for yourself by typing a number that starts with "34" and one that doesn't.
`x-mask:dynamic` also accepts a function as a result of the expression and will automatically pass it the `$input` as the first parameter. For example:
```
<input x-mask:dynamic="creditCardMask">
<script>
function creditCardMask(input) {
return input.startsWith('34') || input.startsWith('37')
? '9999 999999 99999'
: '9999 9999 9999 9999'
}
</script>
```


## [Money Inputs](#money-inputs)


Because writing your own dynamic mask expression for money inputs is fairly complex, Alpine offers a prebuilt one and makes it available as `$money()`.
Here is a fully functioning money input mask:
```
<input x-mask:dynamic="$money($input)">
```
If you wish to swap the periods for commas and vice versa (as is required in certain currencies), you can do so using the second optional parameter:
```
<input x-mask:dynamic="$money($input, ',')">
```
You may also choose to override the thousands separator by supplying a third optional argument:
```
<input x-mask:dynamic="$money($input, '.', ' ')">
```
You can also override the default precision of 2 digits by using any desired number of digits as the fourth optional argument:
```
<input x-mask:dynamic="$money($input, '.', ',', 4)">
```
Code highlighting provided by [Torchlight](https://torchlight.dev/)