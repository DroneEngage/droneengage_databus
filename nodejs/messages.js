// InterModules command
const CMD_TYPE_INTERMODULE = "uv";
const CMD_TYPE_SYSTEM_MSG = "s";

// JSON InterModule Fields
const JSON_INTERMODULE_MODULE_ID = "a";
const JSON_INTERMODULE_MODULE_CLASS = "b";
const JSON_INTERMODULE_MODULE_MESSAGES_LIST = "c";
const JSON_INTERMODULE_MODULE_FEATURES = "d";
const JSON_INTERMODULE_MODULE_KEY = "e";
const JSON_INTERMODULE_PARTY_RECORD = "f";
const JSON_INTERMODULE_SOCKET_STATUS = "g";
const JSON_INTERMODULE_HARDWARE_ID = "s";
const JSON_INTERMODULE_HARDWARE_TYPE = "t";
const JSON_INTERMODULE_VERSION = "v";
const JSON_INTERMODULE_TIMESTAMP_INSTANCE = "u";
const JSON_INTERMODULE_RESEND = "z";

// assume JSON header is never less than 10. Used to speed up finding binary message.
const MIN_JSON_HEADER_LEANGTH = 10;

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
const WAITING_EVENT = "ew";
const FIRE_EVENT = "ef";
const LINKED_TO_STEP = "ls";

// Reserved Target Values
const ANDRUAV_PROTOCOL_SENDER_ALL_GCS = "_GCS_";
const ANDRUAV_PROTOCOL_SENDER_ALL_AGENTS = "_AGN_";
const ANDRUAV_PROTOCOL_SENDER_ALL = "_GD_";
const ANDRUAV_PROTOCOL_SENDER_COMM_SERVER = "_SYS_";
const SPECIAL_NAME_SYS_NAME = ANDRUAV_PROTOCOL_SENDER_COMM_SERVER;

// SOCKET STATUS
const SOCKET_STATUS_FREASH = 1;
const SOCKET_STATUS_CONNECTING = 2;
const SOCKET_STATUS_DISCONNECTING = 3;
const SOCKET_STATUS_DISCONNECTED = 4;
const SOCKET_STATUS_CONNECTED = 5;
const SOCKET_STATUS_REGISTERED = 6;
const SOCKET_STATUS_UNREGISTERED = 7;
const SOCKET_STATUS_ERROR = 8;

// Module Features
const MODULE_FEATURE_RECEIVING_TELEMETRY = "R";
const MODULE_FEATURE_SENDING_TELEMETRY = "T";
const MODULE_FEATURE_CAPTURE_IMAGE = "C";
const MODULE_FEATURE_CAPTURE_VIDEO = "V";
const MODULE_FEATURE_GPIO = "G";
const MODULE_FEATURE_AI_RECOGNITION = "A";
const MODULE_FEATURE_TRACKING = "K";
const MODULE_FEATURE_P2P = "P";

// Module Classes
const MODULE_CLASS_COMM = "comm";
const MODULE_CLASS_FCB = "fcb";
const MODULE_CLASS_VIDEO = "camera";
const MODULE_CLASS_P2P = "p2p";
const MODULE_CLASS_GENERIC = "gen";
const MODULE_CLASS_GPIO = "gpio";
const MODULE_CLASS_A_RECOGNITION = "ai_rec";
const MODULE_CLASS_TRACKING = "trk";
const MODULE_CLASS_VIEWLINK = "vlk";

