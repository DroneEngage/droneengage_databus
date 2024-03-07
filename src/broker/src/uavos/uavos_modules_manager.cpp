
#include <iostream>
#include <fstream>

#include <exception>
#include <typeinfo>
#include <stdexcept>


#include <sys/socket.h> 
#include <arpa/inet.h> 
#include <netinet/in.h> 

#include <plog/Log.h> 
#include "plog/Initializers/RollingFileInitializer.h"

#include "../helpers/colors.hpp"
#include "../helpers/helpers.hpp"


#include "../messages.hpp"
#include "./udpCommunicator.hpp"
#include "../configFile.hpp"
#include "../localConfigFile.hpp"
#include "../comm_server/andruav_unit.hpp"
#include "../comm_server/andruav_comm_server.hpp"
#include "../comm_server/andruav_facade.hpp"
#include "../comm_server/andruav_comm_p2p.hpp"
#include "../comm_server/andruav_auth.hpp"
#include "../uavos/uavos_modules_manager.hpp"






static std::mutex g_i_mutex; 
static std::mutex g_i_mutex_process; 


void uavos::comm::CUavosModulesManager::onReceive (const char * message, int len, struct sockaddr_in *  sock)
{
    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "#####DEBUG:" << message << _NORMAL_CONSOLE_TEXT_ << std::endl;
    
    parseIntermoduleMessage(message, len, sock);

    if (m_OnReceive!= nullptr) m_OnReceive(message, len);
}


bool uavos::comm::CUavosModulesManager::init (const std::string host, int listenningPort)
{
    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG:" << _NORMAL_CONSOLE_TEXT_ << std::endl;

    cUDPClient.init (host.c_str(), listenningPort);

    cUDPClient.start();

    return true;
}


void uavos::comm::CUavosModulesManager::uninit ()
{
    #ifdef DEBUG
	    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: Stop Threads Killed" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    
    cUDPClient.stop();
}

            


void uavos::comm::CUavosModulesManager::defineModule (
                 std::string module_class,
                 std::string module_id,
                 std::string module_key,
                 std::string module_version,
                 std::string party_id,
                 std::string group_id
            ) 
{
    m_module_class = module_class;
    m_module_id = module_id;
    m_module_key = module_key;
    m_module_version = module_version;
    m_party_id = party_id;
    m_group_id = group_id;
    
    return ;
}

/**
 * @brief creates JSON message that identifies Module
 * @details generates JSON message that identifies module
 * 'a': module_id
 * 'b': module_class. fixed "comm"
 * 'c': module_messages. can be updated from config file.
 * 'd': module_features. empty as it is communicator. extra can be added.
 * 'e': module_key. uniqueley identifies this instance and can be set in config file.
 * 'f': ONLY SENT BY UAVOS_COMMUNICATOR which contains partyID & GroupID
 * 'z': resend request flag
 * @param reSend if true then module should reply with module JSONID
 * @return const Json 
 */
Json uavos::comm::CUavosModulesManager::createJSONID (const bool& reSend)
{
    try
    {
    
        
        Json jsonID;        
        
        jsonID[INTERMODULE_ROUTING_TYPE]        =  CMD_TYPE_INTERMODULE;
        jsonID[ANDRUAV_PROTOCOL_MESSAGE_TYPE]   =  TYPE_AndruavModule_ID;
        
        Json ms;
        
        ms[JSON_INTERMODULE_MODULE_ID]              = m_module_id;
        ms[JSON_INTERMODULE_MODULE_CLASS]           = m_module_class;
        ms[JSON_INTERMODULE_MODULE_MESSAGES_LIST]   = ""; // module_messages
        ms[JSON_INTERMODULE_MODULE_FEATURES]        = Json();
        ms[JSON_INTERMODULE_MODULE_KEY]             = m_module_key; 
        ms[JSON_INTERMODULE_PARTY_RECORD]           = 
                    {
                        {"sd", m_party_id},
                        {"gr", m_group_id}
                    };
        
        // this is NEW in communicator and could be ignored by current UAVOS modules.
        ms[JSON_INTERMODULE_SOCKET_STATUS]      = andruav_servers::CAndruavCommServer::getInstance().getStatus();
        ms[JSON_INTERMODULE_RESEND]             = reSend;

        jsonID[ANDRUAV_PROTOCOL_MESSAGE_CMD]    = ms;
        
        return jsonID;
    }
    catch (...)
    {
        //https://stackoverflow.com/questions/315948/c-catching-all-exceptions/24142104
        std::exception_ptr p = std::current_exception();
        std::clog <<(p ? p.__cxa_exception_type()->name() : "null") << std::endl;
        
        PLOG(plog::error)<<(p ? p.__cxa_exception_type()->name() : "null") ; 
        
        return Json();
    }
}


