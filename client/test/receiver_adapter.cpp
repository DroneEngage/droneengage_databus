#include <iostream>
#include <queue>
#include <string>
#include <random>
#include <thread>

#include "../src/helpers/json_nlohmann.hpp"
using Json_de = nlohmann::json;

#include "../src/helpers/colors.hpp"
#include "../src/de_common/de_module.hpp"

#include <mutex>
#include <condition_variable>


using namespace de;
using namespace de::comm;
bool exit_me = false;
int delay = 1000;
int messages_input_counter = 0;
int messages_processed_counter = 0;
bool message_processed = false;

#define MESSAGE_FILTER {TYPE_AndruavMessage_USER_RANGE_START}

CModule& cModule= CModule::getInstance(); 

#define TYPE_CUSTOM_SOME_DATA  TYPE_AndruavMessage_USER_RANGE_START+0
#define TYPE_CUSTOM_CHANGE_RATE  TYPE_AndruavMessage_USER_RANGE_START+1

std::mutex messageQueueMutex;
std::mutex messageQueueWaitingMutex;

std::condition_variable messageQueueConditionVariable;



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

    std::cout << _INFO_CONSOLE_BOLD_TEXT << "Check Queue " << _NORMAL_CONSOLE_TEXT_ << std::endl;

    static int counter = 0;
    static int diff = 0;

    static int i_pid = 0;
        
    while (messageQueue.size()>0) {
        //std::unique_lock<std::mutex> lock_wait(messageQueueWaitingMutex);
        //messageQueueConditionVariable.wait(lock_wait);

        // Get the front message from the queue
        lock.lock();
        std::vector<char>& frontMessage = messageQueue.front();
        
        // Process or use the front message
        // Example: Print the size of the message
        diff = messageQueue.size() - counter + 1;
        counter = messageQueue.size();
        std::cout << _TEXT_BOLD_HIGHTLITED_ << "PROCESS MESSAGE : " << _SUCCESS_CONSOLE_BOLD_TEXT_ << messages_processed_counter << _NORMAL_CONSOLE_TEXT_ << std::endl;
        std::cout << _TEXT_BOLD_HIGHTLITED_ << "QUEUE : " << _SUCCESS_CONSOLE_BOLD_TEXT_ << counter << " diff:" << _SUCCESS_CONSOLE_BOLD_TEXT_ << diff << _NORMAL_CONSOLE_TEXT_ << std::endl;
        

        #ifdef DDEBUG        
            std::cout << _LOG_CONSOLE_TEXT << "RX MSG#" << _INFO_CONSOLE_BOLD_TEXT << messages_processed_counter << ":len " << std::to_string(frontMessage.size()) << ":" << frontMessage.data() <<   _NORMAL_CONSOLE_TEXT_ << std::endl;
        #endif
        lock.unlock();
        

        std::this_thread::sleep_for(std::chrono::milliseconds(delay));
        
        lock.lock();
        messageQueue.pop();
        lock.unlock();    
        
        ++messages_processed_counter;
        
        // Pop the front message from the queue
        if ((counter > 2) && (diff>0))
        {   
            
            sendMsg(+2 * counter); // send slower
            i_pid = 0;
        }
        else
        {
            if (i_pid>100) i_pid = 100;
        }
    }

    sendMsg(0); // send now
        
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "IDLE " << _NORMAL_CONSOLE_TEXT_ << std::endl;
        
}


void onReceive (const char * message, int len, Json_de jMsg)
{
    const int msgid = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE].get<int>();

    if (msgid == TYPE_CUSTOM_SOME_DATA)
    {

        // Prepare a vector 
        std::vector<char> msg(message, message + len);
        
        ++messages_input_counter;

        // Check that it is safe to access Queue.
        std::unique_lock<std::mutex> lock(messageQueueMutex, std::defer_lock);
        
        bool locked = lock.try_lock();
        if (locked)
        {
            // The mutex was successfully locked
            std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "MSG# " << _INFO_CONSOLE_BOLD_TEXT << messages_input_counter << _SUCCESS_CONSOLE_BOLD_TEXT_ << " >> QUEUE" _NORMAL_CONSOLE_TEXT_ << std::endl;
            messageQueue.push(msg);
            int counter = messageQueue.size();
            lock.unlock();
            
            messageQueueConditionVariable.notify_one();
        }
        else
        {
            // The mutex is already locked
            std::cout << _ERROR_CONSOLE_BOLD_TEXT_ << "QUEUE IS BEING PROCESSED" <<  _INFO_CONSOLE_BOLD_TEXT << messages_input_counter << _NORMAL_CONSOLE_TEXT_ << std::endl;
            
            lock.lock();
            std::cout << _ERROR_CONSOLE_BOLD_TEXT_ << "PUSSHED" <<  _NORMAL_CONSOLE_TEXT_ << std::endl;
            std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "MSG# " << _INFO_CONSOLE_BOLD_TEXT << messages_input_counter << _SUCCESS_CONSOLE_BOLD_TEXT_ << " >> QUEUE" _NORMAL_CONSOLE_TEXT_ << std::endl;
            messageQueue.push(msg);
            messageQueueConditionVariable.notify_one();
            lock.unlock();
        }
    }
}



void sendMsg (int value)
{
    Json_de message=
    {
        {"t", "CHANGE SPEED"},

        {"processed", messages_processed_counter}
    };
    
    message["value"] = value;

    cModule.sendJMSG("", message, TYPE_AndruavMessage_USER_RANGE_START+1, true);
}


int main (int argc, char *argv[])
{
    std::cout << _INFO_CONSOLE_BOLD_TEXT << "This module can be used as follows:"  << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << "./receiver_adapter sender_mod 60000" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << _INFO_CONSOLE_BOLD_TEXT << "It will connect to a running DroneEngage communicator on port 60000 and receives messages of type TYPE_AndruavMessage_USER_RANGE_START."  << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << _INFO_CONSOLE_BOLD_TEXT << "You can send these messages using sender_adapter."  << _NORMAL_CONSOLE_TEXT_ << std::endl;
    std::cout << "Press any key to continue ..." << std::endl;
    std::cin.get();

    if (argc < 3) {
        std::cerr << _INFO_CONSOLE_BOLD_TEXT << "Insufficient arguments. Usage: app module_name broker_port(60000) " << _NORMAL_CONSOLE_TEXT_ << std::endl;
        return 1;
    }
    
    std::string module_name = argv[1];
    int target_port = std::stoi(argv[2]);
    if (argc==4)
    {
        delay = std::stoi(argv[3]);
    }

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

    cModule.init("0.0.0.0",target_port, "0.0.0.0", 70024, DEFAULT_UDP_DATABUS_PACKET_SIZE);
    
    std::cout << "RUNNING " << std::endl; 
    
    while (!exit_me)
    {
       std::this_thread::sleep_for(std::chrono::milliseconds(300));
       std::cout << "Receiver RUNNING " << std::endl; 
       processMessages();
    }


    #ifdef DEBUG
	        std::cout << "EXIT " << std::endl; 
    #endif
    
    return 0;
}