// System Messages
const TYPE_AndruavSystem_LoadTasks = 9001;
const TYPE_AndruavSystem_SaveTasks = 9002;
const TYPE_AndruavSystem_DeleteTasks = 9003;
const TYPE_AndruavSystem_DisableTasks = 9004;
const TYPE_AndruavSystem_Ping = 9005;
const TYPE_AndruavSystem_LogoutCommServer = 9006;
const TYPE_AndruavSystem_ConnectedCommServer = 9007;
const TYPE_AndruavSystem_UDPProxy = 9008;
const TYPE_AndruavSystem_UdpProxy = TYPE_AndruavSystem_UDPProxy;
const TYPE_AndruavSystem_LocalServer = 9009;

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
const TYPE_AndruavMessage_CameraList = 1012;
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
const TYPE_AndruavMessage_ConfigCOM = 1038;
const TYPE_AndruavMessage_ConfigFCB = 1039;
const TYPE_AndruavMessage_ChangeSpeed = 1040;
const TYPE_AndruavMessage_Ctrl_Cameras = 1041;
const TYPE_AndruavMessage_TrackingTarget_ACTION = 1042;
const TYPE_AndruavMessage_TrackingTarget = TYPE_AndruavMessage_TrackingTarget_ACTION;
const TYPE_AndruavMessage_TrackingTargetLocation = 1043;
const TYPE_AndruavMessage_TrackingTarget_STATUS = 1044;
const TYPE_AndruavMessage_TargetLost = TYPE_AndruavMessage_TrackingTarget_STATUS;
const TYPE_AndruavMessage_UploadWayPoints = 1046;
const TYPE_AndruavMessage_RemoteControlSettings = 1047;
const TYPE_AndruavMessage_SET_HOME_LOCATION = 1048;
const TYPE_AndruavMessage_CameraZoom = 1049;
const TYPE_AndruavMessage_CameraSwitch = 1050;
const TYPE_AndruavMessage_CameraFlash = 1051;
const TYPE_AndruavMessage_RemoteControl2 = 1052;
const TYPE_AndruavMessage_SensorsStatus = 1053;
const TYPE_AndruavMessage_FollowHim_Request = 1054;
const TYPE_AndruavMessage_FollowMe_Guided = 1055;
const TYPE_AndruavMessage_Make_Swarm = 1056;
const TYPE_AndruavMessage_MAKE_SWARM = TYPE_AndruavMessage_Make_Swarm;
const TYPE_AndruavMessage_SwarmReport = 1057;
const TYPE_AndruavMessage_UpdateSwarm = 1058;
const TYPE_AndruavMessage_CommSignalsStatus = 1059;
const TYPE_AndruavMessage_Sync_EventFire = 1061;
const TYPE_AndruavMessage_SearchTargetList = 1062;
const TYPE_AndruavMessage_Prepherials = 1070;
const TYPE_AndruavMessage_UDPProxy_Info = 1071;
const TYPE_AndruavMessage_Unit_Name = 1072;
const TYPE_AndruavMessage_Ping_Unit = 1073;
const TYPE_AndruavMessage_Upload_DE_Mission = 1075;
const TYPE_AndruavMessage_AI_Recognition_ACTION = 1076;
const TYPE_AndruavMessage_AI_Recognition_STATUS = 1077;
const TYPE_AndruavMessage_AI_Recognition_TargetLocation = 1078;
const TYPE_AndruavMessage_Viewlink_ACTION = 1079;
const TYPE_AndruavMessage_Viewlink_STATUS = 1080;
const TYPE_AndruavMessage_DEPilot_Control = 1081;

const TYPE_AndruavMessage_LightTelemetry = 2022;

const TYPE_AndruavMessage_ServoChannel = 6001;  // OBSOLETE

const TYPE_AndruavMessage_MAVLINK = 6502;
const TYPE_AndruavMessage_SWARM_MAVLINK = 6503;
const TYPE_AndruavMessage_INTERNAL_MAVLINK = 6504;
const TYPE_AndruavMessage_P2P_ACTION = 6505;
const TYPE_AndruavMessage_P2P_STATUS = 6506;
const TYPE_AndruavMessage_P2P_InRange_BSSID = 6507;
const TYPE_AndruavMessage_P2P_InRange_Node = 6508;

const TYPE_AndruavMessage_Communication_Line_Set = 6509;
const TYPE_AndruavMessage_Communication_Line_Status = 6510;

const TYPE_AndruavMessage_SOUND_TEXT_TO_SPEECH = 6511;
const TYPE_AndruavMessage_SOUND_PLAY_FILE = 6512;

const TYPE_AndruavMessage_SDR_ACTION = 6514;
const TYPE_AndruavMessage_SDR_REMOTE_EXECUTE = 6515;
const TYPE_AndruavMessage_SDR_SPECTRUM = 6516;

const TYPE_AndruavMessage_P2P_INFO = 6517;

const TYPE_AndruavMessage_Mission_Item_Sequence = 6518;

const TYPE_AndruavMessage_GPIO_ACTION = 6519;
const TYPE_AndruavMessage_GPIO_STATUS = 6520;
const TYPE_AndruavMessage_GPIO_REMOTE_EXECUTE = 6521;

const TYPE_AndruavMessage_LocalServer_ACTION = 6522;
const TYPE_AndruavMessage_LocalServer_STATUS = 6523;
const TYPE_AndruavMessage_LocalServer_REMOTE_EXECUTE = 6524;

const TYPE_AndruavMessage_CONFIG_ACTION = 6525;
const TYPE_AndruavMessage_CONFIG_STATUS = 6526;

const TYPE_AndruavMessage_MAVLINK_EVENTS = 6527;

