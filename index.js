/**
 * @const CPU
 * @type {Service}
 * @default
 */
const CPU = new Service(main);

// Regisering get_info callback!
CPU.registerCallback(async function get_info() {
    return 'get_info hello world!';
});


/**
 * Addon main handler
 * @async
 * @function main
 */
async function main() {
    //CPU.send('hello world!');
    this.logger.info('Hello world!');
    // const ret = await CPU.execute('agent.addons.stop',{
    //     name: 'cpu'
    // }).catch( E => {
    //     this.logger.error(`Failed to stop cpu addon :: ${E}`);
    // });
    // this.logger.info(`Callback ret => ${ret}`);
    //this.logger.info('Hello world from CPU Addon!');
}

// Export addon
module.exports = CPU;