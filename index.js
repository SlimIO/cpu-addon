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
async function main({ logger }) {
    logger.info('CPU Run!');
}

// Export addon
module.exports = CPU;