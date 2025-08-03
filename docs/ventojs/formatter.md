## [markup\_fmt with dprint](#markup_fmt-with-dprint)


[markup\_fmt](https://github.com/g-plane/markup_fmt) can format Vento templates. This can be used in dprint as a plugin. You can also install other dprint plugins that can format JavaScript code, so the expressions in templates can get formatted. It can also format the code inside `<script>` tag and `<style>` tag if you installed some dprint plugins that can format JavaScript code or CSS code, for example, [Malva](https://github.com/g-plane/malva).
Once you installed dprint, run the commands below to add plugins:
```
dprint config add g-plane/markup_fmt
dprint config add g-plane/malva
dprint config add typescript
```
Then, update the `dprint.json` as below:
```
{
  // ...
  "plugins": [
    // ... other plugins URL
    "https://plugins.dprint.dev/g-plane/markup_fmt-{version}.wasm"
  ],
  "markup": { // <-- the key name here is "markup", not "markup_fmt"
    // config comes here
  }
}
```
Replace `{version}` with actual latest version, for example, `v0.7.0`.