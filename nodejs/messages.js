// InterModules command
const CMD_TYPE_INTERMODULE = "uv";
const CMD_TYPE_SYSTEM_MSG = "s";

// JSON InterModule Fields
const JSON_INTERMODULE_MODULE_ID = "a";
const JSON_INTERMODULE_MODULE_CLASS = "b";
const JSON_INTERMODULE_MODULE_MESSAGES_LIST = "c";
const JSON_INTERMODULE_MODULE_FEATURES = "d";
const JSON_INTERMODULE_MODULE_KEY = "e";
const JSON_INTERMODULE_HARDWARE_ID = "s";
const JSON_INTERMODULE_HARDWARE_TYPE = "t";
const JSON_INTERMODULE_VERSION = "v";
const JSON_INTERMODULE_TIMESTAMP_INSTANCE = "u";
const JSON_INTERMODULE_RESEND = "z";

// Communication Commands
const CMD_COMM_GROUP = "g";
const CMD_COMM_INDIVIDUAL = "i";
const CMD_COMM_SYSTEM = "s";

// Andruav Protocol Fields
const ANDRUAV_PROTOCOL_GROUP_ID = "gr";
const ANDRUAV_PROTOCOL_SENDER = "sd";
const ANDRUAV_PROTOCOL_TARGET_ID = "tg";
const ANDRUAV_PROTOCOL_MESSAGE_TYPE = "mt";
const ANDRUAV_PROTOCOL_MESSAGE_CMD = "ms";
const ANDRUAV_PROTOCOL_MESSAGE_PERMISSION = "p";
const INTERMODULE_ROUTING_TYPE = "ty";
const INTERMODULE_MODULE_KEY = "GU";

// Reserved Target Values
const ANDRUAV_PROTOCOL_SENDER_ALL_GCS = "_GCS_";
const ANDRUAV_PROTOCOL_SENDER_ALL_AGENTS = "_AGN_";
const ANDRUAV_PROTOCOL_SENDER_ALL = "_GD_";
const SPECIAL_NAME_SYS_NAME = "_SYS_";

// SOCKET STATUS
const SOCKET_STATUS_FREASH = 1;
const SOCKET_STATUS_CONNECTING = 2;
const SOCKET_STATUS_DISCONNECTING = 3;
const SOCKET_STATUS_DISCONNECTED = 4;
const SOCKET_STATUS_CONNECTED = 5;
const SOCKET_STATUS_REGISTERED = 6;
const SOCKET_STATUS_UNREGISTERED = 7;
const SOCKET_STATUS_ERROR = 8;

// System Messages
const TYPE_AndruavSystem_LoadTasks = 9001;
const TYPE_AndruavSystem_SaveTasks = 9002;
const TYPE_AndruavSystem_DeleteTasks = 9003;
const TYPE_AndruavSystem_DisableTasks = 9004;
const TYPE_AndruavSystem_Ping = 9005;
const TYPE_AndruavSystem_LogoutCommServer = 9006;
const TYPE_AndruavSystem_ConnectedCommServer = 9007;
const TYPE_AndruavSystem_UdpProxy = 9008;

// Inter Module Commands
const TYPE_AndruavModule_ID = 9100;
const TYPE_AndruavModule_RemoteExecute = 9101;
const TYPE_AndruavModule_Location_Info = 9102;

// Andruav Messages
const TYPE_AndruavMessage_GPS = 1002;
const TYPE_AndruavMessage_POWER = 1003;
const TYPE_AndruavMessage_ID = 1004;
const TYPE_AndruavMessage_RemoteExecute = 1005;
const TYPE_AndruavMessage_IMG = 1006;
const TYPE_AndruavMessage_Error = 1008;
const TYPE_AndruavMessage_FlightControl = 1010;
const TYPE_AndruavMessage_DroneReport = 1020;
const TYPE_AndruavMessage_Signaling = 1021;
const TYPE_AndruavMessage_HomeLocation = 1022;
const TYPE_AndruavMessage_GeoFence = 1023;
const TYPE_AndruavMessage_ExternalGeoFence = 1024;
const TYPE_AndruavMessage_GEOFenceHit = 1025;
const TYPE_AndruavMessage_WayPoints = 1027;
const TYPE_AndruavMessage_GeoFenceAttachStatus = 1029;
const TYPE_AndruavMessage_Arm = 1030;
const TYPE_AndruavMessage_ChangeAltitude = 1031;
const TYPE_AndruavMessage_Land = 1032;
const TYPE_AndruavMessage_GuidedPoint = 1033;
const TYPE_AndruavMessage_CirclePoint = 1034;
const TYPE_AndruavMessage_DoYAW = 1035;
const TYPE_AndruavMessage_NAV_INFO = 1036;
const TYPE_AndruavMessage_DistinationLocation = 1037;
const TYPE_AndruavMessage_ChangeSpeed = 1040;
const TYPE_AndruavMessage_Ctrl_Cameras = 1041;
const TYPE_AndruavMessage_TrackingTarget = 1042;
const TYPE_AndruavMessage_TrackingTargetLocation = 1043;
const TYPE_AndruavMessage_TargetLost = 1044;
const TYPE_AndruavMessage_UploadWayPoints = 1046;
const TYPE_AndruavMessage_RemoteControlSettings = 1047;
const TYPE_AndruavMessage_SET_HOME_LOCATION = 1048;
const TYPE_AndruavMessage_RemoteControl2 = 1052;
const TYPE_AndruavMessage_FollowHim_Request = 1054;
const TYPE_AndruavMessage_FollowMe_Guided = 1055;
const TYPE_AndruavMessage_MAKE_SWARM = 1056;
const TYPE_AndruavMessage_SwarmReport = 1057;
const TYPE_AndruavMessage_UpdateSwarm = 1058;
const TYPE_AndruavMessage_Sync_EventFire = 1061;
const TYPE_AndruavMessage_Prepherials = 1070;
const TYPE_AndruavMessage_UDPProxy_Info = 1071;
const TYPE_AndruavMessage_Unit_Name = 1072;