/**
* @brief update UAVOS vehicle feature based on module features.
* ex: "d" : [ "C", "V" ]
* @param module_features 
* 
* @return true if a feature has been updated
* @return false if features are the samme
*/
bool uavos::comm::CUavosModulesManager::updateUavosPermission (const Json& module_features)
{
    CAndruavUnitMe& andruav_unit_me = CAndruavUnitMe::getInstance();
    bool updated = false;
    //const int&  len = module_features.size();
    for (const auto feature : module_features)
    {
        const std::string& feature_item = feature.get<std::string>(); //module_features[i].get<std::string>();
        ANDRUAV_UNIT_INFO& andruav_unit_info = andruav_unit_me.getUnitInfo();
        if (feature_item.compare("T") ==0)
        {
            if (andruav_unit_info.permission[4]=='T') break;
            andruav_unit_info.permission[4] = 'T';
            updated = true;
        }
        else if (feature_item.compare("R") ==0)
        {
            if (andruav_unit_info.permission[6]=='R') break;
            andruav_unit_info.permission[6] = 'R';
            updated = true;
        }
        else if (feature_item.compare("V") ==0)
        {
            if (andruav_unit_info.permission[8]=='V') break;
            andruav_unit_info.permission[8] = 'V';
            updated = true;
        }
        else if (feature_item.compare("C") ==0)
        {
            if (andruav_unit_info.permission[10]=='C') break;
            andruav_unit_info.permission[10] = 'C';
            updated = true;
        }
        
    }

    return updated;
}



/**
* @details Camera module should send a complete list of camera devices.
* Any missing camera is one disappeared most likely the module restarted 
* and generated new camera device ids
* 
* @param module_id 
*/
void uavos::comm::CUavosModulesManager::cleanOrphanCameraEntries (const std::string& module_id, const uint64_t& time_now)
{
    auto camera_module = m_camera_list.find(module_id);
    if (camera_module == m_camera_list.end()) return ;

    std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>> *camera_entry_list= camera_module->second.get();

    std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>>::iterator camera_entry_itrator;
    std::vector <std::string> orphan_list;
    for (camera_entry_itrator = camera_entry_list->begin(); camera_entry_itrator != camera_entry_list->end(); camera_entry_itrator++)
    {   
            const MODULE_CAMERA_ENTRY * camera_entry= camera_entry_itrator->second.get();

            if (camera_entry->module_last_access_time < time_now)
            {
                // old and should be removed
                orphan_list.push_back (camera_entry->global_index);
            }
    }


    //TODO: NOT TESTED
    // remove orphans 
    for(auto const& value: orphan_list) {
        camera_entry_list->erase(value);
    }
    
}


/**
* @brief Update camera list.
* Adding available camera devices exists in different camera modules.
* 
* @details Update camera list.
* Adding available camera devices exists in different camera modules.
* RX MSG: {
*    "ms" : {
*        "a" : "HorusEye1",
*        "b" : "camera",
*        "c" : [ 1005, 1041, 1021 ],
*        "d" : [ "C", "V" ],
*        "e" : "E289FEE7-FDAD-44EF-A257-C9A36DDD6BE7",
*        "m" : [
*            {
*                "active" : 0,
*                "id" : "G59d8d78965966a1a449b44b1",
*                "ln" : "Droidcam#0",
*                "p" : 2,
*                "r" : false,
*                "v" : true
*            },
*            {
*                "active" : 0,
*                "id" : "G207ac06d13bf7f2756f2fc51",
*                "ln" : "Dummy video device (0x0000)#1",
*                "p" : 2,
*                "r" : false,
*                "v" : true
*            },
*            {
*                "active" : 0,
*                "id" : "G69058c165ac352104cef76d9",
*                "ln" : "Dummy video device (0x0001)#2",
*                "p" : 2,
*                "r" : false,
*                "v" : true
*            },
*            {
*                "active" : 0,
*                "id" : "G65a44b9276d1e51e59658bc",
*                "ln" : "Dummy video device (0x0002)#3",
*                "p" : 2,
*                "r" : false,
*                "v" : true
*            }
*            ],
*        "z" : false
*        },
*    "mt" : 9100,
*    "ty" : "uv"
* }
* @param msg_cmd 
*/
void uavos::comm::CUavosModulesManager::updateCameraList(const std::string& module_id, const Json& msg_cmd)
{

    #ifdef DEBUG
        std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: updateCameraList " << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif

    // Check if Module "Camera_ModuleName" is listed.
    auto camera_module = m_camera_list.find(module_id);
    if (camera_module == m_camera_list.end()) 
    {
        // Module Not found in camera list
        #ifdef DEBUG
            std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: updateCameraList // Module Not found in camera list" << _NORMAL_CONSOLE_TEXT_ << std::endl;
        #endif

        std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>> *pcamera_entries = new std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>>();
        m_camera_list.insert(std::make_pair(module_id, std::unique_ptr<std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>>>(pcamera_entries)));
    }


    // Retrieve list of camera entries of this module.
    camera_module = m_camera_list.find(module_id);

    std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>> *camera_entry_list= camera_module->second.get();

    // List of camera devices in a camera module recieved by intermodule message.
    const uint64_t now_time = get_time_usec();
    
    // Check if camera list is available
    if (msg_cmd.contains("m"))
    {

    Json camera_array = msg_cmd["m"];

    // iterate over camera devices in recieved json message.
    const int messages_length = camera_array.size(); 
    for (int i=0; i< messages_length; ++i)
    {
        
        Json jcamera_entry = camera_array[i];
        // camera device id
        const std::string& camera_entry_id = jcamera_entry["id"].get<std::string>();
        
        
        auto camera_entry_record = camera_entry_list->find(camera_entry_id);
        if (camera_entry_record == camera_entry_list->end()) 
        {
            // camera entry not listed in cameras list of submodule
            MODULE_CAMERA_ENTRY * camera_entry = new MODULE_CAMERA_ENTRY();
            camera_entry->module_id  = module_id;
            camera_entry->global_index = camera_entry_id;
            camera_entry->logical_name = jcamera_entry["ln"].get<std::string>();
            camera_entry->is_recording = jcamera_entry["r"].get<bool>();
            camera_entry->is_camera_avail = jcamera_entry["v"].get<bool>();
            camera_entry->is_camera_streaming = jcamera_entry["active"].get<int>();
            camera_entry->camera_type = jcamera_entry["p"].get<int>();
            
            camera_entry->module_last_access_time = now_time;
            camera_entry->updates = true;
            camera_entry_list->insert(std::make_pair(camera_entry_id, std::unique_ptr<MODULE_CAMERA_ENTRY> (camera_entry) ));
        
        }
        else
        {
            //camera listed
            
            MODULE_CAMERA_ENTRY * camera_entry = camera_entry_record->second.get();
            camera_entry->module_id  = module_id;
            camera_entry->global_index = camera_entry_id;
            camera_entry->logical_name = jcamera_entry["ln"].get<std::string>();
            camera_entry->is_recording = jcamera_entry["r"].get<bool>();
            camera_entry->is_camera_avail = jcamera_entry["v"].get<bool>();
            camera_entry->is_camera_streaming = jcamera_entry["active"].get<int>();
            camera_entry->camera_type = jcamera_entry["p"].get<int>();
            
            camera_entry->module_last_access_time = now_time;
            camera_entry->updates = true;

        }
    }
    }

    cleanOrphanCameraEntries(module_id, now_time);
}


