"use strict";

// Require Node.js Dependencies
const os = require("os");

// Require Third-party Dependencies
const Units = require("@slimio/units");
const metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");
const Timer = require("@slimio/timer");

// CONSTANTS
const INTERVAL_MS = 5000;

/** @type {number} */
let intervalId;

// Declare Addon
const CPU = new Addon("cpu").lockOn("events");
const { Entity, MetricIdentityCard, sendRawQoS } = metrics(CPU);

// Declare Entities and MIC
{
    const CPU_E = new Entity("cpu", {
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
 * @function cpuInterval
 * @description Main CPU Interval
 * @returns {void}
 */
function cpuInterval() {
    const raw = { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 };
    const harvestedAt = new Date().getTime();

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const { user, nice, sys, idle, irq } = cpus[id].times;
        sendRawQoS(`CPU.${id}_USER`, user, harvestedAt);
        sendRawQoS(`CPU.${id}_NICE`, nice, harvestedAt);
        sendRawQoS(`CPU.${id}_SYS`, sys, harvestedAt);
        sendRawQoS(`CPU.${id}_IDLE`, idle, harvestedAt);
        sendRawQoS(`CPU.${id}_IRQ`, irq, harvestedAt);

        raw.user += user;
        raw.nice += nice;
        raw.sys += sys;
        raw.idle += idle;
        raw.irq += irq;
    }

    const pourcent = raw.idle / (raw.user + raw.nice + raw.sys + raw.idle + raw.irq);
    sendRawQoS("CPU_total", (1 - pourcent) * 100, harvestedAt);
}

// Triggered when the addon is started by the core
CPU.on("awake", async() => {
    intervalId = Timer.setInterval(cpuInterval, INTERVAL_MS);
    await CPU.ready();
});

// Triggered when the addon is stoped by the core
CPU.on("sleep", () => {
    Timer.clearInterval(intervalId);
});

// Export addon
module.exports = CPU;
