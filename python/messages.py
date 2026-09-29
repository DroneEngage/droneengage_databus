# InterModules command
CMD_TYPE_INTERMODULE = "uv"
CMD_TYPE_SYSTEM_MSG = "s"

# JSON InterModule Fields
JSON_INTERMODULE_MODULE_ID = "a"
JSON_INTERMODULE_MODULE_CLASS = "b"
JSON_INTERMODULE_MODULE_MESSAGES_LIST = "c"
JSON_INTERMODULE_MODULE_FEATURES = "d"
JSON_INTERMODULE_MODULE_KEY = "e"
JSON_INTERMODULE_PARTY_RECORD = "f"
JSON_INTERMODULE_SOCKET_STATUS = "g"
JSON_INTERMODULE_HARDWARE_ID = "s"
JSON_INTERMODULE_HARDWARE_TYPE = "t"
JSON_INTERMODULE_VERSION = "v"
JSON_INTERMODULE_TIMESTAMP_INSTANCE = "u"
JSON_INTERMODULE_RESEND = "z"

# assume JSON header is never less than 10. Used to speed up finding binary message.
MIN_JSON_HEADER_LEANGTH = 10

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
WAITING_EVENT = "ew"
FIRE_EVENT = "ef"
LINKED_TO_STEP = "ls"

# Reserved Target Values
ANDRUAV_PROTOCOL_SENDER_ALL_GCS = "_GCS_"
ANDRUAV_PROTOCOL_SENDER_ALL_AGENTS = "_AGN_"
ANDRUAV_PROTOCOL_SENDER_ALL = "_GD_"
ANDRUAV_PROTOCOL_SENDER_COMM_SERVER = "_SYS_"
SPECIAL_NAME_SYS_NAME = ANDRUAV_PROTOCOL_SENDER_COMM_SERVER

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
TYPE_AndruavSystem_UDPProxy = 9008
TYPE_AndruavSystem_UdpProxy = TYPE_AndruavSystem_UDPProxy
TYPE_AndruavSystem_LocalServer = 9009

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
TYPE_AndruavMessage_CameraList = 1012
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
TYPE_AndruavMessage_ConfigCOM = 1038
TYPE_AndruavMessage_ConfigFCB = 1039
TYPE_AndruavMessage_ChangeSpeed = 1040
TYPE_AndruavMessage_Ctrl_Cameras = 1041
TYPE_AndruavMessage_TrackingTarget_ACTION = 1042
TYPE_AndruavMessage_TrackingTarget = TYPE_AndruavMessage_TrackingTarget_ACTION
TYPE_AndruavMessage_TrackingTargetLocation = 1043
TYPE_AndruavMessage_TrackingTarget_STATUS = 1044
TYPE_AndruavMessage_TargetLost = TYPE_AndruavMessage_TrackingTarget_STATUS
TYPE_AndruavMessage_UploadWayPoints = 1046
TYPE_AndruavMessage_RemoteControlSettings = 1047
TYPE_AndruavMessage_SET_HOME_LOCATION = 1048
TYPE_AndruavMessage_CameraZoom = 1049
TYPE_AndruavMessage_CameraSwitch = 1050
TYPE_AndruavMessage_CameraFlash = 1051
TYPE_AndruavMessage_RemoteControl2 = 1052
TYPE_AndruavMessage_SensorsStatus = 1053
TYPE_AndruavMessage_FollowHim_Request = 1054
TYPE_AndruavMessage_FollowMe_Guided             = 1055
TYPE_AndruavMessage_Make_Swarm                  = 1056
TYPE_AndruavMessage_MAKE_SWARM                  = TYPE_AndruavMessage_Make_Swarm
TYPE_AndruavMessage_SwarmReport                 = 1057
TYPE_AndruavMessage_UpdateSwarm                 = 1058
TYPE_AndruavMessage_CommSignalsStatus           = 1059
TYPE_AndruavMessage_Sync_EventFire              = 1061
TYPE_AndruavMessage_SearchTargetList            = 1062
TYPE_AndruavMessage_Prepherials                 = 1070
TYPE_AndruavMessage_UDPProxy_Info               = 1071
TYPE_AndruavMessage_Unit_Name                   = 1072
TYPE_AndruavMessage_Ping_Unit                   = 1073
TYPE_AndruavMessage_Upload_DE_Mission           = 1075
TYPE_AndruavMessage_AI_Recognition_ACTION       = 1076
TYPE_AndruavMessage_AI_Recognition_STATUS       = 1077
TYPE_AndruavMessage_AI_Recognition_TargetLocation = 1078
TYPE_AndruavMessage_Viewlink_ACTION             = 1079
TYPE_AndruavMessage_Viewlink_STATUS             = 1080
TYPE_AndruavMessage_DEPilot_Control             = 1081

TYPE_AndruavMessage_LightTelemetry              = 2022

TYPE_AndruavMessage_ServoChannel                = 6001  # OBSOLETE

