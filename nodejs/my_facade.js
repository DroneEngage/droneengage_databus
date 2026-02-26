/**
 * Custom facade implementation extending CFacade_Base
 * This file contains user-specific facade methods to keep base files clean
 */

const { CFacade_Base } = require('./de_facade_base');

class CMyFacade extends CFacade_Base {
    constructor(module) {
        super();
        if (module) {
            this.setModule(module);
        }
    }

    // Add your custom methods here
    myCustomMethod(arg1, arg2) {
        // Implement your custom method here
        console.log(`myCustomMethod called with args: ${arg1}, ${arg2}`);
    }

    // Example: Add drone-specific methods
    sendDroneStatus(targetPartyID, status) {
        // Example method to send drone status
        this.sendErrorMessage(targetPartyID, 0, 1, 6, `Drone Status: ${status}`);
    }

    // Example: Add telemetry methods
    sendTelemetry(targetPartyID, telemetryData) {
        // Example method to send telemetry data
        console.log(`Sending telemetry to ${targetPartyID}:`, telemetryData);
    }
}

module.exports = { CMyFacade };