const TYPE_AndruavMessage_DUMMY = 9999;
const TYPE_AndruavMessage_USER_RANGE_START = 80000;
const TYPE_AndruavMessage_USER_RANGE_END = 90000;

// TYPE_AndruavMessage_CONFIG_ACTION
const CONFIG_ACTION_Restart = 0;
const CONFIG_ACTION_APPLY_CONFIG = 1;
const CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE = 2;
const CONFIG_REQUEST_FETCH_CONFIG = 3;
const CONFIG_ACTION_SHUT_DOWN_HW = 4;
const CONFIG_ACTION_RESTART_HW = 5;
// Backward-compat alias
const CONFIG_ACTION_SHUT_DOWN = CONFIG_ACTION_SHUT_DOWN_HW;

// TYPE_AndruavMessage_CONFIG_STATUS
const CONFIG_STATUS_FETCH_CONFIG_TEMPLATE = 0;
const CONFIG_STATUS_FETCH_CONFIG = 1;

// Error Types
const ERROR_TYPE_LO7ETTA7AKOM = 5;
const ERROR_3DR = 7;
const ERROR_GPS = 10;
const ERROR_POWER = 11;
const ERROR_RCCONTROL = 12;
const ERROR_TYPE_ERROR_MODULE = 13;
const ERROR_TYPE_ERROR_P2P = 23;
const ERROR_TYPE_ERROR_SDR = 24;
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

const NOTIFICATION_TYPE_REGISTRATION = 22;
const NOTIFICATION_TYPE_TELEMETRY = 33;
const NOTIFICATION_TYPE_PROTOCOL = 44;
const NOTIFICATION_TYPE_LO7ETTA7AKOM = 77;
const NOTIFICATION_TYPE_GEO_FENCE = 88;

// Precision Landing Message Types
const TYPE_AndruavMessage_PRECLAND_ACTION = 6536;
const TYPE_AndruavMessage_PRECLAND_TARGET = 6537;
const TYPE_AndruavMessage_PRECLAND_STATUS = 6538;

// PRECLAND_ACTION codes
const PRECLAND_ACTION_DISABLE = 0;
const PRECLAND_ACTION_ENABLE = 1;
const PRECLAND_ACTION_SET_TARGET = 2;
const PRECLAND_ACTION_SELFTEST = 3;
const PRECLAND_ACTION_CALIBRATE = 4;
const PRECLAND_ACTION_CALIBRATE_CANCEL = 5;

// PRECLAND_CALIB_STATUS codes
const PRECLAND_CALIB_STATUS_IDLE = 0;
const PRECLAND_CALIB_STATUS_CAPTURING = 1;
const PRECLAND_CALIB_STATUS_COMPUTING = 2;
const PRECLAND_CALIB_STATUS_DONE = 3;
const PRECLAND_CALIB_STATUS_FAILED = 4;

// PRECLAND_STATUS codes
const PRECLAND_STATUS_DISABLED = 0;
const PRECLAND_STATUS_SEARCHING = 1;
const PRECLAND_STATUS_LOCKED = 2;
const PRECLAND_STATUS_DEGRADED = 3;
const PRECLAND_STATUS_ERROR = 4;

// PRECLAND_REASON codes
const PRECLAND_REASON_NOMINAL = 0;
const PRECLAND_REASON_NO_TARGET = 1;
const PRECLAND_REASON_STALE = 2;
const PRECLAND_REASON_MIN_TAGS = 3;
const PRECLAND_REASON_RMSE = 4;
const PRECLAND_REASON_ERROR = 5;