Json uavos::comm::CUavosModulesManager::getCameraList()
{
    Json camera_list = Json::array();

    MODULE_CAMERA_LIST::iterator camera_module;
    for (camera_module = m_camera_list.begin(); camera_module != m_camera_list.end(); camera_module++)
    {   
        std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>> * camera_entry_list = camera_module->second.get();
        
        std::map <std::string, std::unique_ptr<MODULE_CAMERA_ENTRY>>::iterator camera_entry_itrator;

        for (camera_entry_itrator = camera_entry_list->begin(); camera_entry_itrator != camera_entry_list->end(); camera_entry_itrator++)
        {   
            const MODULE_CAMERA_ENTRY * camera_entry= camera_entry_itrator->second.get();
    
            
            
            Json json_camera_entry =
            {
                // check uavos_camera_plugin
                {"v", camera_entry->is_camera_avail},
                {"ln", camera_entry->logical_name},
                {"id", camera_entry->global_index},
                {"active", camera_entry->is_camera_streaming},
                {"r", camera_entry->is_recording},
                {"p", camera_entry->camera_type}

            };
            camera_list.push_back(json_camera_entry);
        }
    }

    return camera_list;

}


bool uavos::comm::CUavosModulesManager::updateModuleSubscribedMessages (const std::string& module_id, const Json& message_array)
{
    bool new_module = false;

    const int messages_length = message_array.size(); 
    for (int i=0; i< messages_length; ++i)
    {
        /**
        * @brief 
        * select list of a given message id.
        * * &v should be by reference to avoid making fresh copy.
        */
        std::vector<std::string> &v = m_module_messages[message_array[i].get<int>()];
        if (std::find(v.begin(), v.end(), module_id) == v.end())
        {
            /**
            * @brief 
            * add module in the callback list.
            * when this message is received from andruav-server it should be 
            * forwarded to this list.
            */
            v.push_back(module_id);
            new_module = true;
        }
    }

    return new_module;
}


/**
 * @brief  Communicate with @link andruav_servers::CAndruavAuthenticator @endlink to validate hardware status
 * 
 * @param module_item 
 */
void uavos::comm::CUavosModulesManager::checkLicenseStatus (MODULE_ITEM_TYPE * module_item)
{
    andruav_servers::CAndruavAuthenticator &auth = andruav_servers::CAndruavAuthenticator::getInstance();

    if (auth.isAuthenticationOK())
    {
        if (auth.doValidateHardware(module_item->hardware_serial, module_item->hardware_type))
        {
            std::cout << std::endl << _LOG_CONSOLE_TEXT_BOLD_ << "Module License " << _SUCCESS_CONSOLE_TEXT_ << "OK " <<  _SUCCESS_CONSOLE_BOLD_TEXT_ << module_item->module_id << _NORMAL_CONSOLE_TEXT_ << std::endl;
            PLOG(plog::info)<< "Module License OK: " << module_item->module_id ;

            module_item->licence_status = ENUM_LICENCE::LICENSE_VERIFIED_OK;
        }
        else
        {
            std::cout << std::endl << _LOG_CONSOLE_TEXT_BOLD_ << "Module License " << _ERROR_CONSOLE_BOLD_TEXT_ <<  "INVALID " << module_item->module_id<< _NORMAL_CONSOLE_TEXT_ << std::endl;
            PLOG(plog::error)<< "Module License Invalid: " << module_item->module_id ;

            module_item->licence_status = ENUM_LICENCE::LICENSE_VERIFIED_BAD;
            andruav_servers::CAndruavFacade::getInstance().API_sendErrorMessage(std::string(), 0, ERROR_TYPE_ERROR_MODULE, NOTIFICATION_TYPE_ALERT, std::string("Module " + module_item->module_id + " is not allowed to run."));
        }
    }
    else
    {
        PLOG(plog::warning)<< "Module License " << module_item->module_id << " could not been verified";
        
        module_item->licence_status = ENUM_LICENCE::LICENSE_NOT_VERIFIED;
    }
}

