Use `{{ if [expression] }}` to test a condition. Any code you want to test will be evaluated as a JavaScript expression.
```
{{ if it.user }}
  The user is {{ it.user }}.
{{ /if }}
```


## [If/else](#if%2Felse)


The `{{ else }}` tag is supported too.
```
{{ if it.user }}
  The user is {{ it.user }}.
{{ else }}
  No user found!
{{ /if }}
```


## [If/else if](#if%2Felse-if)


Use `{{ else if [expression] }}` to evaluate more conditions.
```
{{ if !it.user }}
  No user found!
{{ else if !it.user.name }}
  The user doesn't have name.s
{{ else }}
  The user is {{ it.user.name }}.
{{ /if }}
```