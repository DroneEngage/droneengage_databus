
#include "./helpers/colors.hpp"
#include "./uavos/uavos_module.hpp"



using namespace uavos;
using namespace uavos::comm;
bool exit_me = false;

CMODULE cModule;


int main (int argc, char *argv[])
{

    std::cout << _INFO_CONSOLE_TEXT << "HELLO " << _NORMAL_CONSOLE_TEXT_ << std::endl;

    cModule.defineModule(
        MODULE_CLASS_FCB,
        "Module ID",
        "Module Key",
        "Module Version"
    );
    cModule.addModuleFeatures("T");
    cModule.addModuleFeatures("R");
    cModule.setHardware("123456", ENUM_HARDWARE_TYPE::HARDWARE_TYPE_CPU);
    
    cModule.init("127.0.0.1",60000,"127.0.0.1",60003);
    const Json jsonID = cModule.createJSONID(true);

    std::cout << _INFO_CONSOLE_TEXT << "JSON" << jsonID.dump() << _NORMAL_CONSOLE_TEXT_ << std::endl;


    while (!exit_me)
    {
       std::this_thread::sleep_for(std::chrono::seconds(1));
       
    }

}