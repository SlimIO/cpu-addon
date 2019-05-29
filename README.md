# cpu-addon
SlimIO CPU Addon - Recolt metric about Central Processing Unit with help of the Node.js core module **os**.

## Information

This addon use the NodeJS API : [os.cpus()](https://nodejs.org/api/os.html#os_os_cpus)
```js
const os = require("os");

console.log(os.cpus());
```

## Entity declaration

`NULL` parent entities are directly linked to the root computer entity (first entity declaration in the agent db)

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

## Alerting
TBC

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/addon](https://github.com/SlimIO/Addon#readme)|Minor|High|Addon abstract class|
|[@slimio/metrics](https://github.com/SlimIO/Metrics#readme)|Minor|High|Set metrics in DB|
|[@slimio/units](https://github.com/SlimIO/is#readme)|Minor|Medium|Bunch of units for metrics|
