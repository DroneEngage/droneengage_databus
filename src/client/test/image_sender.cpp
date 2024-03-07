#include <iostream>
#include <fstream>
#include <vector>
#include <string>

#include "../src/helpers/json.hpp"
using Json_de = nlohmann::json;

#include "../src/helpers/colors.hpp"
#include "../src/uavos_common/uavos_module.hpp"


using namespace uavos;
using namespace uavos::comm;
bool exit_me = false;

#define MESSAGE_FILTER {TYPE_AndruavMessage_IMG,\
                        TYPE_AndruavMessage_DUMMY}

CModule& cModule= CModule::getInstance(); 


void readBinaryFile(const std::string& file_name, const char*& content, int& content_length)
{
    std::ifstream file(file_name, std::ios::binary | std::ios::ate);
    if (file.is_open())
    {
        std::streampos file_size = file.tellg();
        content_length = static_cast<int>(file_size);

        content = new char[content_length];
        file.seekg(0, std::ios::beg);
        file.read(const_cast<char*>(content), content_length);

        file.close();
        std::cout << "Binary content read from file: " << file_name << std::endl;
    }
    else
    {
        std::cerr << "Failed to open the file: " << file_name << std::endl;
    }
}

int main(int argc, char* argv[])
{
    if (argc < 2)
    {
        std::cerr << "Usage: " << argv[0] << " <file_name>" << std::endl;
        return 1;
    }

    const std::string file_name(argv[1]);
    const char* content = nullptr;
    int content_length = 0;

    readBinaryFile(file_name, content, content_length);


    // Define a Module
    cModule.defineModule(
        MODULE_CLASS_GENERIC,
        "file_sender",
        "FSDR",
        "0.0.1",
        Json_de::array()  // WAITING FOR NO MESSAGES
    );

    // Add Hardware Verification Info to be verified by server. [OPTIONAL]
    cModule.setHardware("123456", ENUM_HARDWARE_TYPE::HARDWARE_TYPE_CPU);
    cModule.init("0.0.0.0",60000, "0.0.0.0", 50000);
    

    while (!exit_me)
    {
       std::cout << "WAITING  " << std::endl;
       std::this_thread::sleep_for(std::chrono::seconds(5));
       std::cout << "Sending Image: length: " << content_length << std::endl;
        
       cModule.sendBMSG("", content, content_length, TYPE_AndruavMessage_IMG, false, Json_de());
       

    }

    // Use the content and content_length as needed

    return 0;
}