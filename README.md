# cpu-addon
SlimIO CPU Addon - Publish CPU Metrics

## Information

This addon use the NodeJS API : [os.cpus()](https://nodejs.org/api/os.html#os_os_cpus)
```js
const os = require("os");

console.log(os.cpus());
```

## Entity declaration

`NULL` parent entities are directly linked to the PC entity (first entity declaration in db)

|Parent|Name|Description|
|---|---|---|
|NULL|CPU|"Central Processing Unit"|
|CPU|CPU.${id}|"N/A"|

`CPU.${id}` is duplicate for each logical CPU core
> id start at 0

## For each logical CPU core

### Descriptors

- `model`: string
- `speed `: number (in MHz)

**Example**

|Key|Value|
|---|---|
|model|"Intel(R) Core(TM) i7 CPU 860 @ 2.80GHz"|
|speed|2926|

### Metrics

All metrics are in milliseconds and represents the spending time in mode
- `user`: number
- `nice`: number
- `sys`: number
- `idle`: number
- `irq`: number

> All metrics are collected every 5s by default
