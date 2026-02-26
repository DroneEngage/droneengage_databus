const readline = require('readline');
const dgram = require('dgram');
const CModule = require('./de_module'); // Adjust the path as necessary
const {CMyFacade} = require('./my_facade'); // Adjust path as necessary
const { TYPE_AndruavMessage_RemoteExecute, TYPE_AndruavMessage_FlightControl, TYPE_AndruavMessage_GeoFence, TYPE_AndruavMessage_ExternalGeoFence, TYPE_AndruavMessage_Arm, TYPE_AndruavMessage_ChangeAltitude, TYPE_AndruavMessage_Land, TYPE_AndruavMessage_GuidedPoint, TYPE_AndruavMessage_CirclePoint, TYPE_AndruavMessage_DoYAW, TYPE_AndruavMessage_DistinationLocation, TYPE_AndruavMessage_ChangeSpeed, TYPE_AndruavMessage_TrackingTargetLocation, TYPE_AndruavMessage_UploadWayPoints, TYPE_AndruavMessage_RemoteControlSettings, TYPE_AndruavMessage_SET_HOME_LOCATION, TYPE_AndruavMessage_RemoteControl2, TYPE_AndruavMessage_LightTelemetry, TYPE_AndruavMessage_ServoChannel, TYPE_AndruavMessage_Sync_EventFire, TYPE_AndruavMessage_MAVLINK, TYPE_AndruavMessage_SWARM_MAVLINK, TYPE_AndruavMessage_MAKE_SWARM, TYPE_AndruavMessage_FollowHim_Request, TYPE_AndruavMessage_FollowMe_Guided, TYPE_AndruavMessage_UpdateSwarm, TYPE_AndruavMessage_UDPProxy_Info, TYPE_AndruavSystem_UdpProxy, TYPE_AndruavMessage_P2P_ACTION, TYPE_AndruavMessage_P2P_STATUS, NOTIFICATION_TYPE_NOTICE, ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO } = require('./messages'); // Adjust path as necessary
const { INFO_CONSOLE_TEXT, INFO_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT, SUCCESS_CONSOLE_BOLD_TEXT } = require('./colors'); // Adjust path as necessary

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;

// Message filter matching C++ implementation
const MESSAGE_FILTER = [
    TYPE_AndruavMessage_RemoteExecute,
    TYPE_AndruavMessage_FlightControl,
    TYPE_AndruavMessage_GeoFence,
    TYPE_AndruavMessage_ExternalGeoFence,
    TYPE_AndruavMessage_Arm,
    TYPE_AndruavMessage_ChangeAltitude,
    TYPE_AndruavMessage_Land,
    TYPE_AndruavMessage_GuidedPoint,
    TYPE_AndruavMessage_CirclePoint,
    TYPE_AndruavMessage_DoYAW,
    TYPE_AndruavMessage_DistinationLocation,
    TYPE_AndruavMessage_ChangeSpeed,
    TYPE_AndruavMessage_TrackingTargetLocation,
    TYPE_AndruavMessage_UploadWayPoints,
    TYPE_AndruavMessage_RemoteControlSettings,
    TYPE_AndruavMessage_SET_HOME_LOCATION,
    TYPE_AndruavMessage_RemoteControl2,
    TYPE_AndruavMessage_LightTelemetry,
    TYPE_AndruavMessage_ServoChannel,
    TYPE_AndruavMessage_Sync_EventFire,
    TYPE_AndruavMessage_MAVLINK,
    TYPE_AndruavMessage_SWARM_MAVLINK,
    TYPE_AndruavMessage_MAKE_SWARM,
    TYPE_AndruavMessage_FollowHim_Request,
    TYPE_AndruavMessage_FollowMe_Guided,
    TYPE_AndruavMessage_UpdateSwarm,
    TYPE_AndruavMessage_UDPProxy_Info,
    TYPE_AndruavSystem_UdpProxy,
    TYPE_AndruavMessage_P2P_ACTION,
    TYPE_AndruavMessage_P2P_STATUS
];

let shutdownRequested = false;
let intervalId = null;

// Signal handlers for graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n${INFO_CONSOLE_TEXT}Received SIGINT, shutting down gracefully...${NORMAL_CONSOLE_TEXT}`);
    shutdownRequested = true;
    if (intervalId) {
        clearInterval(intervalId);
    }
    cleanupAndExit();
});

process.on('SIGTERM', () => {
    console.log(`\n${INFO_CONSOLE_TEXT}Received SIGTERM, shutting down gracefully...${NORMAL_CONSOLE_TEXT}`);
    shutdownRequested = true;
    if (intervalId) {
        clearInterval(intervalId);
    }
    cleanupAndExit();
});

