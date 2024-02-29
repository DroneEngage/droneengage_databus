#include <iostream>
#include <string>
#include <random>

#include "../src/helpers/colors.hpp"
#include "../src/uavos_common/uavos_module.hpp"




using namespace uavos;
using namespace uavos::comm;
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


int main (int argc, char *argv[])
{

    if (argc < 4) {
        std::cerr << "Insufficient arguments. Usage: app module_name listen_port(60003) broker_port(60000)" << std::endl;
        return 1;
    }
    
    std::string module_name = argv[1];
    int listen_port = std::stoi(argv[2]);
    int target_port = std::stoi(argv[3]);

    std::string module_id = generateRandomModuleID();
    
    std::cout << _INFO_CONSOLE_TEXT << "HELLO " << _NORMAL_CONSOLE_TEXT_ << std::endl;

    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        module_name,
        module_id,
        "0.0.1",
        Json::array()  // WAITING FOR NO MESSAGES
    );

    // Add feature this module supports. [OPTIONAL]
    cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
    cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);
    
    // Add Hardware Verification Info to be verified by server. [OPTIONAL]
    cModule.setHardware("123456", ENUM_HARDWARE_TYPE::HARDWARE_TYPE_CPU);
    
    cModule.init("0.0.0.0",target_port, "0.0.0.0", listen_port);
    
    std::cout << "CLIENT RUNNING " << std::endl; 
    
    while (!exit_me)
    {
       std::this_thread::sleep_for(std::chrono::seconds(1));
       std::cout << "CLIENT RUNNING " << std::endl; 
    }


    #ifdef DEBUG
	        std::cout << "EXIT " << std::endl; 
    #endif
    
}