module.exports = {
    CMD_TYPE_INTERMODULE,
    CMD_TYPE_SYSTEM_MSG,
    JSON_INTERMODULE_MODULE_ID,
    JSON_INTERMODULE_MODULE_CLASS,
    JSON_INTERMODULE_MODULE_MESSAGES_LIST,
    JSON_INTERMODULE_MODULE_FEATURES,
    JSON_INTERMODULE_MODULE_KEY,
    JSON_INTERMODULE_PARTY_RECORD,
    JSON_INTERMODULE_SOCKET_STATUS,
    JSON_INTERMODULE_HARDWARE_ID,
    JSON_INTERMODULE_HARDWARE_TYPE,
    JSON_INTERMODULE_VERSION,
    JSON_INTERMODULE_TIMESTAMP_INSTANCE,
    JSON_INTERMODULE_RESEND,
    MIN_JSON_HEADER_LEANGTH,
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
    WAITING_EVENT,
    FIRE_EVENT,
    LINKED_TO_STEP,
    ANDRUAV_PROTOCOL_SENDER_ALL_GCS,
    ANDRUAV_PROTOCOL_SENDER_ALL_AGENTS,
    ANDRUAV_PROTOCOL_SENDER_ALL,
    ANDRUAV_PROTOCOL_SENDER_COMM_SERVER,
    SPECIAL_NAME_SYS_NAME,
    SOCKET_STATUS_FREASH,
    SOCKET_STATUS_CONNECTING,
    SOCKET_STATUS_DISCONNECTING,
    SOCKET_STATUS_DISCONNECTED,
    SOCKET_STATUS_CONNECTED,
    SOCKET_STATUS_REGISTERED,
    SOCKET_STATUS_UNREGISTERED,
    SOCKET_STATUS_ERROR,
    MODULE_FEATURE_RECEIVING_TELEMETRY,
    MODULE_FEATURE_SENDING_TELEMETRY,
    MODULE_FEATURE_CAPTURE_IMAGE,
    MODULE_FEATURE_CAPTURE_VIDEO,
    MODULE_FEATURE_GPIO,
    MODULE_FEATURE_AI_RECOGNITION,
    MODULE_FEATURE_TRACKING,
    MODULE_FEATURE_P2P,
    MODULE_CLASS_COMM,
    MODULE_CLASS_FCB,
    MODULE_CLASS_VIDEO,
    MODULE_CLASS_P2P,
    MODULE_CLASS_GENERIC,
    MODULE_CLASS_GPIO,
    MODULE_CLASS_A_RECOGNITION,
    MODULE_CLASS_TRACKING,
    MODULE_CLASS_VIEWLINK,
    TYPE_AndruavSystem_LoadTasks,
    TYPE_AndruavSystem_SaveTasks,
    TYPE_AndruavSystem_DeleteTasks,
    TYPE_AndruavSystem_DisableTasks,
    TYPE_AndruavSystem_Ping,
    TYPE_AndruavSystem_LogoutCommServer,
    TYPE_AndruavSystem_ConnectedCommServer,
    TYPE_AndruavSystem_UDPProxy,
    TYPE_AndruavSystem_UdpProxy,
    TYPE_AndruavSystem_LocalServer,
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
    TYPE_AndruavMessage_CameraList,
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
    TYPE_AndruavMessage_ConfigCOM,
    TYPE_AndruavMessage_ConfigFCB,
    TYPE_AndruavMessage_ChangeSpeed,
    TYPE_AndruavMessage_Ctrl_Cameras,
    TYPE_AndruavMessage_TrackingTarget_ACTION,
    TYPE_AndruavMessage_TrackingTarget,
    TYPE_AndruavMessage_TrackingTargetLocation,
    TYPE_AndruavMessage_TrackingTarget_STATUS,
    TYPE_AndruavMessage_TargetLost,
    TYPE_AndruavMessage_UploadWayPoints,
    TYPE_AndruavMessage_RemoteControlSettings,
    TYPE_AndruavMessage_SET_HOME_LOCATION,
    TYPE_AndruavMessage_CameraZoom,
    TYPE_AndruavMessage_CameraSwitch,
    TYPE_AndruavMessage_CameraFlash,
    TYPE_AndruavMessage_RemoteControl2,
    TYPE_AndruavMessage_SensorsStatus,
    TYPE_AndruavMessage_FollowHim_Request,
    TYPE_AndruavMessage_FollowMe_Guided,
    TYPE_AndruavMessage_Make_Swarm,
    TYPE_AndruavMessage_MAKE_SWARM,
    TYPE_AndruavMessage_SwarmReport,
    TYPE_AndruavMessage_UpdateSwarm,
    TYPE_AndruavMessage_CommSignalsStatus,
    TYPE_AndruavMessage_Sync_EventFire,
    TYPE_AndruavMessage_SearchTargetList,
    TYPE_AndruavMessage_Prepherials,
    TYPE_AndruavMessage_UDPProxy_Info,
    TYPE_AndruavMessage_Unit_Name,
    TYPE_AndruavMessage_Ping_Unit,
    TYPE_AndruavMessage_Upload_DE_Mission,
    TYPE_AndruavMessage_AI_Recognition_ACTION,
    TYPE_AndruavMessage_AI_Recognition_STATUS,
    TYPE_AndruavMessage_AI_Recognition_TargetLocation,
    TYPE_AndruavMessage_Viewlink_ACTION,
    TYPE_AndruavMessage_Viewlink_STATUS,
    TYPE_AndruavMessage_DEPilot_Control,
    TYPE_AndruavMessage_LightTelemetry,
    TYPE_AndruavMessage_ServoChannel,
    TYPE_AndruavMessage_MAVLINK,
    TYPE_AndruavMessage_SWARM_MAVLINK,
    TYPE_AndruavMessage_INTERNAL_MAVLINK,
    TYPE_AndruavMessage_P2P_ACTION,
    TYPE_AndruavMessage_P2P_STATUS,
    TYPE_AndruavMessage_P2P_InRange_BSSID,
    TYPE_AndruavMessage_P2P_InRange_Node,
    TYPE_AndruavMessage_Communication_Line_Set,
    TYPE_AndruavMessage_Communication_Line_Status,
    TYPE_AndruavMessage_SOUND_TEXT_TO_SPEECH,
    TYPE_AndruavMessage_SOUND_PLAY_FILE,
    TYPE_AndruavMessage_SDR_ACTION,
    TYPE_AndruavMessage_SDR_REMOTE_EXECUTE,
    TYPE_AndruavMessage_SDR_SPECTRUM,
    TYPE_AndruavMessage_P2P_INFO,
    TYPE_AndruavMessage_Mission_Item_Sequence,
    TYPE_AndruavMessage_GPIO_ACTION,
    TYPE_AndruavMessage_GPIO_STATUS,
    TYPE_AndruavMessage_GPIO_REMOTE_EXECUTE,
    TYPE_AndruavMessage_LocalServer_ACTION,
    TYPE_AndruavMessage_LocalServer_STATUS,
    TYPE_AndruavMessage_LocalServer_REMOTE_EXECUTE,
    TYPE_AndruavMessage_CONFIG_ACTION,
    TYPE_AndruavMessage_CONFIG_STATUS,
    TYPE_AndruavMessage_MAVLINK_EVENTS,
    TYPE_AndruavMessage_DUMMY,
    TYPE_AndruavMessage_USER_RANGE_START,
    TYPE_AndruavMessage_USER_RANGE_END,
    CONFIG_ACTION_Restart,
    CONFIG_ACTION_APPLY_CONFIG,
    CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE,
    CONFIG_REQUEST_FETCH_CONFIG,
    CONFIG_ACTION_SHUT_DOWN_HW,
    CONFIG_ACTION_RESTART_HW,
    CONFIG_ACTION_SHUT_DOWN,
    CONFIG_STATUS_FETCH_CONFIG_TEMPLATE,
    CONFIG_STATUS_FETCH_CONFIG,
    ERROR_TYPE_LO7ETTA7AKOM,
    ERROR_3DR,
    ERROR_GPS,
    ERROR_POWER,
    ERROR_RCCONTROL,
    ERROR_TYPE_ERROR_MODULE,
    ERROR_TYPE_ERROR_P2P,
    ERROR_TYPE_ERROR_SDR,
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
    NOTIFICATION_TYPE_REGISTRATION,
    NOTIFICATION_TYPE_TELEMETRY,
    NOTIFICATION_TYPE_PROTOCOL,
    NOTIFICATION_TYPE_LO7ETTA7AKOM,
    NOTIFICATION_TYPE_GEO_FENCE,
    TYPE_AndruavMessage_PRECLAND_ACTION,
    TYPE_AndruavMessage_PRECLAND_TARGET,
    TYPE_AndruavMessage_PRECLAND_STATUS,
    PRECLAND_ACTION_DISABLE,
    PRECLAND_ACTION_ENABLE,
    PRECLAND_ACTION_SET_TARGET,
    PRECLAND_ACTION_SELFTEST,
    PRECLAND_ACTION_CALIBRATE,
    PRECLAND_ACTION_CALIBRATE_CANCEL,
    PRECLAND_CALIB_STATUS_IDLE,
    PRECLAND_CALIB_STATUS_CAPTURING,
    PRECLAND_CALIB_STATUS_COMPUTING,
    PRECLAND_CALIB_STATUS_DONE,
    PRECLAND_CALIB_STATUS_FAILED,
    PRECLAND_STATUS_DISABLED,
    PRECLAND_STATUS_SEARCHING,
    PRECLAND_STATUS_LOCKED,
    PRECLAND_STATUS_DEGRADED,
    PRECLAND_STATUS_ERROR,
    PRECLAND_REASON_NOMINAL,
    PRECLAND_REASON_NO_TARGET,
    PRECLAND_REASON_STALE,
    PRECLAND_REASON_MIN_TAGS,
    PRECLAND_REASON_RMSE,
    PRECLAND_REASON_ERROR
};
