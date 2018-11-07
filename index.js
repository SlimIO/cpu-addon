// NodeJS Dependencies
const os = require("os");

// SlimIO Dependencies
const Unit = require("@slimio/units");
const Metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");
const timer = require("@slimio/timer");

const CPU = new Addon("CPU");
const metric = new Metrics(CPU); 

CPU.on("start", () => {
    console.log("[CPU] Start event triggered!");
    const entity = metric.entity("CPU", {
        description: "Central Processing Unit"
    });

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const childCPU = metric.entity(`CPU.${id}`, {
            parent: entity
        })
            .set("speed", cpus[id].speed)
            .set("model", cpus[id].model);

        // All Identity Card are Prefixed by the Identity Name (ex: CPU_USER).
        const cardConfig = { unit: Unit.Pourcent, entity: childCPU };
        metric.identityCard("USER", cardConfig);
        metric.identityCard("NICE", cardConfig);
        metric.identityCard("SYS", cardConfig);
        metric.identityCard("IDLE", cardConfig);
        metric.identityCard("IRQ", cardConfig);
    }

    timer.setInterval(() => {
        const harvestedAt = Date.now();
        console.log("[CPU] publish metrics");
        const cpus = os.cpus();
        for (let id = 0; id < cpus.length; id++) {
            metric.publish(`CPU.${id}_USER`, cpus[id].times.user, harvestedAt);
            metric.publish(`CPU.${id}_NICE`, cpus[id].times.nice);
            metric.publish(`CPU.${id}_SYS`, cpus[id].times.sys);
            metric.publish(`CPU.${id}_IDLE`, cpus[id].times.idle);
            metric.publish(`CPU.${id}_IRQ`, cpus[id].times.irq);
        }
    }, 5000);

    CPU.ready();
});

// Export addon
module.exports = CPU;
