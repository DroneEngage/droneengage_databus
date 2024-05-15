#include <iostream>
#include <string>
#include <random>

#include "../src/helpers/json_nlohmann.hpp"
using Json_de = nlohmann::json;

#include "../src/helpers/colors.hpp"
#include "../src/de_common/de_module.hpp"




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

int main (int argc, char *argv[])
{

    std::cout << _INFO_CONSOLE_BOLD_TEXT << "This module can be used as follows:"  << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "./client sample_mod 60000 61111" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << _INFO_CONSOLE_BOLD_TEXT << "If drone engage is running on port 60000 it will connect to it and appears in WebClient Details tab as a module named sample_mod."  << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << "Press any key to continue ..." << std::endl;
    std::cin.get();

    if (argc < 4) {
        std::cout << _INFO_CONSOLE_BOLD_TEXT << "Insufficient arguments. Usage: app module_name broker_port(60000) listen_port(60003)" << _NORMAL_CONSOLE_TEXT_ << std::endl;
        return 1;
    }
    
    std::string module_name = argv[1];
    int target_port = std::stoi(argv[2]);
    int listen_port = std::stoi(argv[3]);
    
    std::string module_id = generateRandomModuleID();
    
    std::cout << _INFO_CONSOLE_TEXT_ << "Client Module-Started " << _NORMAL_CONSOLE_TEXT_ << std::endl;

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