/**
* @brief handle TYPE_AndruavModule_ID messages.
* Add/Update module definitions.
* @param msg_cmd 
* @param ssock 
* 
* @return true module has been added.
* @return false no new modules.
*/
bool uavos::comm::CUavosModulesManager::handleModuleRegistration (const Json& msg_cmd, const struct sockaddr_in* ssock)
{

    // #ifdef DEBUG
    //     std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: handleModuleRegistration " << _NORMAL_CONSOLE_TEXT_ << std::endl;
    // #endif
    const std::lock_guard<std::mutex> lock(g_i_mutex);

    bool updated = false;

    const uint64_t &now = get_time_usec();
            
    // array of message IDs
    
    MODULE_ITEM_TYPE * module_item;
    const std::string& module_id = std::string(msg_cmd[JSON_INTERMODULE_MODULE_ID].get<std::string>()); 
    /**
    * @brief insert module in @param m_modules_list
    * this is the main list of modules.
    */
    
        
    auto module_entry = m_modules_list.find(module_id);
    if (module_entry == m_modules_list.end()) 
    {
        // New Module not registered in m_modules_list

        module_item = new MODULE_ITEM_TYPE();
        module_item->module_key         = msg_cmd[JSON_INTERMODULE_MODULE_KEY].get<std::string>();
        module_item->module_id          = module_id;
        module_item->module_class       = msg_cmd[JSON_INTERMODULE_MODULE_CLASS].get<std::string>(); // fcb, video, ...etc.
        module_item->modules_features   = msg_cmd[JSON_INTERMODULE_MODULE_FEATURES];
        if (msg_cmd.contains(JSON_INTERMODULE_TIMESTAMP_INSTANCE))
        {   
            module_item->time_stamp         = msg_cmd[JSON_INTERMODULE_TIMESTAMP_INSTANCE].get<std::time_t>();
        }
        if (msg_cmd.contains(JSON_INTERMODULE_HARDWARE_ID))
        {
            module_item->hardware_serial    = msg_cmd[JSON_INTERMODULE_HARDWARE_ID];
            module_item->hardware_type      = msg_cmd[JSON_INTERMODULE_HARDWARE_TYPE].get<int>();
            
            checkLicenseStatus(module_item);
        }
        else
        {
            module_item->licence_status = ENUM_LICENCE::LICENSE_NO_DATA;
        }

        if (msg_cmd.contains(JSON_INTERMODULE_VERSION))
        {
            module_item->version = msg_cmd[JSON_INTERMODULE_VERSION].get<std::string>();;
        }
        else
        {
            module_item->version = std::string("na");
        }

        struct sockaddr_in * module_address = new (struct sockaddr_in)();  
        memcpy(module_address, ssock, sizeof(struct sockaddr_in)); 
                
        module_item->m_module_address = std::unique_ptr<struct sockaddr_in>(module_address);
                
        m_modules_list.insert(std::make_pair(module_item->module_id, std::unique_ptr<MODULE_ITEM_TYPE>(module_item)));
        
        PLOG(plog::info)<<"Module Adding: " << module_item->module_id ; 
        
    }
    else
    {
        module_item = module_entry->second.get();
        module_item->is_dead = false;
                
        // Update Module Info

        if ((msg_cmd.contains(JSON_INTERMODULE_TIMESTAMP_INSTANCE)) && (module_item->time_stamp != msg_cmd[JSON_INTERMODULE_TIMESTAMP_INSTANCE].get<std::time_t>()))
        {
            // module restarted
            
            if (msg_cmd.contains(JSON_INTERMODULE_VERSION))
            {
                module_item->version = msg_cmd[JSON_INTERMODULE_VERSION].get<std::string>();;
            }
            else
            {
                module_item->version = std::string("na");
            }

            //MODULE HAS BEEN RESTARTED
            module_item->time_stamp = msg_cmd[JSON_INTERMODULE_TIMESTAMP_INSTANCE].get<std::time_t>();
            andruav_servers::CAndruavFacade::getInstance().API_sendErrorMessage(std::string(), 0, ERROR_TYPE_ERROR_MODULE, NOTIFICATION_TYPE_ALERT, std::string("Module " + module_item->module_id + " has been restarted."));
        
            PLOG(plog::warning)<<"Module has been restarted: " << module_item->module_id ;
        }
        
        if (module_item->licence_status == ENUM_LICENCE::LICENSE_NOT_VERIFIED)
        {  // module has not been tested last time maybe because Auth was not ready
            checkLicenseStatus(module_item);
        }
    }

    module_item->module_last_access_time = now;

            
    // insert message callback
    
    const Json& message_array = msg_cmd[JSON_INTERMODULE_MODULE_MESSAGES_LIST]; 
    updated |= updateModuleSubscribedMessages(module_id, message_array);

    const std::string module_class = module_item->module_class; //msg_cmd[JSON_INTERMODULE_MODULE_CLASS].get<std::string>(); 
    if (module_class.find("camera")==0)
    {
        // update camera list
        updateCameraList(module_id, msg_cmd);
        m_status.is_camera_module_connected (true);
    }
    else if (module_class.find("fcb")==0)
    {
        CAndruavUnitMe& andruav_unit_me = CAndruavUnitMe::getInstance();
        ANDRUAV_UNIT_INFO& andruav_unit_info = andruav_unit_me.getUnitInfo();
        andruav_unit_info.use_fcb = true;
        m_status.is_fcb_module_connected (true); 
    } 

    updated |= updateUavosPermission(module_item->modules_features); //msg_cmd["d"]);

    // reply with identification if required by module
    if (validateField(msg_cmd, "z", Json::value_t::boolean))
    {
        if (msg_cmd["z"].get<bool>() == true)
        {
            const Json &msg = createJSONID(false);
            std::string msg_dump = msg.dump();    
            forwardMessageToModule(msg_dump.c_str(), msg_dump.length() ,module_item);
        }
    }

    return updated;
}