function cleanupAndExit() {
    console.log(`${INFO_CONSOLE_TEXT}Cleaning up resources...${NORMAL_CONSOLE_TEXT}`);
    try {
        if (cModule && typeof cModule.uninit === 'function') {
            cModule.uninit();
        }
    } catch (error) {
        console.error(`${ERROR_CONSOLE_TEXT}Error during cleanup: ${error.message}${NORMAL_CONSOLE_TEXT}`);
    }
    console.log(`${SUCCESS_CONSOLE_BOLD_TEXT}Client Module EXIT${NORMAL_CONSOLE_TEXT}`);
    process.exit(0);
}

const cModule = new CModule();
const baseFacade = new CMyFacade();
baseFacade.setModule(cModule);

// Function to wait for a key press
function waitForKeyPress(callback) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', () => {
        rl.close(); // Close the readline interface
        callback(); // Call the provided callback function
    });
}

function generateRandomModuleId() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function sendMsg() {
    // Example message structure (uncomment if needed)
    // const message = {
    //     t: "THIS IS A TEST MESSAGE",
    //     long: "Received the likewise law graceful his. Nor might set along charm now equal green. Pleased yet equally correct colonel not one. Say anxious carried compact conduct sex general nay certain. Mrs for recommend exquisite household eagerness preserved now. My improved honoured he am ecstatic quitting greatest formerly."
    // };
    // cModule.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, true);
    baseFacade.sendErrorMessage("", NOTIFICATION_TYPE_NOTICE, ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO, "Hello from Node.js");
}

function printUsage() {
    console.log(INFO_CONSOLE_BOLD_TEXT + "DroneEngage Node.js Client Module" + NORMAL_CONSOLE_TEXT);
    console.log();
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + "USAGE:" + NORMAL_CONSOLE_TEXT);
    console.log("  node client.js [OPTIONS] MODULE_NAME de_comm_port LISTEN_PORT");
    console.log();
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + "ARGUMENTS:" + NORMAL_CONSOLE_TEXT);
    console.log("  MODULE_NAME    Name of the module (e.g., DE_Plugin, My_Custom_DE_Module)");
    console.log("  de_comm_port    Port where DE Communicator (de_comm) is running (default: 60000)");
    console.log("  LISTEN_PORT    Port for this module to listen on (default: 61111)");
    console.log();
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + "OPTIONS:" + NORMAL_CONSOLE_TEXT);
    console.log("  -h, --help     Show this help message and exit");
    console.log();
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + "EXAMPLES:" + NORMAL_CONSOLE_TEXT);
    console.log("  node client.js sample_mod_js 60000 61111");
    console.log("  node client.js JS_Plugin 60000 61233");
    console.log();
    console.log(INFO_CONSOLE_BOLD_TEXT + "DESCRIPTION:" + NORMAL_CONSOLE_TEXT);
    console.log("  This client connects to a DE Communicator (de_comm) and appears in the");
    console.log("  WebClient Details tab as a module with the specified name.");
    console.log("  The module supports sending and receiving telemetry messages.");
}

function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        help: false,
        moduleName: null,
        deCommPort: 60000,
        listenPort: 61111
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-h' || arg === '--help') {
            options.help = true;
        } else if (!options.moduleName) {
            options.moduleName = arg;
        } else if (!options.deCommPortSet) {
            options.deCommPort = parseInt(arg);
            options.deCommPortSet = true;
        } else if (!options.listenPortSet) {
            options.listenPort = parseInt(arg);
            options.listenPortSet = true;
        }
    }

    return options;
}

if (require.main === module) {
    const options = parseArguments();
    
    // Show help if requested or missing module name
    if (options.help || !options.moduleName) {
        printUsage();
        if (!options.help) {
            console.log("Press any key to continue ...");
            waitForKeyPress(() => {
                process.exit(1);
            });
        } else {
            process.exit(0);
        }
        return;
    }

    const moduleName = options.moduleName;
    const targetPort = options.deCommPort;
    const listenPort = options.listenPort;

    const moduleId = generateRandomModuleId();

    console.log(INFO_CONSOLE_TEXT + "Client Module-Started " + NORMAL_CONSOLE_TEXT);

    // Define a Module
    cModule.defineModule(
        "gen", // MODULE_CLASS_GENERIC
        moduleName,
        moduleId,
        "0.0.1",
        MESSAGE_FILTER
    );

    // Add features this module supports. [OPTIONAL]
    cModule.addModuleFeatures("T"); // MODULE_FEATURE_SENDING_TELEMETRY
    cModule.addModuleFeatures("R"); // MODULE_FEATURE_RECEIVING_TELEMETRY

    // Add Hardware Verification Info to be verified by the server. [OPTIONAL]
    cModule.setHardware("123456", 1); // HARDWARE_TYPE_CPU

    cModule.init("0.0.0.0", targetPort, "0.0.0.0", listenPort, DEFAULT_UDP_DATABUS_PACKET_SIZE);

    console.log("Client Module RUNNING");

    // Replace infinite setInterval with shutdown-aware loop
    intervalId = setInterval(() => {
        if (!shutdownRequested) {
            console.log("Client Module RUNNING");
            sendMsg();
        } else {
            clearInterval(intervalId);
        }
    }, 1000);
}