const TYPE_AndruavMessage_LightTelemetry = 2022;

const TYPE_AndruavMessage_ServoChannel = 6001;

const TYPE_AndruavMessage_ServoOutput = 6501;
const TYPE_AndruavMessage_MAVLINK = 6502;
const TYPE_AndruavMessage_SWARM_MAVLINK = 6503;
const TYPE_AndruavMessage_INTERNAL_MAVLINK = 6504;
const TYPE_AndruavMessage_P2P_ACTION = 6505;
const TYPE_AndruavMessage_P2P_STATUS = 6506;

const TYPE_AndruavMessage_DUMMY = 9999;
const TYPE_AndruavMessage_USER_RANGE_START = 80000;
const TYPE_AndruavMessage_USER_RANGE_END = 90000;

// Error Types
const ERROR_TYPE_LO7ETTA7AKOM = 5;
const ERROR_3DR = 7;
const ERROR_GPS = 10;
const ERROR_POWER = 11;
const ERROR_RCCONTROL = 12;
const ERROR_GEO_FENCE_ERROR = 100;

const ERROR_USER_DEFINED = 1000;

// Notification Types
const NOTIFICATION_TYPE_EMERGENCY = 0;
const NOTIFICATION_TYPE_ALERT = 1;
const NOTIFICATION_TYPE_CRITICAL = 2;
const NOTIFICATION_TYPE_ERROR = 3;
const NOTIFICATION_TYPE_WARNING = 4;
const NOTIFICATION_TYPE_NOTICE = 5;
const NOTIFICATION_TYPE_INFO = 6;
const NOTIFICATION_TYPE_DEBUG = 7;