void saveBinaryToFile(const char* binary_message, size_t binary_length, const std::string& file_path)
{
    std::ofstream file(file_path, std::ios::binary | std::ios::trunc);
    if (file.is_open())
    {
        file.write(binary_message, binary_length);
        file.close();
        std::cout << "Binary content saved to file: " << file_path << std::endl;
    }
    else
    {
        std::cout << "Failed to open the file: " << file_path << std::endl;
    }
}

/**
 * @brief 
 * Process messages recieved from module and may forward to Andruav ommunication server.
 * @details 
 * @param full_message 
 * @param full_message_length 
 * @param ssock sender module ip & port
 */
void uavos::comm::CUavosModulesManager::parseIntermoduleMessage (const char * full_message, const std::size_t full_message_length, const struct sockaddr_in* ssock)
{

    if (full_message_length > 10000)
    {
        std::cout << "Large Message " << std::endl;
    }

    Json jsonMessage;
    try
    {
        jsonMessage = Json::parse(full_message);
    }
    catch (...)
    {
        // corrupted message.
        #ifdef DEBUG
            std::cout<< _ERROR_CONSOLE_BOLD_TEXT_ << "CORRUPTED" << _NORMAL_CONSOLE_TEXT_ << std::endl;
        #endif
        return ;
    }

    const bool is_binary =  !(full_message[full_message_length-1]==125 || (full_message[full_message_length-2]==125));
    
    #ifdef DEBUG
    #ifdef DEBUG_MSG        
        std::cout<< jsonMessage[ANDRUAV_PROTOCOL_MESSAGE_TYPE] << std::endl;
    #endif
    #endif

    if ((!validateField(jsonMessage, INTERMODULE_ROUTING_TYPE, Json::value_t::string))
        || (!validateField(jsonMessage, ANDRUAV_PROTOCOL_MESSAGE_TYPE, Json::value_t::number_unsigned))
        )
    {
        // bad message format
        return ;
    }
    
    std::string target_id = std::string();
    std::string msg_routing_type = jsonMessage[INTERMODULE_ROUTING_TYPE].get<std::string>();
    
    const bool is_system = (msg_routing_type.find(CMD_COMM_SYSTEM) != std::string::npos);
    
    if ((msg_routing_type.find(CMD_COMM_GROUP) == std::string::npos)
        && (!is_system)
        && jsonMessage.contains(ANDRUAV_PROTOCOL_TARGET_ID)
        )
    {   //CMD_COMM_GROUP  does not exist and a single target id is mentioned.
        target_id =jsonMessage[ANDRUAV_PROTOCOL_TARGET_ID].get<std::string>();
    }

    // Intermodule Message
    const bool intermodule_msg = (jsonMessage[INTERMODULE_ROUTING_TYPE].get<std::string>().find(CMD_TYPE_INTERMODULE) != std::string::npos);

    const int mt = jsonMessage[ANDRUAV_PROTOCOL_MESSAGE_TYPE].get<int>();
    const Json ms = jsonMessage[ANDRUAV_PROTOCOL_MESSAGE_CMD];

    /*
        The logic below is as follows:

        case .... MSG ....:
            regardless of the value of [intermodule_msg] of these messages, these messages are captured by 
            case statements and handled in a way predefined my communicator module.


        The default section uses the concept of [intermodule_msg] where messages are not forwarded to server
        if it is marked intermodule_msg=true as it should be processed by other modules only.
        
        the other default section forwards the message normally to andruav communication server.
    */            
    switch (mt)
    {
        case TYPE_AndruavModule_ID:
        {
            const bool updated = handleModuleRegistration (ms, ssock);
            
            if (updated == true)
            {
                andruav_servers::CAndruavFacade::getInstance().API_sendID(target_id);
            }
            
        }
        break;

        case TYPE_AndruavModule_RemoteExecute:
        {   // this is an inter-module message.
            processModuleRemoteExecute(ms);
        }
        break;

        case TYPE_AndruavModule_Location_Info:
        {
            /*
              This is an inter-module message to make communicator-module aware of vehicle location.
              This message can be sent from any module who owns any information about location and motion.
            */
            
            CAndruavUnitMe& m_andruavMe = CAndruavUnitMe::getInstance();
            ANDRUAV_UNIT_LOCATION&  location_info = m_andruavMe.getUnitLocationInfo();

            location_info.latitude                      = ms["la"].get<int>();
            location_info.longitude                     = ms["ln"].get<int>();
            location_info.altitude                      = ms["a"].get<int>();
            location_info.altitude_relative             = ms["r"].get<int>();
            location_info.h_acc                         = ms["ha"].get<int>();
            location_info.yaw                           = ms["y"].get<int>();
            location_info.last_access_time              = get_time_usec();
            location_info.is_new                        = true;
            location_info.is_valid                      = true;
        }
        break;
        
        case TYPE_AndruavMessage_ID:
        {
            /*
                This message is always internal message sent to communicator-module CM.
                CM updates fields of the original TYPE_AndruavMessage_ID and 
                forwards a complete copy to Andruav-Server.
            */
            CAndruavUnitMe& m_andruavMe = CAndruavUnitMe::getInstance();
            ANDRUAV_UNIT_INFO&  unit_info = m_andruavMe.getUnitInfo();
            
            unit_info.vehicle_type                  = ms["VT"].get<int>();
            unit_info.flying_mode                   = ms["FM"].get<int>();
            unit_info.gps_mode                      = ms["GM"].get<int>();
            unit_info.use_fcb                       = ms["FI"].get<bool>();
            unit_info.autopilot                     = ms["AP"].get<int>();
            unit_info.is_armed                      = ms["AR"].get<bool>();
            unit_info.is_flying                     = ms["FL"].get<bool>();
            unit_info.telemetry_protocol            = ms["TP"].get<int>();
            unit_info.flying_last_start_time        = ms["z"].get<long long>();
            unit_info.flying_total_duration         = ms["a"].get<long long>();
            unit_info.is_tracking_mode              = ms["b"].get<bool>();
            unit_info.manual_TX_blocked_mode        = ms["C"].get<int>();
            unit_info.is_gcs_blocked                = ms["B"].get<bool>();
            unit_info.swarm_follower_formation      = ms["n"].get<int>();
            unit_info.swarm_leader_formation        = ms["o"].get<int>();
            unit_info.swarm_leader_I_am_following   = ms["q"].get<std::string>();

            andruav_servers::CAndruavFacade::getInstance().API_sendID(std::string());
        }
        break;

        case TYPE_AndruavMessage_IMG:
        { 
            if (!intermodule_msg)
            {
                const char * binary_message = (char *)(memchr (full_message, 0x0, full_message_length))+1;
                int binary_length = binary_message==0?0:(full_message_length - (binary_message - full_message +1))-1;
                saveBinaryToFile (binary_message, binary_length, "img.jpg");
                andruav_servers::CAndruavCommServer::getInstance().API_sendBinaryCMD(target_id, mt, &binary_message[1], binary_length, Json());   

                break;
            }
            
            CAndruavUnitMe& m_andruavMe = CAndruavUnitMe::getInstance();
            ANDRUAV_UNIT_LOCATION&  location_info = m_andruavMe.getUnitLocationInfo();

            if (location_info.is_valid)
            {
                // Generate message part ANDRUAV_PROTOCOL_MESSAGE_CMD
                Json msg_cmd = jsonMessage[ANDRUAV_PROTOCOL_MESSAGE_CMD];
                msg_cmd["prv"] = std::string ("gps");
                msg_cmd["lat"] = location_info.latitude;
                msg_cmd["lng"] = location_info.longitude;
                msg_cmd["alt"] = location_info.altitude;
                msg_cmd["tim"] = get_time_usec();
                
                // binary_message is the image if exists.
                const char * binary_message = (char *)(memchr (full_message, 0x0, full_message_length));
                int binary_length = binary_message==0?0:(full_message_length - (binary_message - full_message +1));
                
                andruav_servers::CAndruavCommServer::getInstance().API_sendBinaryCMD(target_id, mt, binary_message, binary_length, msg_cmd); 

                // binary_message_new.release();
            }
        }
        break;


        case TYPE_AndruavMessage_P2P_ACTION:
        {
            /*
                here the internal command contains [int_prty] is the party
                that I should send to it myown mac.
            */
                
                Json msg_cmd = jsonMessage[ANDRUAV_PROTOCOL_MESSAGE_CMD];
                std::cout << _INFO_CONSOLE_TEXT << "P2P ###:" << msg_cmd <<  _NORMAL_CONSOLE_TEXT_ << std::endl;
	
                switch (msg_cmd["a"].get<int>())
                {
                    case P2P_ACTION_CONNECT_TO_MAC:
                        if (validateField(msg_cmd,"int_prty", Json::value_t::string))
                        {
                            andruav_servers::CAndruavFacade::getInstance().API_P2P_connectToMeshOnMyMac(
                                    msg_cmd["int_prty"]
                                ); 
                            
                        }
                    break;
                }
                
        }
        break;


        case TYPE_AndruavMessage_SWARM_MAVLINK:
        {
            uavos::andruav_servers::CP2P& cP2P = uavos::andruav_servers::CP2P::getInstance();
            
            // Search for char '0' and then the binary message is the bytes after it.
            const char* binary_message = std::find(full_message, full_message + full_message_length, '\0');
            std::size_t binary_length = binary_message == (full_message + full_message_length) ? 0 : (full_message + full_message_length) - (binary_message + 1);
            // Create a vector to store the binary data
            std::vector<char> binary_data(binary_message + 1, binary_message + 1 + binary_length);


            //bool res = cP2P.processForwardSwarmMessage(target_id, binary_data.data(), binary_data.size());
            bool res = cP2P.processForwardSwarmMessage(target_id, full_message, full_message_length);
            if (!res)
            {
                // forward the messages normally through the server.
                andruav_servers::CAndruavCommServer& andruavCommServer = andruav_servers::CAndruavCommServer::getInstance();
                andruavCommServer.sendMessageToCommunicationServer (full_message, full_message_length, is_system, is_binary, target_id, mt, ms);
            }
            
        }
        break;


        default:
        {
            
            if (jsonMessage.contains(INTERMODULE_MODULE_KEY)!=false) // backward compatibility
            {
                processIncommingServerMessage (target_id, mt, full_message, full_message_length, jsonMessage[INTERMODULE_MODULE_KEY].get<std::string>());
            }

            if (intermodule_msg)
            {   //CMD_TYPE_INTERMODULE exists then this message should be processed by other modules only. 
                
                /**
                    Note that these processing has already done by processIncommingServerMessage() so all
                    we need to do is to exit when intermodule_msg=true.
                */

                // Do not send it to server from here.
                return ;
            }


            andruav_servers::CAndruavCommServer& andruavCommServer = andruav_servers::CAndruavCommServer::getInstance();
            andruavCommServer.sendMessageToCommunicationServer (full_message, full_message_length, is_system, is_binary, target_id, mt, ms);
        }
        break;
    }
    
}

