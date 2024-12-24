# InterModules command
CMD_TYPE_INTERMODULE = "uv"
CMD_TYPE_SYSTEM_MSG = "s"

# JSON InterModule Fields
JSON_INTERMODULE_MODULE_ID = "a"
JSON_INTERMODULE_MODULE_CLASS = "b"
JSON_INTERMODULE_MODULE_MESSAGES_LIST = "c"
JSON_INTERMODULE_MODULE_FEATURES = "d"
JSON_INTERMODULE_MODULE_KEY = "e"
JSON_INTERMODULE_HARDWARE_ID = "s"
JSON_INTERMODULE_HARDWARE_TYPE = "t"
JSON_INTERMODULE_VERSION = "v"
JSON_INTERMODULE_TIMESTAMP_INSTANCE = "u"
JSON_INTERMODULE_RESEND = "z"

# Communication Commands
CMD_COMM_GROUP = "g"
CMD_COMM_INDIVIDUAL = "i"
CMD_COMM_SYSTEM = "s"

# Andruav Protocol Fields
ANDRUAV_PROTOCOL_GROUP_ID = "gr"
ANDRUAV_PROTOCOL_SENDER = "sd"
ANDRUAV_PROTOCOL_TARGET_ID = "tg"
ANDRUAV_PROTOCOL_MESSAGE_TYPE = "mt"
ANDRUAV_PROTOCOL_MESSAGE_CMD = "ms"
ANDRUAV_PROTOCOL_MESSAGE_PERMISSION = "p"
INTERMODULE_ROUTING_TYPE = "ty"
INTERMODULE_MODULE_KEY = "GU"

# Reserved Target Values
ANDRUAV_PROTOCOL_SENDER_ALL_GCS = "_GCS_"
ANDRUAV_PROTOCOL_SENDER_ALL_AGENTS = "_AGN_"
ANDRUAV_PROTOCOL_SENDER_ALL = "_GD_"
SPECIAL_NAME_SYS_NAME = "_SYS_"

# SOCKET STATUS
SOCKET_STATUS_FREASH = 1
SOCKET_STATUS_CONNECTING = 2
SOCKET_STATUS_DISCONNECTING = 3
SOCKET_STATUS_DISCONNECTED = 4
SOCKET_STATUS_CONNECTED = 5
SOCKET_STATUS_REGISTERED = 6
SOCKET_STATUS_UNREGISTERED = 7
SOCKET_STATUS_ERROR = 8

# System Messages
TYPE_AndruavSystem_LoadTasks = 9001
TYPE_AndruavSystem_SaveTasks = 9002
TYPE_AndruavSystem_DeleteTasks = 9003
TYPE_AndruavSystem_DisableTasks = 9004
TYPE_AndruavSystem_Ping = 9005
TYPE_AndruavSystem_LogoutCommServer = 9006
TYPE_AndruavSystem_ConnectedCommServer = 9007
TYPE_AndruavSystem_UdpProxy = 9008

# Inter Module Commands
TYPE_AndruavModule_ID = 9100
TYPE_AndruavModule_RemoteExecute = 9101
TYPE_AndruavModule_Location_Info = 9102

# Andruav Messages
TYPE_AndruavMessage_GPS = 1002
TYPE_AndruavMessage_POWER = 1003
TYPE_AndruavMessage_ID = 1004
TYPE_AndruavMessage_RemoteExecute = 1005
TYPE_AndruavMessage_IMG = 1006
TYPE_AndruavMessage_Error = 1008
TYPE_AndruavMessage_FlightControl = 1010
TYPE_AndruavMessage_DroneReport = 1020
TYPE_AndruavMessage_Signaling = 1021
TYPE_AndruavMessage_HomeLocation = 1022
TYPE_AndruavMessage_GeoFence = 1023
TYPE_AndruavMessage_ExternalGeoFence = 1024
TYPE_AndruavMessage_GEOFenceHit = 1025
TYPE_AndruavMessage_WayPoints = 1027
TYPE_AndruavMessage_GeoFenceAttachStatus = 1029
TYPE_AndruavMessage_Arm = 1030
TYPE_AndruavMessage_ChangeAltitude = 1031
TYPE_AndruavMessage_Land = 1032
TYPE_AndruavMessage_GuidedPoint = 1033
TYPE_AndruavMessage_CirclePoint = 1034
TYPE_AndruavMessage_DoYAW = 1035
TYPE_AndruavMessage_NAV_INFO = 1036
TYPE_AndruavMessage_DistinationLocation = 1037
TYPE_AndruavMessage_ChangeSpeed = 1040
TYPE_AndruavMessage_Ctrl_Cameras = 1041
TYPE_AndruavMessage_TrackingTarget = 1042
TYPE_AndruavMessage_TrackingTargetLocation = 1043
TYPE_AndruavMessage_TargetLost = 1044
TYPE_AndruavMessage_UploadWayPoints = 1046
TYPE_AndruavMessage_RemoteControlSettings = 1047
TYPE_AndruavMessage_SET_HOME_LOCATION = 1048
TYPE_AndruavMessage_RemoteControl2 = 1052
TYPE_AndruavMessage_FollowHim_Request = 1054
TYPE_AndruavMessage_FollowMe_Guided             = 1055
TYPE_AndruavMessage_MAKE_SWARM                  = 1056
TYPE_AndruavMessage_SwarmReport                 = 1057
TYPE_AndruavMessage_UpdateSwarm                 = 1058
TYPE_AndruavMessage_Sync_EventFire              = 1061
TYPE_AndruavMessage_Prepherials                 = 1070
TYPE_AndruavMessage_UDPProxy_Info               = 1071
TYPE_AndruavMessage_Unit_Name                   = 1072

TYPE_AndruavMessage_LightTelemetry              = 2022

TYPE_AndruavMessage_ServoChannel                = 6001

TYPE_AndruavMessage_ServoOutput                 = 6501
TYPE_AndruavMessage_MAVLINK                     = 6502
TYPE_AndruavMessage_SWARM_MAVLINK               = 6503
TYPE_AndruavMessage_INTERNAL_MAVLINK            = 6504
TYPE_AndruavMessage_P2P_ACTION                  = 6505
TYPE_AndruavMessage_P2P_STATUS                  = 6506


TYPE_AndruavMessage_DUMMY                       = 9999
TYPE_AndruavMessage_USER_RANGE_START            = 80000
TYPE_AndruavMessage_USER_RANGE_END              = 90000





ERROR_TYPE_LO7ETTA7AKOM                 = 5
ERROR_3DR                               = 7
ERROR_GPS                               = 10
ERROR_POWER                             = 11
ERROR_RCCONTROL                         = 12
ERROR_GEO_FENCE_ERROR                   = 100

ERROR_USER_DEFINED                      = 1000

NOTIFICATION_TYPE_EMERGENCY             = 0
NOTIFICATION_TYPE_ALERT                 = 1
NOTIFICATION_TYPE_CRITICAL              = 2
NOTIFICATION_TYPE_ERROR                 = 3
NOTIFICATION_TYPE_WARNING               = 4
NOTIFICATION_TYPE_NOTICE                = 5
NOTIFICATION_TYPE_INFO                  = 6
NOTIFICATION_TYPE_DEBUG                 = 7

TYPE_AndruavMessage_DUMMY               = 9999