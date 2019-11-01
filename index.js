// Require Node.js Dependencies
import os from "os";

// Require Third-party Dependencies
import Units from "@slimio/units";
import metrics from "@slimio/metrics";
import Addon from "@slimio/addon";

// CONSTANTS
const INTERVAL_MS = 5000;

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
CPU.registerInterval(cpuInterval, INTERVAL_MS);

// Export addon
export default CPU;
