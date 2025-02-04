const readline = require('readline');
const dgram = require('dgram');
const CModule = require('./de_module'); // Adjust the path as necessary
const {CMyFacade} = require('./de_facade_base'); // Adjust path as necessary
const { TYPE_AndruavMessage_DUMMY, NOTIFICATION_TYPE_NOTICE, ERROR_USER_DEFINED, NOTIFICATION_TYPE_INFO } = require('./messages'); // Adjust path as necessary
const { INFO_CONSOLE_TEXT, INFO_CONSOLE_BOLD_TEXT, NORMAL_CONSOLE_TEXT, SUCCESS_CONSOLE_BOLD_TEXT } = require('./colors'); // Adjust path as necessary

const DEFAULT_UDP_DATABUS_PACKET_SIZE = 8192;

const cModule = new CModule();
const baseFacade = new CMyFacade(cModule);

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

if (require.main === module) {
    console.log(INFO_CONSOLE_BOLD_TEXT + "This module can be used as follows:" + NORMAL_CONSOLE_TEXT);
    console.log(SUCCESS_CONSOLE_BOLD_TEXT + "./client sample_mod_js 60000 61111" + NORMAL_CONSOLE_TEXT);
    console.log(INFO_CONSOLE_BOLD_TEXT + "If the drone engage is running on port 60000 it will connect to it and appear in the WebClient Details tab as a module named sample_mod_js." + NORMAL_CONSOLE_TEXT);
    console.log("Press any key to continue ...");
    
    
    const args = process.argv.slice(2);
    if (args.length < 3) {
        waitForKeyPress(() => {
            console.log(INFO_CONSOLE_BOLD_TEXT + "Insufficient arguments. Usage: app module_name broker_port(60000) listen_port(60003)  e.g.: node client.js nodejs 60000 61234" + NORMAL_CONSOLE_TEXT);
            process.exit(1);
        });
        return; // Exit the current execution context
    }

    const moduleName = args[0];
    const targetPort = parseInt(args[1]);
    const listenPort = parseInt(args[2]);

    const moduleId = generateRandomModuleId();

    console.log(INFO_CONSOLE_TEXT + "Client Module-Started " + NORMAL_CONSOLE_TEXT);

    // Define a Module
    cModule.defineModule(
        "gen", // MODULE_CLASS_GENERIC
        moduleName,
        moduleId,
        "0.0.1",
        []
    );

    // Add features this module supports. [OPTIONAL]
    cModule.addModuleFeatures("T"); // MODULE_FEATURE_SENDING_TELEMETRY
    cModule.addModuleFeatures("R"); // MODULE_FEATURE_RECEIVING_TELEMETRY

    // Add Hardware Verification Info to be verified by the server. [OPTIONAL]
    cModule.setHardware("123456", 1); // HARDWARE_TYPE_CPU

    cModule.init("0.0.0.0", targetPort, "0.0.0.0", listenPort, DEFAULT_UDP_DATABUS_PACKET_SIZE);

    console.log("Client Module RUNNING");

    setInterval(() => {
        console.log("Client Module RUNNING");
        sendMsg();
    }, 1000);

    console.log("EXIT");
}