/*******************************************************************************************
 * 
 * U A V O S - D A T A B U S  Module
 * 
 * 
 * Author: Mohammad S. Hefny 
 * 
 **/


#include "../../helpers/colors.hpp"
#include "./uavos_common/uavos_module.hpp"



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


void onReceive (const char * message, int len)
{
    #ifdef DEBUG        
        std::cout << _LOG_CONSOLE_TEXT << "RX MSG: :len " << std::to_string(len) << ":" << message <<   _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    
    
}

int main (int argc, char *argv[])
{

    std::cout << _INFO_CONSOLE_TEXT << "HELLO " << _NORMAL_CONSOLE_TEXT_ << std::endl;

    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        "My-MODULE Module",
        "e27e099d91de",
        "0.0.1",
        Json_de::array(MESSAGE_FILTER)
    );
    cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
    cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);
    
    cModule.setHardware("123456", ENUM_HARDWARE_TYPE::HARDWARE_TYPE_CPU);
    cModule.setMessageOnReceive (&onReceive);
    
    cModule.init("0.0.0.0",60000,"0.0.0.0",60013);
    

    while (!exit_me)
    {
       std::this_thread::sleep_for(std::chrono::seconds(1));
       std::cout << "RUNNING " << std::endl; 
    }


    #ifdef DEBUG
	        std::cout << "EXIT " << std::endl; 
    #endif
    
}