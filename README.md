# Building Gutenberg Blocks with Elm

I'm exploring possible ways to create blocks in Elm.
This repo contains some basic material and API translation to make that happen.

![](https://cldup.com/so6ikZ37mN.gif)

## Operation

We are wrapping the JavaScript Block API given to us from the Gutenberg Block Editor and passing that in and out of our inner Elm block app.
Elm takes over a node that we create via `React.createRef()` and that handles interactivity in the editor.
A shadow app runs in the background which is always rendering as if `isSelected` were `false`.
We use a `MutationObserver()` on the shadow app to keep temporary `content` attributes updated with the raw HTML from the rendered shadow app.
This allows us to create an agnostic `save()` function which produces `RawHTML` with that value.

## Problems

 - to handle issues with asynchronous updates we're creating two copies of each block in order to prevent saving the interactive editor UI to the static render fallback.
 - the standard UI components are unavailable inside of Elm because of the mismatch between React elements and Elm's virtual DOM library. also unavailable are th myriad helpers and slots and controls.

## Layout

 - `elm.js`: doesn't belong here but for now it shows what Elm is producing in its output bundle. this would be built into the plugin and loaded via WordPress. in an environment where we're building the JavaScript code we would `import()` this file instad of a global `<script>` tag
 - `elm.json`: nothing to see here - just the normal Elm project meta
 - `gb-elm.php`: the WordPress plugin proper; loads the JS bundles in the editor
 - `loader.js`: translates the Block API into the Elm component; agnostic to the application-specific concerns inside the block. wraps the block attributes inside an opaque `elmProps` object to allow the Elm code to do attribute parsing and management. this wrapper creates two copies of the block: the main one shown in the editor screen and then a shadow copy used for saving. the shadow copy is always unselected (i.e. `this.props.isSelected === false`) and this is used to make sure we don't render edit-context UI to the static render fallback.
 - `src/Main.elm`: the actual block. right now the generic block API is intermingled with the application-specific block logic. this will eventually separate into a block library and block implementations.

## Building

Ensure you have Elm installed
```bash
npm install -g elm
```

Clone this repo
```bash
git clone https://github.com/dmsnell/gb-elm.git
cd gb-elm
```

Install packages and build code
```bash
elm install
elm make --optimize src/Main.elm --output=elm.js
```

Ensure that this directory is loaded inside of `wp-content/plugins/gb-elm` inside of a WordPress installation and then activate the plugin.