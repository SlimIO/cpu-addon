// Require Node.JS Dep
const os = require('os');
const cpus = os.cpus();

/**
 * @const CPU
 * @type {Addon}
 * @default
 */
const CPU = new Addon(main);

// Regisering get_info callback!
CPU.registerCallback(get_info);

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

    const CPUQoS = [];
    let total = 0, type;

    for(let i = 0; i < cpus.length; i++) {
        for(type in cpus[i].times) {
            total += cpus[i].times[type];
        }

        for(type in cpus[i].times) {
            // CPUQoS.push({
            //     cpu_id: i,
            //     type, 
            //     value: Math.round(100 * cpus[i].times[type] / total),
            //     timestamp: Date.now()
            // });
        }
        total = 0;
    }
    console.timeEnd('handle_cpu');
}

// Export addon
module.exports = CPU;