#include "../helpers/colors.hpp"
#include "uavos_module.hpp"






uavos::comm::CMODULE::CMODULE()
{
    m_instance_time_stamp = std::time(nullptr);
    m_hardware_serial = "";
    m_hardware_serial_type = HARDWARE_TYPE_UNDEFINED;
}

void uavos::comm::CMODULE::defineModule (
                 std::string module_class,
                 std::string module_id,
                 std::string module_key,
                 std::string module_version //,
                //Json message_filter
            ) 
{
    m_module_class = module_class;
    m_module_id = module_id;
    m_module_key = module_key;
    m_module_version = module_version;
    // m_message_filter = message_filter;
    return ;
}


bool uavos::comm::CMODULE::init (const std::string targetIP, int broadcatsPort, const std::string host, int listenningPort)
{
    // UDP Server
    cUDPClient.init(targetIP.c_str(), broadcatsPort, host.c_str() ,listenningPort);
    
    // Json jsonID = createJSONID(true);
    // cUDPClient.setJsonId (jsonID.dump());
    // cUDPClient.setMessageOnReceive (this);
    // cUDPClient.start();
}
            
void uavos::comm::CMODULE::onReceive (const char * message, int len)
{
    static bool bFirstReceived = false;
        
    #ifdef DEBUG        
        std::cout << _INFO_CONSOLE_TEXT << "RX MSG: :len " << std::to_string(len) << ":" << message <<   _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    
    try
    {
        /* code */
        Json jMsg = Json::parse(message);
        const int messageType = jMsg[ANDRUAV_PROTOCOL_MESSAGE_TYPE].get<int>();

        if (std::strcmp(jMsg[INTERMODULE_ROUTING_TYPE].get<std::string>().c_str(),CMD_TYPE_INTERMODULE)==0)
        {
            const Json cmd = jMsg[ANDRUAV_PROTOCOL_MESSAGE_CMD];
            
        
            if (messageType== TYPE_AndruavModule_ID)
            {
                const Json moduleID = cmd ["f"];
                m_party_id = std::string(moduleID[ANDRUAV_PROTOCOL_SENDER].get<std::string>());
                m_group_id = std::string(moduleID[ANDRUAV_PROTOCOL_GROUP_ID].get<std::string>());
                //cFCBMain.setPartyID(m_party_id, m_group_id);
                
                const int status = cmd ["g"].get<int>();
                // if (AndruavServerConnectionStatus != status)
                // {
                //     _onConnectionStatusChanged (status);
                // }
                //AndruavServerConnectionStatus = status;
                if (!bFirstReceived)
                { 
                    // tell server you dont need to send ID again.
                    std::cout << _SUCCESS_CONSOLE_BOLD_TEXT_ << " ** Communicator Server Found" << _SUCCESS_CONSOLE_TEXT_ << ": m_party_id(" << _INFO_CONSOLE_TEXT << m_party_id << _SUCCESS_CONSOLE_TEXT_ << ") m_group_id(" << _INFO_CONSOLE_TEXT << m_group_id << _SUCCESS_CONSOLE_TEXT_ << ")" <<  _NORMAL_CONSOLE_TEXT_ << std::endl;
                    //PLOG(plog::info) << "Communicator Server Found: m_party_id(" << m_party_id << ") m_group_id(" << m_group_id << ")"; 
                    Json jsonID = createJSONID(false);
                    cUDPClient.setJsonId (jsonID.dump());
                    bFirstReceived = true;
                }
                return ;
            }

            
        }

        // /*
        // * Handles SWARM MESSAGE
        // * P2P Message SHOULD BE ENCAPSULATED
        // */
        // if (messageType == TYPE_AndruavMessage_SWARM_MAVLINK)
        //     {
        //         const std::string leader_sender = jMsg[ANDRUAV_PROTOCOL_SENDER].get<std::string>();
        //         uavos::fcb::swarm::CSwarmFollower& swarm_follower = uavos::fcb::swarm::CSwarmFollower::getInstance();
        //         swarm_follower.handle_leader_traffic(leader_sender, message, len);
            
        //         return ;
        //     }
        //cAndruavResalaParser.parseMessage(jMsg, message, len);
    
    }
    catch(const std::exception& e)
    {
        std::cerr << e.what() << '\n';
    }
}

const Json uavos::comm::CMODULE::createJSONID (bool reSend)
{
        Json json_msg;        
        
        json_msg[INTERMODULE_ROUTING_TYPE] =  CMD_TYPE_INTERMODULE;
        json_msg[ANDRUAV_PROTOCOL_MESSAGE_TYPE] =  TYPE_AndruavModule_ID;
        Json ms;
              
        ms[JSON_INTERMODULE_MODULE_ID]              = m_module_id;
        ms[JSON_INTERMODULE_MODULE_CLASS]           = m_module_class;
        ms[JSON_INTERMODULE_MODULE_MESSAGES_LIST]   = m_message_filter;
        ms[JSON_INTERMODULE_MODULE_FEATURES]        = m_module_features;
        ms[JSON_INTERMODULE_MODULE_KEY]             = m_module_key; 
        ms[JSON_INTERMODULE_HARDWARE_ID]            = m_hardware_serial; 
        ms[JSON_INTERMODULE_HARDWARE_TYPE]          = m_hardware_serial_type; 
        ms[JSON_INTERMODULE_VERSION]                = m_module_version;
        ms[JSON_INTERMODULE_RESEND]                 = reSend;
        ms[JSON_INTERMODULE_TIMESTAMP_INSTANCE]     = m_instance_time_stamp;

        json_msg[ANDRUAV_PROTOCOL_MESSAGE_CMD] = ms;
        #ifdef DEBUG
            std::cout << json_msg.dump(4) << std::endl;              
        #endif
        return json_msg;
}