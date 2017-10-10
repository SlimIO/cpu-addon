// Require Node.JS Dep
const os = require('os');
const cpus = os.cpus();

/**
 * Create CPU QoS
 */
const CPUDefinition = new MetricDefinition({
    name: "CPU",
    protoFile: './addons/cpu/qos/qos.proto',
    lookupType: 'qos.cpu'
});

/**
 * @const CPU
 * @type {Addon}
 * @default
 */
const CPU = new Addon(main);

// Regisering get_info callback!
CPU.registerCallback(get_info);
CPU.registerDefinition(CPUDefinition);

// Register metric items!
cpus.forEach( (cpu,i) => {
    CPUDefinition.createItem(`cpu${i}`,{
        model: cpu.model,
        speed: cpu.speed
    });
});

async function get_info() {
    return 'get_info callback from cpu addon';
}

/**
 * Addon main handler
 * @async
 * @function main
 */
async function main({ logger, request, execute }) {
    console.time('handle_cpu');
    logger.info('CPU is running...');

    let total = 0, type;
    for(let i = 0; i < cpus.length; i++) {
        for(type in cpus[i].times) {
            total += cpus[i].times[type];
        }
        for(type in cpus[i].times) {
            CPUDefinition.items.get(`cpu${i}`).sendValue(type,Math.round(100 * cpus[i].times[type] / total));
        }
        total = 0;
    }
    console.timeEnd('handle_cpu');
}

// Export addon
module.exports = CPU;