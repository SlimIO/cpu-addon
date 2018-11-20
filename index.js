// Require NodeJS Dependencies
const os = require("os");

// Require SlimIO Dependencies
const { Pourcent } = require("@slimio/units");
const Metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");
const Timer = require("@slimio/timer");

// CONSTANTS
const INTERVAL_MS = 5000;

// Declare Addon
const CPU = new Addon("CPU");
const Metric = new Metrics(CPU);

/** @type {Number} */
let intervalId;

/**
 * @func cpuInterval
 * @desc Main CPU Interval
 * @returns {void}
 */
function cpuInterval() {
    const harvestedAt = Date.now();
    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        Metric.publish(`CPU.${id}_USER`, cpus[id].times.user, harvestedAt);
        Metric.publish(`CPU.${id}_NICE`, cpus[id].times.nice, harvestedAt);
        Metric.publish(`CPU.${id}_SYS`, cpus[id].times.sys, harvestedAt);
        Metric.publish(`CPU.${id}_IDLE`, cpus[id].times.idle, harvestedAt);
        Metric.publish(`CPU.${id}_IRQ`, cpus[id].times.irq, harvestedAt);
    }
}

// Triggered when the addon is started by the core
CPU.on("start", () => {
    const parent = Metric.entity("CPU", {
        description: "Central Processing Unit"
    });

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const entity = Metric.entity(`CPU.${id}`, { parent })
            .set("speed", cpus[id].speed)
            .set("model", cpus[id].model);

        // All Identity Card are Prefixed by the Identity Name (ex: CPU_USER).
        const cardConfig = { unit: Pourcent, entity };
        Metric.identityCard("USER", cardConfig);
        Metric.identityCard("NICE", cardConfig);
        Metric.identityCard("SYS", cardConfig);
        Metric.identityCard("IDLE", cardConfig);
        Metric.identityCard("IRQ", cardConfig);
    }

    intervalId = Timer.setInterval(cpuInterval, INTERVAL_MS);
    CPU.ready();
});

// Triggered when the addon is stoped by the core
CPU.on("stop", () => {
    Timer.clearInterval(intervalId);
});

// Export addon
module.exports = CPU;
