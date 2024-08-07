# golf hackmud

My golf minigame that i made for the game hackmud.<br>
Here in a bun/node project for fast development.

---

[golf.ts](src/golf.ts) is the file used for hackmud.<br>
[index.ts](index.ts) is what tries to emulate the hackmud environment. So where the terminal color mapping and global scripts are emulated.


## Install and run
All these command should also work with node

To install dependencies:

```bash
bun install
```
or just use your favorite package manager

<br>

To run:
Here you can give the argument like you would do in hackmud

> Important due to a bug with bun where it always escapes all strings we need to use yarn or npm here. Possibly this bug https://github.com/oven-sh/bun/issues/7667

```bash
yarn golf '{foo:"bar"}'
```
or if you really want to directly use bun
```bash
bun run index.ts
```
