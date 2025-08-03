## [Visual Studio Code](#visual-studio-code)


The [Vento for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=oscarotero.vento-syntax) extension enables syntax highlighting and provides some useful snippets. For the source code, feature request or bug reports, check out the [git repository](https://github.com/ventojs/vscode-vento).
[Quick Install](vscode:extension/oscarotero.vento-syntax)


### [Open VSX Registry](#open-vsx-registry)


[Vento plugin is also available in Open VSX](https://open-vsx.org/extension/oscarotero/vento-syntax).


## [Sublime Text](#sublime-text)


There's a [Vento plugin for Sublime Text](https://packagecontrol.io/packages/Vento) that you can install from the Command Palette (`Package Control: Install Package -> Vento`). For the source code, feature request or bug reports, check out the [git repository](https://github.com/ventojs/sublime-vento).


## [Neovim](#neovim)


Vento syntax highlighting is available for Neovim through [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter).
To use it, install the "vento" parser with `TSInstall`, or add it to the `ensure_installed` list in the `setup` function.
It's also recommended to install "javascript" and "html" parsers to get better syntax highlighting inside vento files.
```
require("nvim-treesitter.configs").setup({
    ensure_installed = { "vento", "html", "javascript", "..." },
})
```


## [Zed](#zed)


The [Vento extension for Zed](https://github.com/dz4k/zed-vento) provides syntax highlighting. It can be installed from the Zed [extensions gallery](https://zed.dev/docs/extensions/installing-extensions).