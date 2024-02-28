#ifndef UAVOS_MODULE_H
#define UAVOS_MODULE_H


#include <ctime>
#include <iostream>

#include "../helpers/json.hpp"
#include "udpClient.hpp"
#include "messages.hpp"
using Json = nlohmann::json;

typedef enum {
    HARDWARE_TYPE_UNDEFINED     = 0,
    HARDWARE_TYPE_CPU           = 1
} ENUM_HARDWARE_TYPE;


#define MODULE_FEATURE_RECEIVING_TELEMETRY      "R"
#define MODULE_FEATURE_SENDING_TELEMETRY        "T"

#define MODULE_CLASS_FCB        "fcb"
#define MODULE_CLASS_VIDEO      "camera"
#define MODULE_CLASS_GENERIC    "gen"


typedef void (*SEND_SYSMSG_CALLBACK)(const Json&, const int& );

/**
 * @brief sends JSON packet
 * 
 * @param targetPartyID 
 * @param jmsg 
 * @param andruav_message_id 
 * @param internal_message if true @link INTERMODULE_MODULE_KEY @endlink equaqls to Module key
 */
typedef void (*SEND_JMSG_CALLBACK)(const std::string& targetPartyID, const Json&, const int&, const bool& );

typedef void (*SEND_BMSG_CALLBACK)(const std::string& targetPartyID, const char *, const int bmsg_length, const int& , const bool&, const Json& );
typedef void (*SEND_MREMSG_CALLBACK)(const int& );

namespace uavos
{

namespace comm
{
    class CMODULE : public CCallBack_UDPClient
    {
        public:

            static CMODULE& getInstance()
            {
                static CMODULE instance;

                return instance;
            }

            CMODULE(CMODULE const&)               = delete;
            void operator=(CMODULE const&)        = delete;

        private:

            CMODULE(): cUDPClient(this)
            {
                m_instance_time_stamp = std::time(nullptr);
                m_hardware_serial = "";
                m_hardware_serial_type = HARDWARE_TYPE_UNDEFINED;

            }
        
        public:

            void defineModule (
                 std::string module_class,
                 std::string module_id,
                 std::string module_key,
                 std::string module_version,
                 Json message_filter
            );
            
            bool init (const std::string targetIP, int broadcatsPort, const std::string host, int listenningPort);
            bool uninit () {};
            



        public:

                void onReceive (const char *, int len);

        public:


            Json createJSONID (bool reSend) const;


            /**
             * @brief Set the m_party_id & m_group_id
             * 
             * @param party_id 
             * @param group_id 
             */
            void setPartyID (const std::string& party_id, const std::string& group_id){};
            

            /**
             * @details register callback function to send system message using it.
             * 
             * @param sendBMSG of type @link SEND_SYSMSG_CALLBACK @endlink 
             */
            void registerSendSYSMSG (SEND_SYSMSG_CALLBACK sendBMSG){};

            /**
             * @details register callback function to send message using it.
             * 
             * @param sendJMSG of type @link SEND_JMSG_CALLBACK @endlink 
             */
            void registerSendJMSG (SEND_JMSG_CALLBACK sendJMSG){};

            /**
             * @details register callback function to send message using it.
             * 
             * @param sendBMSG of type @link SEND_BMSG_CALLBACK @endlink 
             */
            void registerSendBMSG (SEND_BMSG_CALLBACK sendBMSG){};


            /**
             * @details register call back to send InterModule remote execute message.
             * 
             * @param sendMREMSG of type @link SEND_MREMSG_CALLBACK @endlink 
             */
            void registerSendMREMSG (SEND_MREMSG_CALLBACK sendMREMSG){};
            
            // called from main
            void OnConnectionStatusChangedWithAndruavServer (const int status){};

            /**
             * @brief Get the Module Features object
             *  module features i.e. can transmit, can recieve, needs stream ...etc.
             * in this case we use T & R only. 
             * @return const Json 
             */
             inline const Json getModuleFeatures() const
            {
                return m_module_features;
            }

             inline void addModuleFeatures(const std::string feature)
            {
                m_module_features.push_back(feature);
            }

            
            void setModuleClass(const std::string module_class) 
            {
                m_module_class = module_class;
            }


            void setModuleId(const std::string module_id) 
            {
                m_module_id = module_id;
            }



            const std::string getModuleKey() const
            {
                return m_module_key;
            }

            void setModuleKey(const char* module_key) 
            {
                m_module_key = module_key;
            }


            void setHardware(const std::string hardware_serial, const ENUM_HARDWARE_TYPE hardware_serial_type) 
            {
                m_hardware_serial = hardware_serial;
                m_hardware_serial_type = hardware_serial_type;
            }


        protected:

            /**
            * @brief module features i.e. can transmit, can recieve, needs stream ...etc.
            * in this case we use T & R only.
            */
            Json m_module_features = Json::array();

            /**
             * @brief Identifies the type of the module.
             * Modules of the same identical functions should have the same class
             * For example multiple camera modules should have same MODULE_CLASS_VIDEO.
             * 
             */
            std::string m_module_class;

            /**
             * @brief this id identifies this particular module. This can be 
             * FCB_Main, FCB_Secondary ....etc.
             * or CAM_MOD1, CAM_MOD2 ...etc.
             * 
             */
            std::string m_module_id;

            /**
             * @brief this is a GUID key for this module. the difference between
             * m_module_id & m_module_key is that m_module_key should be unique over
             * the whole system.
             * 
             */
            std::string m_module_key;



            std::string m_hardware_serial;


            ENUM_HARDWARE_TYPE m_hardware_serial_type;


            std::string m_module_version;

            std::time_t m_instance_time_stamp;
    
            CUDPClient cUDPClient; 

            // UAVOS Current m_party_id read from communicator
            std::string  m_party_id;
            // UAVOS Current m_group_id read from communicator
            std::string  m_group_id;
            
            Json m_message_filter;
    };
};
};
#endif