/**
 * @brief process requests from module to comm module.
 * 
 * @param ms 
 */
void uavos::comm::CUavosModulesManager::processModuleRemoteExecute (const Json ms)
{
    if (!validateField(ms, "C", Json::value_t::number_unsigned)) return ;
    const int cmd = ms["C"].get<int>();
    
    switch (cmd)
    {
        case TYPE_AndruavSystem_LoadTasks:
        {
            andruav_servers::CAndruavFacade::getInstance().API_loadTasksByScope(andruav_servers::ENUM_TASK_SCOPE::SCOPE_GROUP, TYPE_AndruavMessage_ExternalGeoFence);
            andruav_servers::CAndruavFacade::getInstance().API_loadTasksByScope(andruav_servers::ENUM_TASK_SCOPE::SCOPE_GROUP, TYPE_AndruavMessage_UploadWayPoints);
        }
        break;
    }
   
}


/**
 * @brief Process messages comming from Communcation Server or other modules and forward it to subscribed modules.
 * 
 * @param sender_party_id 
 * @param command_type 
 * @param jsonMessage 
 * @param sender_module_key when message is forwarded from another module then it is necessary not to send message back to the sender module. e.g. messages such as TYPE_AndruavMessage_RemoteExecute
 */
void uavos::comm::CUavosModulesManager::processIncommingServerMessage (const std::string& sender_party_id, const int& message_type, const char * message, const std::size_t datalength, const std::string& sender_module_key)
{
    const std::lock_guard<std::mutex> lock(g_i_mutex_process);
    #ifdef DEBUG
    #ifdef DEBUG_MSG        
        std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: processIncommingServerMessage " << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    #endif

    std::vector<std::string> &v = m_module_messages[message_type];
    for(std::vector<std::string>::iterator it = v.begin(); it != v.end(); ++it) 
    {
        #ifdef DEBUG
        #ifdef DEBUG_MSG        
        std::cout << *it << std::endl;
        #endif
        #endif
        
        auto uavos_module = m_modules_list.find(*it);
        if (uavos_module == m_modules_list.end()) 
        {
            // no module is registered for this message.
            std::cout << _ERROR_CONSOLE_BOLD_TEXT_ << "Module " << *it  << " for message " << message_type << " is not available" << _NORMAL_CONSOLE_TEXT_ << std::endl;
            
            continue;
        }
        else
        {
            
            MODULE_ITEM_TYPE * module_item = uavos_module->second.get();        
            if  (module_item->licence_status == LICENSE_VERIFIED_BAD)
            {
                andruav_servers::CAndruavFacade::getInstance().API_sendErrorMessage(std::string(), 0, ERROR_TYPE_ERROR_MODULE, NOTIFICATION_TYPE_ALERT, std::string("Module " + module_item->module_id + " is not allowed to run."));
                break;
            } else if ((module_item->is_dead == false) && ((sender_module_key.empty()) || (module_item->module_key.find(sender_module_key)==std::string::npos)))
            {
                // clear to send
                forwardMessageToModule (message, datalength, module_item);
            }
        }
    }

    return ;
}


