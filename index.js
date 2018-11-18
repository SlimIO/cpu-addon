// Require NodeJS Dependencies
const os = require("os");

// Require SlimIO Dependencies
const { Pourcent } = require("@slimio/units");
const Metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");
const timer = require("@slimio/timer");

// CONSTANTS
const INTERVAL_MS = 5000;

// Declare Addon
const CPU = new Addon("CPU");
const metric = new Metrics(CPU);
let intervalId;

/**
 * @func cpuInterval
 * @desc Main CPU Interval
 * @returns {void}
 */
function cpuInterval() {
    const harvestedAt = Date.now();

    for (const { times } of os.cpus()) {
        metric.publish(`CPU.${id}_USER`, times.user, harvestedAt);
        metric.publish(`CPU.${id}_NICE`, times.nice, harvestedAt);
        metric.publish(`CPU.${id}_SYS`, times.sys, harvestedAt);
        metric.publish(`CPU.${id}_IDLE`, times.idle, harvestedAt);
        metric.publish(`CPU.${id}_IRQ`, times.irq, harvestedAt);
    }
}

// Triggered when the addon is started by the core
CPU.on("start", () => {
    const parent = metric.entity("CPU", {
        description: "Central Processing Unit"
    });

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const entity = metric.entity(`CPU.${id}`, { parent })
            .set("speed", cpus[id].speed)
            .set("model", cpus[id].model);

        // All Identity Card are Prefixed by the Identity Name (ex: CPU_USER).
        const cardConfig = { unit: Pourcent, entity };
        metric.identityCard("USER", cardConfig);
        metric.identityCard("NICE", cardConfig);
        metric.identityCard("SYS", cardConfig);
        metric.identityCard("IDLE", cardConfig);
        metric.identityCard("IRQ", cardConfig);
    }

    intervalId = timer.setInterval(cpuInterval, INTERVAL_MS);
    CPU.ready();
});

// Triggered when the addon is stoped by the core
CPU.on("stop", () => {
    timer.clearInterval(intervalId);
});

// Export addon
module.exports = CPU;
