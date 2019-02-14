// Require NodeJS Dependencies
const os = require("os");

// Require SlimIO Dependencies
const Units = require("@slimio/units");
const metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");
const Timer = require("@slimio/timer");

// CONSTANTS
const INTERVAL_MS = 5000;

/** @type {Number} */
let intervalId;

// Declare Addon
const CPU = new Addon("CPU").lockOn("events");
const { Entity, MetricIdentityCard, Global: E_GLOBAL } = metrics(CPU);

function rawPublish(micName, value, harvestedAt) {
    if (!E_GLOBAL.mics.has(micName)) {
        return void 0;
    }
    const mic = E_GLOBAL.mics.get(micName);

    mic.publish(value, harvestedAt);

    return void 0;
}

// Declare Entities and MIC
{
    const CPU_E = new Entity("CPU", {
        description: "Central Processing Unit"
    });
    new MetricIdentityCard("TOTAL", { unit: Units.Pourcent, entity: CPU_E });

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const entity = new Entity(`CPU.${id}`, { parent: CPU_E })
            .set("speed", cpus[id].speed)
            .set("model", cpus[id].model);

        // All Identity Card are Prefixed by the Identity Name (ex: CPU_USER).
        const options = { unit: Units.MilliSecond, entity };
        new MetricIdentityCard("USER", options);
        new MetricIdentityCard("NICE", options);
        new MetricIdentityCard("SYS", options);
        new MetricIdentityCard("IDLE", options);
        new MetricIdentityCard("IRQ", options);
    }
}

/**
 * @func cpuInterval
 * @desc Main CPU Interval
 * @returns {void}
 */
function cpuInterval() {
    const raw = { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 };
    const harvestedAt = Date.now();

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const { user, nice, sys, idle, irq } = cpus[id].times;
        rawPublish(`CPU.${id}_USER`, user, harvestedAt);
        rawPublish(`CPU.${id}_NICE`, nice, harvestedAt);
        rawPublish(`CPU.${id}_SYS`, sys, harvestedAt);
        rawPublish(`CPU.${id}_IDLE`, idle, harvestedAt);
        rawPublish(`CPU.${id}_IRQ`, irq, harvestedAt);

        raw.user += user;
        raw.nice += nice;
        raw.sys += sys;
        raw.idle += idle;
        raw.irq += irq;
    }

    const pourcent = raw.idle / (raw.user + raw.nice + raw.sys + raw.idle + raw.irq);
    rawPublish("CPU_total", (1 - pourcent) * 100, harvestedAt);
}

// Triggered when the addon is started by the core
CPU.on("awake", () => {
    CPU.ready();
    intervalId = Timer.setInterval(cpuInterval, INTERVAL_MS);
});

// Triggered when the addon is stoped by the core
CPU.on("stop", () => {
    Timer.clearInterval(intervalId);
});

// Export addon
module.exports = CPU;