/**
 * @brief forward a message from Communication Server inter-module to a module.
 * Normally this module is subscribed in this message id.
 * 
 * @param jsonMessage 
 * @param module_item 
 */
void uavos::comm::CUavosModulesManager::forwardMessageToModule ( const char * message, const std::size_t datalength, const MODULE_ITEM_TYPE * module_item)
{
    #ifdef DEBUG
    #ifdef DEBUG_MSG        
        std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: forwardMessageToModule: " << message << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    #endif
    
    //const Json &msg = createJSONID(false);
    struct sockaddr_in module_address = *module_item->m_module_address.get();  
                
    cUDPClient.SendMsg(message, datalength, &module_address);

    return ;
}

/**
* @brief Check m_modules_list for dead modules that recieved no data.
* *Note: that restarted modules have the same ID not the same Key.... 
* * so restarted modules does overwrite old instances..
* 
* @return true found new dead modules.... already dead modules are not counted.
* @return false no dead modules.
*/
bool uavos::comm::CUavosModulesManager::handleDeadModules ()
{
    
    const std::lock_guard<std::mutex> lock(g_i_mutex);
    
    bool dead_found = false;

    const uint64_t &now = get_time_usec();
    
    MODULE_ITEM_LIST::iterator it;
    
    for (it = m_modules_list.begin(); it != m_modules_list.end(); it++)
    {
        MODULE_ITEM_TYPE * module_item = it->second.get();
        const uint64_t diff =  (now - module_item->module_last_access_time);

        if (diff > MODULE_TIME_OUT)
        {
            
            if (!module_item->is_dead)
            {
                //TODO Event Module Warning
                module_item->is_dead = true;
                dead_found = true;
                if (m_status.is_online())
                {
                    std::string log_msg = std::string("Module " + module_item->module_id + " is not responding.");
                    andruav_servers::CAndruavFacade::getInstance().API_sendErrorMessage(std::string(), 0, ERROR_TYPE_ERROR_MODULE, NOTIFICATION_TYPE_EMERGENCY, log_msg);
                    PLOG(plog::error)<< log_msg ;
                }

                if (module_item->module_class.find("fcb")==0)
                {
                    CAndruavUnitMe& andruav_unit_me = CAndruavUnitMe::getInstance();
                    ANDRUAV_UNIT_INFO& andruav_unit_info = andruav_unit_me.getUnitInfo();
                    andruav_unit_info.use_fcb = false;
                    m_status.is_fcb_module_connected (false); //TODO: fix when offline
                }
                else if (module_item->module_class.find("camera")==0)
                {
                    m_status.is_camera_module_connected (false); //TODO: fix when offline
                }
            }
        }
        else
        {
            if (module_item->is_dead)
            {
                //This should not happen as is_dead = false is done when receiving any message from a module. 
                //because you dont want running consequence operation on a dead module.
                module_item->is_dead = false;
                if (m_status.is_online())
                {
                    std::string log_msg = std::string("Module " + module_item->module_id + " is back online.");
                    andruav_servers::CAndruavFacade::getInstance().API_sendErrorMessage(std::string(), 0, ERROR_TYPE_ERROR_MODULE, NOTIFICATION_TYPE_NOTICE, log_msg);
                    PLOG(plog::warning) << log_msg ;
                }
            }
            
        }

    }
    
    return dead_found;
}

