# Raycasting in TypeScript

![screenshot](./screenshot.png)

My take on Raycasting inspired by Lode's Computer Graphics Tutorial: https://lodev.org/cgtutor/raycasting.html

GitHub Pages: https://tsoding.github.io/raycasting/

**We are intentinally rendering on HTML 2D Canvas without employing
any hardware acceleration to see how much we can push the boundaries
of the software rendering implemented in JavaScript running in
Browser. So the renderer may run unexpectedly slow on some machines
and browsers, but we are working it.**

## Quick Start

```console
$ npm install
$ npm run serve
$ <browser> https://localhost:6969/
```

=======
This script starts up vite server at http://localhost:6969/ to serve the content of the current folder and the server of the game ([server.mts](./server.mts)). 

## Rebuilding Artifacts

Dependencies
- Latest commit of [C3 compiler](https://github.com/c3lang/c3c) (you need to build it from scratch)
- Node (v20.9.0+)

```console
$ npm install
$ npm run build
```

## References

- Renderer implementation is heavily inspired by https://lodev.org/cgtutor/raycasting.html
- The Networking is Based on https://github.com/tsoding/multiplayer-game-prototype
