const { join } = require('path');
const Service = require( join( '..' , '..', 'core' , 'Service.js' ) );

/**
 * Addon main handler
 * @async
 * @function main
 */
async function main() {
    this.logger.info('Hello world from CPU Addon!');
}

/**
 * @const CPU
 * @type {Service}
 * @default
 */
const CPU = new Service(main)
.registerCallback(async function get_info() {
    return 'get_info hello world!';
});

// Export addon
module.exports = CPU;