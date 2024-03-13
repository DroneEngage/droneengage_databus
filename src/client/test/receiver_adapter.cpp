#include <iostream>
#include <queue>
#include <string>
#include <random>
#include <thread>

#include "../src/helpers/json.hpp"
using Json_de = nlohmann::json;

#include "../src/helpers/colors.hpp"
#include "../src/uavos_common/uavos_module.hpp"


using namespace uavos;
using namespace uavos::comm;
bool exit_me = false;
bool message_processed = false;

#define MESSAGE_FILTER {TYPE_AndruavMessage_USER_RANGE_START}

CModule& cModule= CModule::getInstance(); 

#define TYPE_CUSTOM_SOME_DATA  TYPE_AndruavMessage_USER_RANGE_START+0
#define TYPE_CUSTOM_CHANGE_RATE  TYPE_AndruavMessage_USER_RANGE_START+1

std::mutex messageQueueMutex;

void sendMsg (int value);


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

std::queue<std::vector<char>> messageQueue;


void processMessages() {

    std::unique_lock<std::mutex> lock(messageQueueMutex, std::defer_lock);

    std::cout << _INFO_CONSOLE_BOLD_TEXT << "Processing message IN " << _NORMAL_CONSOLE_TEXT_ << std::endl;

    while (!messageQueue.empty()) {
            // Get the front message from the queue
        lock.lock();
        std::vector<char>& frontMessage = messageQueue.front();
        // Process or use the front message
        // Example: Print the size of the message
        std::cout << _LOG_CONSOLE_TEXT_BOLD_ << "Processing message of size " << messageQueue.size() << _NORMAL_CONSOLE_TEXT_ << std::endl;
        

        #ifdef DEBUG        
        std::cout << _LOG_CONSOLE_TEXT << "RX MSG:" << ":len " << std::to_string(frontMessage.size()) << ":" << frontMessage.data() <<   _NORMAL_CONSOLE_TEXT_ << std::endl;
        #endif

        messageQueue.pop();

        std::this_thread::sleep_for(std::chrono::milliseconds(300));

        lock.unlock();    
        // Pop the front message from the queue
        
    }

    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "Processing message FINISHED " << _NORMAL_CONSOLE_TEXT_ << std::endl;
        
}


void onReceive (const char * message, int len, Json_de jMsg)
{
    const int msgid = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE].get<int>();

    if (msgid == TYPE_CUSTOM_SOME_DATA)
    {

        std::unique_lock<std::mutex> lock(messageQueueMutex, std::defer_lock);
        // Add message to the queue
        std::vector<char> msg(message, message + len);
        bool locked = lock.try_lock();
        if (locked)
        {
            
            // The mutex was successfully locked
            std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "The mutex is locked." <<  _NORMAL_CONSOLE_TEXT_ << std::endl;
            messageQueue.push(msg);
            lock.unlock();
            
            sendMsg(-5); // send faster
        }
        else
        {
            // The mutex is already locked
            std::cout << _ERROR_CONSOLE_BOLD_TEXT_ << "The mutex is already locked." <<  _NORMAL_CONSOLE_TEXT_ << std::endl;
            sendMsg(+5); // send slower
            lock.lock();
            messageQueue.push(msg);
            lock.unlock();
        }
        
        
        // Print the added message
        std::cout << "Added message: " << message << std::endl;

    }
}



void sendMsg (int value)
{
    Json_de message=
    {
        {"t", "CHANGE SPEED"},

        {"long", "PLUS"}
    };

    message["value"] = value;

    cModule.sendJMSG("", message, TYPE_AndruavMessage_USER_RANGE_START+1, true);
}


int main (int argc, char *argv[])
{
    if (argc < 3) {
        std::cerr << _INFO_CONSOLE_BOLD_TEXT << "Insufficient arguments. Usage: app module_name broker_port(60000)" << _NORMAL_CONSOLE_TEXT_ << std::endl;
        return 1;
    }
    
    std::string module_name = argv[1];
    int target_port = std::stoi(argv[2]);

    std::string module_id = generateRandomModuleID();
    
    std::cout << _INFO_CONSOLE_TEXT << "Receiver Rate-Adapter " << _NORMAL_CONSOLE_TEXT_ << std::endl;

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

    cModule.init("0.0.0.0",target_port, "0.0.0.0", 70024);
    
    std::cout << "RUNNING " << std::endl; 
    
    while (!exit_me)
    {
       //std::this_thread::sleep_for(std::chrono::milliseconds(300));
       std::cout << "Receiver RUNNING " << std::endl; 
       processMessages();
    }


    #ifdef DEBUG
	        std::cout << "EXIT " << std::endl; 
    #endif
}