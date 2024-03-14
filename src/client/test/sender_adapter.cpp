#include <iostream>
#include <string>
#include <random>

#include "../src/helpers/json.hpp"
using Json_de = nlohmann::json;

#include "../src/helpers/colors.hpp"
#include "../src/uavos_common/uavos_module.hpp"


using namespace uavos;
using namespace uavos::comm;
bool exit_me = false;
int delay = 1000;
int counter = 0;

#define MESSAGE_FILTER {TYPE_AndruavMessage_USER_RANGE_START+1,\
                        TYPE_AndruavMessage_USER_RANGE_START+2}

CModule& cModule= CModule::getInstance(); 

#define TYPE_CUSTOM_SOME_DATA  TYPE_AndruavMessage_USER_RANGE_START+0
#define TYPE_CUSTOM_CHANGE_RATE  TYPE_AndruavMessage_USER_RANGE_START+1


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


void onReceive (const char * message, int len, Json_de jMsg)
{
    const int msgid = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE].get<int>();

    #ifdef DDEBUG        
        std::cout << _LOG_CONSOLE_TEXT << "RX MSG:" << msgid << ":len: " << std::to_string(len) << ":" << message <<   _NORMAL_CONSOLE_TEXT_ << std::endl;
        std::cout << jMsg.dump() << std::endl;
    #endif

    if (msgid == TYPE_CUSTOM_CHANGE_RATE)
    {
        const int delta_delay = jMsg["ms"]["value"].get<int>();
        std::cout << _LOG_CONSOLE_TEXT_BOLD_ << "delta_delay:" << _INFO_CONSOLE_BOLD_TEXT << delta_delay << _NORMAL_CONSOLE_TEXT_ << std::endl;

        delay += delta_delay;
        
        if (delay < 10)
        {
            delay = 10;
        }
            
    }
}


void sendMsg ()
{
    Json_de message=
    {
        {"t", "SENDING DATA"},

        {"counter", counter}
    };

    ++counter;
    cModule.sendJMSG("", message, TYPE_AndruavMessage_USER_RANGE_START, true);
}


int main (int argc, char *argv[])
{

    if (argc < 3) {
        std::cerr << _INFO_CONSOLE_BOLD_TEXT << "Insufficient arguments. Usage: app module_name broker_port(60000) [rate(default 1000)]" << _NORMAL_CONSOLE_TEXT_ << std::endl;
        return 1;
    }
    
    std::string module_name = argv[1];
    int target_port = std::stoi(argv[2]);
    if (argc==4)
    {
        delay = std::stoi(argv[3]);
    }

    std::string module_id = generateRandomModuleID();
    
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "SENDING Rate-Adapter " << _NORMAL_CONSOLE_TEXT_ << std::endl;

    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        module_name,
        module_id,
        "0.0.1",
        Json_de::array(MESSAGE_FILTER) 
    );

    // Add feature this module supports. [OPTIONAL]
    cModule.addModuleFeatures(MODULE_FEATURE_SENDING_TELEMETRY);
    cModule.addModuleFeatures(MODULE_FEATURE_RECEIVING_TELEMETRY);
    
    // Add Hardware Verification Info to be verified by server. [OPTIONAL]
    cModule.setHardware("123456", ENUM_HARDWARE_TYPE::HARDWARE_TYPE_CPU);
    cModule.setMessageOnReceive (&onReceive);

    cModule.init("0.0.0.0",target_port, "0.0.0.0", 70034);
    
    std::cout << "RUNNING " << std::endl; 
    
    while (!exit_me)
    {
       std::cout << _LOG_CONSOLE_TEXT << "Next Message in " << _INFO_CONSOLE_BOLD_TEXT << delay << _LOG_CONSOLE_TEXT << " ms" << _NORMAL_CONSOLE_TEXT_ <<  std::endl; 
       std::this_thread::sleep_for(std::chrono::milliseconds(delay));
       std::cout << _TEXT_BOLD_HIGHTLITED_ << "SENDING MESSAGE NUMBER:" << _SUCCESS_CONSOLE_BOLD_TEXT_ << counter << _NORMAL_CONSOLE_TEXT_ << std::endl; 
       sendMsg();
    }


    #ifdef DEBUG
	        std::cout << "EXIT " << std::endl; 
    #endif
    
}