/**
 * @brief Called from @link CAndruavCommServer @endlink when connection status is updated.
 * @details all modules should be notified with status to take approbriate actions.
 * 
 * @param status 
 */
void uavos::comm::CUavosModulesManager::handleOnAndruavServerConnection (const int status)
{
    #ifdef DEBUG
    #ifdef DEBUG_MSG        
        std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: handleOnAndruavServerConnection " << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    #endif

    const std::lock_guard<std::mutex> lock(g_i_mutex);
    
    MODULE_ITEM_LIST::iterator it;
    const Json &msg = createJSONID(false);
    std::string msg_dump = msg.dump();    
    
    
    for (it = m_modules_list.begin(); it != m_modules_list.end(); it++)
    {
        MODULE_ITEM_TYPE * module_item = it->second.get();

        forwardMessageToModule(msg_dump.c_str(), msg_dump.length(),module_item);
    }
}


Json uavos::comm::CUavosModulesManager::getModuleListAsJSON ()
{
    Json modules = Json::array();
    
    const std::lock_guard<std::mutex> lock(g_i_mutex);
    
    MODULE_ITEM_LIST::iterator it;
    
    
    for (it = m_modules_list.begin(); it != m_modules_list.end(); it++)
    {
        MODULE_ITEM_TYPE * module_item = it->second.get();

        Json json_module_entry =
        {
            // check uavos_camera_plugin
            {"v", module_item->version},
            {"i", module_item->module_id},
            {"c", module_item->module_class},
            {"t", module_item->time_stamp},
            {"d", module_item->is_dead},
        };
        modules.push_back(json_module_entry);
    }

    return modules;
}