module.exports = {
    CMD_TYPE_INTERMODULE,
    CMD_TYPE_SYSTEM_MSG,
    JSON_INTERMODULE_MODULE_ID,
    JSON_INTERMODULE_MODULE_CLASS,
    JSON_INTERMODULE_MODULE_MESSAGES_LIST,
    JSON_INTERMODULE_MODULE_FEATURES,
    JSON_INTERMODULE_MODULE_KEY,
    JSON_INTERMODULE_HARDWARE_ID,
    JSON_INTERMODULE_HARDWARE_TYPE,
    JSON_INTERMODULE_VERSION,
    JSON_INTERMODULE_TIMESTAMP_INSTANCE,
    JSON_INTERMODULE_RESEND,
    CMD_COMM_GROUP,
    CMD_COMM_INDIVIDUAL,
    CMD_COMM_SYSTEM,
    ANDRUAV_PROTOCOL_GROUP_ID,
    ANDRUAV_PROTOCOL_SENDER,
    ANDRUAV_PROTOCOL_TARGET_ID,
    ANDRUAV_PROTOCOL_MESSAGE_TYPE,
    ANDRUAV_PROTOCOL_MESSAGE_CMD,
    ANDRUAV_PROTOCOL_MESSAGE_PERMISSION,
    INTERMODULE_ROUTING_TYPE,
    INTERMODULE_MODULE_KEY,
    ANDRUAV_PROTOCOL_SENDER_ALL_GCS,
    ANDRUAV_PROTOCOL_SENDER_ALL_AGENTS,
    ANDRUAV_PROTOCOL_SENDER_ALL,
    SPECIAL_NAME_SYS_NAME,
    SOCKET_STATUS_FREASH,
    SOCKET_STATUS_CONNECTING,
    SOCKET_STATUS_DISCONNECTING,
    SOCKET_STATUS_DISCONNECTED,
    SOCKET_STATUS_CONNECTED,
    SOCKET_STATUS_REGISTERED,
    SOCKET_STATUS_UNREGISTERED,
    SOCKET_STATUS_ERROR,
    TYPE_AndruavSystem_LoadTasks,
    TYPE_AndruavSystem_SaveTasks,
    TYPE_AndruavSystem_DeleteTasks,
    TYPE_AndruavSystem_DisableTasks,
    TYPE_AndruavSystem_Ping,
    TYPE_AndruavSystem_LogoutCommServer,
    TYPE_AndruavSystem_ConnectedCommServer,
    TYPE_AndruavSystem_UdpProxy,
    TYPE_AndruavModule_ID,
    TYPE_AndruavModule_RemoteExecute,
    TYPE_AndruavModule_Location_Info,
    TYPE_AndruavMessage_GPS,
    TYPE_AndruavMessage_POWER,
    TYPE_AndruavMessage_ID,
    TYPE_AndruavMessage_RemoteExecute,
    TYPE_AndruavMessage_IMG,
    TYPE_AndruavMessage_Error,
    TYPE_AndruavMessage_FlightControl,
    TYPE_AndruavMessage_DroneReport,
    TYPE_AndruavMessage_Signaling,
    TYPE_AndruavMessage_HomeLocation,
    TYPE_AndruavMessage_GeoFence,
    TYPE_AndruavMessage_ExternalGeoFence,
    TYPE_AndruavMessage_GEOFenceHit,
    TYPE_AndruavMessage_WayPoints,
    TYPE_AndruavMessage_GeoFenceAttachStatus,
    TYPE_AndruavMessage_Arm,
    TYPE_AndruavMessage_ChangeAltitude,
    TYPE_AndruavMessage_Land,
    TYPE_AndruavMessage_GuidedPoint,
    TYPE_AndruavMessage_CirclePoint,
    TYPE_AndruavMessage_DoYAW,
    TYPE_AndruavMessage_NAV_INFO,
    TYPE_AndruavMessage_DistinationLocation,
    TYPE_AndruavMessage_ChangeSpeed,
    TYPE_AndruavMessage_Ctrl_Cameras,
    TYPE_AndruavMessage_TrackingTarget,
    TYPE_AndruavMessage_TrackingTargetLocation,
    TYPE_AndruavMessage_TargetLost,
    TYPE_AndruavMessage_UploadWayPoints,
    TYPE_AndruavMessage_RemoteControlSettings,
    TYPE_AndruavMessage_SET_HOME_LOCATION,
    TYPE_AndruavMessage_RemoteControl2,
    TYPE_AndruavMessage_FollowHim_Request,
    TYPE_AndruavMessage_FollowMe_Guided,
    TYPE_AndruavMessage_MAKE_SWARM,
    TYPE_AndruavMessage_SwarmReport,
    TYPE_AndruavMessage_UpdateSwarm,
    TYPE_AndruavMessage_Sync_EventFire,
    TYPE_AndruavMessage_Prepherials,
    TYPE_AndruavMessage_UDPProxy_Info,
    TYPE_AndruavMessage_Unit_Name,
    TYPE_AndruavMessage_LightTelemetry,
    TYPE_AndruavMessage_ServoChannel,
    TYPE_AndruavMessage_ServoOutput,
    TYPE_AndruavMessage_MAVLINK,
    TYPE_AndruavMessage_SWARM_MAVLINK,
    TYPE_AndruavMessage_INTERNAL_MAVLINK,
    TYPE_AndruavMessage_P2P_ACTION,
    TYPE_AndruavMessage_P2P_STATUS,
    TYPE_AndruavMessage_USER_RANGE_START,
    TYPE_AndruavMessage_USER_RANGE_END,
    ERROR_TYPE_LO7ETTA7AKOM,
    ERROR_3DR,
    ERROR_GPS,
    ERROR_POWER,
    ERROR_RCCONTROL,
    ERROR_GEO_FENCE_ERROR,
    ERROR_USER_DEFINED,
    NOTIFICATION_TYPE_EMERGENCY,
    NOTIFICATION_TYPE_ALERT,
    NOTIFICATION_TYPE_CRITICAL,
    NOTIFICATION_TYPE_ERROR,
    NOTIFICATION_TYPE_WARNING,
    NOTIFICATION_TYPE_NOTICE,
    NOTIFICATION_TYPE_INFO,
    NOTIFICATION_TYPE_DEBUG,
    TYPE_AndruavMessage_DUMMY
};