TYPE_AndruavMessage_MAVLINK                     = 6502
TYPE_AndruavMessage_SWARM_MAVLINK               = 6503
TYPE_AndruavMessage_INTERNAL_MAVLINK            = 6504
TYPE_AndruavMessage_P2P_ACTION                  = 6505
TYPE_AndruavMessage_P2P_STATUS                  = 6506
TYPE_AndruavMessage_P2P_InRange_BSSID           = 6507
TYPE_AndruavMessage_P2P_InRange_Node            = 6508

TYPE_AndruavMessage_Communication_Line_Set      = 6509
TYPE_AndruavMessage_Communication_Line_Status   = 6510

TYPE_AndruavMessage_SOUND_TEXT_TO_SPEECH        = 6511
TYPE_AndruavMessage_SOUND_PLAY_FILE             = 6512

TYPE_AndruavMessage_SDR_ACTION                  = 6514
TYPE_AndruavMessage_SDR_REMOTE_EXECUTE          = 6515
TYPE_AndruavMessage_SDR_SPECTRUM                = 6516

TYPE_AndruavMessage_P2P_INFO                    = 6517

TYPE_AndruavMessage_Mission_Item_Sequence       = 6518

TYPE_AndruavMessage_GPIO_ACTION                 = 6519
TYPE_AndruavMessage_GPIO_STATUS                 = 6520
TYPE_AndruavMessage_GPIO_REMOTE_EXECUTE         = 6521

TYPE_AndruavMessage_LocalServer_ACTION          = 6522
TYPE_AndruavMessage_LocalServer_STATUS          = 6523
TYPE_AndruavMessage_LocalServer_REMOTE_EXECUTE  = 6524

TYPE_AndruavMessage_CONFIG_ACTION                = 6525
TYPE_AndruavMessage_CONFIG_STATUS                = 6526

TYPE_AndruavMessage_MAVLINK_EVENTS               = 6527

TYPE_AndruavMessage_DUMMY                       = 9999
TYPE_AndruavMessage_USER_RANGE_START            = 80000
TYPE_AndruavMessage_USER_RANGE_END              = 90000

# TYPE_AndruavMessage_CONFIG_ACTION
CONFIG_ACTION_Restart                           = 0
CONFIG_ACTION_APPLY_CONFIG                      = 1
CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE            = 2
CONFIG_REQUEST_FETCH_CONFIG                     = 3
CONFIG_ACTION_SHUT_DOWN_HW                      = 4
CONFIG_ACTION_RESTART_HW                        = 5

# TYPE_AndruavMessage_CONFIG_STATUS
CONFIG_STATUS_FETCH_CONFIG_TEMPLATE             = 0
CONFIG_STATUS_FETCH_CONFIG                      = 1




ERROR_TYPE_LO7ETTA7AKOM                 = 5
ERROR_3DR                               = 7
ERROR_GPS                               = 10
ERROR_POWER                             = 11
ERROR_RCCONTROL                         = 12
ERROR_TYPE_ERROR_MODULE                 = 13
ERROR_TYPE_ERROR_P2P                    = 23
ERROR_TYPE_ERROR_SDR                    = 24
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

NOTIFICATION_TYPE_REGISTRATION          = 22
NOTIFICATION_TYPE_TELEMETRY             = 33
NOTIFICATION_TYPE_PROTOCOL              = 44
NOTIFICATION_TYPE_LO7ETTA7AKOM          = 77
NOTIFICATION_TYPE_GEO_FENCE             = 88

# Precision Landing Message Types
TYPE_AndruavMessage_PRECLAND_ACTION = 6536
TYPE_AndruavMessage_PRECLAND_TARGET = 6537
TYPE_AndruavMessage_PRECLAND_STATUS = 6538

# PRECLAND_ACTION codes
PRECLAND_ACTION_DISABLE = 0
PRECLAND_ACTION_ENABLE = 1
PRECLAND_ACTION_SET_TARGET = 2
PRECLAND_ACTION_SELFTEST = 3
PRECLAND_ACTION_CALIBRATE = 4
PRECLAND_ACTION_CALIBRATE_CANCEL = 5

# PRECLAND_CALIB_STATUS codes
PRECLAND_CALIB_STATUS_IDLE = 0
PRECLAND_CALIB_STATUS_CAPTURING = 1
PRECLAND_CALIB_STATUS_COMPUTING = 2
PRECLAND_CALIB_STATUS_DONE = 3
PRECLAND_CALIB_STATUS_FAILED = 4

# PRECLAND_STATUS codes
PRECLAND_STATUS_DISABLED = 0
PRECLAND_STATUS_SEARCHING = 1
PRECLAND_STATUS_LOCKED = 2
PRECLAND_STATUS_DEGRADED = 3
PRECLAND_STATUS_ERROR = 4

# PRECLAND_REASON codes
PRECLAND_REASON_NOMINAL = 0
PRECLAND_REASON_NO_TARGET = 1
PRECLAND_REASON_STALE = 2
PRECLAND_REASON_MIN_TAGS = 3
PRECLAND_REASON_RMSE = 4
PRECLAND_REASON_ERROR = 5
