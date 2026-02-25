#include <iostream>
#include <string>
#include <random>
#include <limits>

#include "../src/de_common/helpers/json_nlohmann.hpp"
using Json_de = nlohmann::json;

#include "../src/de_common/helpers/colors.hpp"
#include "../src/de_common/de_databus/de_module.hpp"




using namespace de;
using namespace de::comm;
bool exit_me = false;

#define MESSAGE_FILTER {TYPE_AndruavMessage_RemoteExecute,\
                        TYPE_AndruavMessage_FlightControl,\
                        TYPE_AndruavMessage_GeoFence,\
                        TYPE_AndruavMessage_ExternalGeoFence,\
                        TYPE_AndruavMessage_Arm,\
                        TYPE_AndruavMessage_ChangeAltitude,\
                        TYPE_AndruavMessage_Land,\
                        TYPE_AndruavMessage_GuidedPoint,\
                        TYPE_AndruavMessage_CirclePoint,\
                        TYPE_AndruavMessage_DoYAW,\
                        TYPE_AndruavMessage_DistinationLocation, \
                        TYPE_AndruavMessage_ChangeSpeed, \
                        TYPE_AndruavMessage_TrackingTarget, \
                        TYPE_AndruavMessage_TrackingTargetLocation, \
                        TYPE_AndruavMessage_TargetLost, \
                        TYPE_AndruavMessage_UploadWayPoints, \
                        TYPE_AndruavMessage_RemoteControlSettings, \
                        TYPE_AndruavMessage_SET_HOME_LOCATION, \
                        TYPE_AndruavMessage_RemoteControl2, \
                        TYPE_AndruavMessage_LightTelemetry, \
                        TYPE_AndruavMessage_ServoChannel, \
                        TYPE_AndruavMessage_Sync_EventFire, \
                        TYPE_AndruavMessage_MAVLINK, \
                        TYPE_AndruavMessage_SWARM_MAVLINK, \
                        TYPE_AndruavMessage_MAKE_SWARM,  \
                        TYPE_AndruavMessage_FollowHim_Request,  \
                        TYPE_AndruavMessage_FollowMe_Guided, \
                        TYPE_AndruavMessage_UpdateSwarm, \
                        TYPE_AndruavMessage_UDPProxy_Info, \
                        TYPE_AndruavSystem_UdpProxy, \
                        TYPE_AndruavMessage_P2P_ACTION, \
                        TYPE_AndruavMessage_P2P_STATUS}

CModule& cModule= CModule::getInstance(); 

std::string generateRandomModuleID() {
    std::random_device rd;
    std::mt19937 generator(rd());
    std::uniform_int_distribution<char> distribution('0', '9');
    
    std::string moduleID;
    for (int i = 0; i < 12; ++i) {
        moduleID += distribution(generator);
    }
    
    return moduleID;
}


void sendMsg ()
{
    Json_de message=
    {
        {"t", "THIS IS A TEST MESSAGE"},

        {"long", "Received the likewise law graceful his. Nor might set along charm now equal green. Pleased yet equally correct colonel not one. Say anxious carried compact conduct sex general nay certain. Mrs for recommend exquisite household eagerness preserved now. My improved honoured he am ecstatic quitting greatest formerly."}
    };

    cModule.sendJMSG("", message, TYPE_AndruavMessage_DUMMY, true);
}

void printUsage()
{
    std::cout << _INFO_CONSOLE_BOLD_TEXT << "DroneEngage C++ Client Module" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << std::endl;
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "USAGE:" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << "  ./client [OPTIONS] MODULE_NAME de_comm_port LISTEN_PORT" << std::endl;
    std::cout << std::endl;
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "ARGUMENTS:" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << "  MODULE_NAME    Name of the module (e.g., DE_Plugin, My_Custom_DE_Module)" << std::endl;
    std::cout << "  de_comm_port    Port where DE Communicator (de_comm) is running (default: 60000)" << std::endl;
    std::cout << "  LISTEN_PORT    Port for this module to listen on (default: 61111)" << std::endl;
    std::cout << std::endl;
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "OPTIONS:" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << "  -h, --help     Show this help message and exit" << std::endl;
    std::cout << std::endl;
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "EXAMPLES:" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << "  ./client sample_mod_cpp 60000 61111" << std::endl;
    std::cout << "  ./client CPP_Plugin 60000 61233" << std::endl;
    std::cout << std::endl;
    std::cout << _INFO_CONSOLE_BOLD_TEXT << "DESCRIPTION:" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << "  This client connects to a DE Communicator (de_comm) and appears in the" << std::endl;
    std::cout << "  WebClient Details tab as a module with the specified name." << std::endl;
    std::cout << "  The module supports sending and receiving telemetry messages." << std::endl;
}

int main (int argc, char *argv[])
{
    // Check for help flag first
    bool showHelp = false;
    if (argc > 1) {
        std::string arg1(argv[1]);
        if (arg1 == "-h" || arg1 == "--help") {
            showHelp = true;
        }
    }

    // Show help if requested or missing module name
    if (showHelp || argc < 2) {
        printUsage();
        if (!showHelp) {
            std::cout << "Press ENTER to continue ..." << std::endl;
            // Clear any leftover characters in the input buffer
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cin.get();
        }
        return showHelp ? 0 : 1;
    }

    // Set defaults for optional arguments
    std::string module_name = argv[1];
    int target_port = 60000;  // default
    int listen_port = 61111;  // default

    // Parse optional port arguments
    if (argc >= 3) {
        try {
            target_port = std::stoi(argv[2]);
        } catch (const std::exception& e) {
            std::cout << _ERROR_CONSOLE_TEXT_ << "Invalid de_comm_port: " << argv[2] << _NORMAL_CONSOLE_TEXT_ << std::endl;
            return 1;
        }
    }
    
    if (argc >= 4) {
        try {
            listen_port = std::stoi(argv[3]);
        } catch (const std::exception& e) {
            std::cout << _ERROR_CONSOLE_TEXT_ << "Invalid listen_port: " << argv[3] << _NORMAL_CONSOLE_TEXT_ << std::endl;
            return 1;
        }
    }
    
    std::string module_id = generateRandomModuleID();
    
    std::cout << _INFO_CONSOLE_TEXT << "Client Module-Started " << _NORMAL_CONSOLE_TEXT_ << std::endl;

    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        module_name,
        module_id,
        "0.0.1",
        Json_de::array()  // WAITING FOR NO MESSAGES
    );

    // Add feature this module supports. [OPTIONAL]
    cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
    cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);
    
    // Add Hardware Verification Info to be verified by server. [OPTIONAL]
    cModule.setHardware("123456", ENUM_HARDWARE_TYPE::HARDWARE_TYPE_CPU);
    
    cModule.init("0.0.0.0",target_port, "0.0.0.0", listen_port, DEFAULT_UDP_DATABUS_PACKET_SIZE);
    
    std::cout << "Client Module RUNNING " << std::endl; 
    
    while (!exit_me)
    {
       std::this_thread::sleep_for(std::chrono::milliseconds(1000));
       std::cout << "Client Module RUNNING " << std::endl; 
       sendMsg();
    }


    #ifdef DEBUG
	        std::cout << "EXIT " << std::endl; 
    #endif
    
}