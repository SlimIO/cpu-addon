// Require NodeJS Dependencies
const os = require("os");

// Require SlimIO Dependencies
const Units = require("@slimio/units");
const Metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");
const Timer = require("@slimio/timer");

// CONSTANTS
const INTERVAL_MS = 5000;

// Declare Addon
const CPU = new Addon("CPU").lockOn("events");
const Metric = new Metrics(CPU);

/** @type {Number} */
let intervalId;

const pourcentCPU = {
    idle: 0,
    total: 0
};

/**
 * @func cpuInterval
 * @desc Main CPU Interval
 * @returns {void}
 */
function cpuInterval() {
    const harvestedAt = Date.now();

    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        Metric.publish(`CPU.${id}_USER`, cpus[id].times.user, harvestedAt);
        Metric.publish(`CPU.${id}_NICE`, cpus[id].times.nice, harvestedAt);
        Metric.publish(`CPU.${id}_SYS`, cpus[id].times.sys, harvestedAt);
        Metric.publish(`CPU.${id}_IDLE`, cpus[id].times.idle, harvestedAt);
        Metric.publish(`CPU.${id}_IRQ`, cpus[id].times.irq, harvestedAt);

        user += cpus[id].times.user;
        nice += cpus[id].times.nice;
        sys += cpus[id].times.sys;
        idle += cpus[id].times.idle;
        irq += cpus[id].times.irq;
    }

    total = user + nice + sys + idle + irq;

    const diffIdle = idle - pourcentCPU.idle;
    const diffTotal = total - pourcentCPU.total;
    const pourcent = idle / total;
    Metric.publish("CPU_total", (1 - pourcent) * 100, harvestedAt);
    Reflect.set(pourcentCPU, "idle", idle);
    Reflect.set(pourcentCPU, "total", total);
}

CPU.of("Addon.ready", (addonName) => {
    if (addonName === "events") {
        CPU.ready();
    }
});

// Triggered when the addon is started by the core
CPU.on("start", () => {
    const parent = Metric.entity("CPU", {
        description: "Central Processing Unit"
    });
    Metric.identityCard("total", { unit: Units.Pourcent, entity: parent });

    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const entity = Metric.entity(`CPU.${id}`, { parent })
            .set("speed", cpus[id].speed)
            .set("model", cpus[id].model);

        // All Identity Card are Prefixed by the Identity Name (ex: CPU_USER).
        const cardConfig = { unit: Units.MilliSecond, entity };
        Metric.identityCard("USER", cardConfig);
        Metric.identityCard("NICE", cardConfig);
        Metric.identityCard("SYS", cardConfig);
        Metric.identityCard("IDLE", cardConfig);
        Metric.identityCard("IRQ", cardConfig);

        user += cpus[id].times.user;
        nice += cpus[id].times.nice;
        sys += cpus[id].times.sys;
        idle += cpus[id].times.idle;
        irq += cpus[id].times.irq;
    }

    total = user + nice + sys + idle + irq;
    Reflect.set(pourcentCPU, "idle", idle);
    Reflect.set(pourcentCPU, "total", total);

    intervalId = Timer.setInterval(cpuInterval, INTERVAL_MS);
});

// Triggered when the addon is stoped by the core
CPU.on("stop", () => {
    Timer.clearInterval(intervalId);
});

// Export addon
module.exports = CPU;
