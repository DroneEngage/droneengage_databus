# Message Flow Journey - Python Databus

This document describes the complete journey of a message from reception to processing and reply creation in the Python databus system.

## Overview

The Python databus implements a message processing pipeline with three main components:
1. **`de_module.py`** - Module management and UDP communication
2. **`de_message_parser_base.py`** - Message parsing and command handling  
3. **`facade_base.py`** - Reply generation and response handling

## Message Flow Architecture

```
┌─────────────────┐    ┌──────────────────────────┐    ┌─────────────────┐
│   UDP Network   │───▶│    CModule (de_module)   │───▶│ Message Parser  │
│                 │    │                          │    │                 │
│  Raw Message    │    │  onReceive()             │    │ parse_message() │
└─────────────────┘    └──────────────────────────┘    └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌─────────────────┐
                                                   │ Command Handler │
                                                   │                 │
                                                   │ parse_command() │
                                                   └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌─────────────────┐
                                                   │ Facade Base     │
                                                   │                 │
                                                   │ send_reply()    │
                                                   └─────────────────┘
```

## Detailed Message Journey

### 1. Message Reception (`de_module.py`)

**Entry Point**: `CModule.onReceive()`

```python
def onReceive(self, message, len):
    print(f"RX MSG: :len {len}:{message}")
    
    try:
        jMsg = json.loads(message)
        print(f"RX MSG: jMsg{json.dumps(jMsg)}")
        
        # Validate message structure
        if ANDRUAV_PROTOCOL_MESSAGE_TYPE not in jMsg:
            return
        if INTERMODULE_ROUTING_TYPE not in jMsg:
            return
```

**Key Responsibilities**:
- Receives raw UDP messages
- Parses JSON structure
- Validates message protocol fields
- Handles inter-module routing
- Forwards to registered callback (`m_OnReceive`)

**Message Types Handled**:
- `TYPE_AndruavModule_ID` - Module identification
- `TYPE_AndruavMessage_DUMMY` - Dummy messages
- Custom messages via callback

### 2. Message Parsing (`de_message_parser_base.py`)

**Entry Point**: `AndruavMessageParserBase.parse_message()`

```python
def parse_message(self, andruav_message: Dict[str, Any], full_message: Union[str, bytes], full_message_length: int):
    message_type = andruav_message.get(ANDRUAV_PROTOCOL_MESSAGE_TYPE, 0)
    
    # Determine message characteristics
    self._is_binary = not (full_message.endswith('}') or 
                          (len(full_message) > 1 and full_message[-2] == '}'))
    
    # Extract permission and routing information
    permission = int(andruav_message.get(ANDRUAV_PROTOCOL_MESSAGE_PERMISSION, 0))
    self._is_system = (andruav_message.get(ANDRUAV_PROTOCOL_SENDER) == ANDRUAV_PROTOCOL_SENDER_COMM_SERVER)
    self._is_inter_module = (andruav_message.get(INTERMODULE_ROUTING_TYPE) == CMD_TYPE_INTERMODULE)
```

**Processing Pipeline**:

1. **Message Classification**:
   - Binary vs JSON detection
   - System vs user message identification
   - Inter-module routing detection

2. **Special Message Handling**:
   ```python
   if message_type == TYPE_AndruavMessage_RemoteExecute:
       self.parse_remote_execute(andruav_message)
       return
   ```

3. **Command Processing**:
   ```python
   self._parse_default_command(andruav_message, full_message, full_message_length, message_type, permission)
   self.parse_command(andruav_message, full_message, full_message_length, message_type, permission)
   ```

### 3. Default Command Handling

**Configuration Actions**: `_handle_config_action()`

```python
def _handle_config_action(self, andruav_message: Dict[str, Any], cmd: Dict[str, Any]):
    action = cmd["a"]
    module_key = cmd.get("b", "")
    
    if action == CONFIG_ACTION_Restart:
        exit(0)
    elif action == CONFIG_ACTION_APPLY_CONFIG:
        config_file = ConfigFile.get_instance()
        config_file.update_json(json.dumps(cmd.get("c", {})))
    elif action == CONFIG_REQUEST_FETCH_CONFIG_TEMPLATE:
        # Read template.json and send via facade
        with open("template.json", 'r') as file:
            file_content_json = json.loads(file.read())
            self._facade.api_send_config_template(sender, module_key, file_content_json, True)
```

### 4. Custom Command Processing

**Abstract Methods** (implemented by subclasses):
- `parse_remote_execute()` - Remote execution commands
- `parse_command()` - Module-specific commands

### 5. Reply Generation (`facade_base.py`)

**Facade Pattern**: `FacadeBase` provides unified response interface

```python
class FacadeBase:
    def send_error_message(self, target_party_id: str, error_number: int, info_type: int, 
                          notification_type: int, description: str):
        message = {
            "EN": error_number,
            "IT": info_type, 
            "NT": notification_type,
            "DS": description
        }
        if self._module:
            self._module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_Error, False)
```

**Key Reply Methods**:

1. **Error Messages**:
   - `send_error_message()` - Structured error reporting
   - Includes error number, info type, notification type, description

2. **Configuration Responses**:
   ```python
   def api_send_config_template(self, target_party_id: str, module_key: str, 
                                json_file_content_json: Dict[str, Any], reply: bool):
       message = {
           "a": CONFIG_STATUS_FETCH_CONFIG_TEMPLATE,
           "b": json_file_content_json,
           "k": module_key,
           "R": reply
       }
       if self._module:
           self._module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_CONFIG_STATUS, False)
   ```

3. **ID Requests**:
   - `request_id()` - Request module identification

## Message Transmission

**Outbound Methods** (`CModule`):

1. **JSON Messages**:
   ```python
   def sendJMSG(self, targetPartyID, jmsg, andruav_message_id, internal_message):
       fullMessage = {
           INTERMODULE_MODULE_KEY: self.m_module_key,
           ANDRUAV_PROTOCOL_TARGET_ID: targetPartyID,
           INTERMODULE_ROUTING_TYPE: msg_routing_type,
           ANDRUAV_PROTOCOL_MESSAGE_TYPE: andruav_message_id,
           ANDRUAV_PROTOCOL_MESSAGE_CMD: jmsg
       }
       msg = json.dumps(fullMessage)
       self.sendMSG(msg.encode(), len(msg))
   ```

2. **Binary Messages**:
   ```python
   def sendBMSG(self, targetPartyID, bmsg, bmsg_length, andruav_message_id, internal_message, message_cmd):
       # Creates JSON header + binary payload
       json_msg = json.dumps(fullMessage)
       msg = json_msg.encode('utf-8') + b'\0' + bmsg
       self.sendMSG(msg, len(msg))
   ```

## Complete Message Lifecycle

### Incoming Message Flow:

1. **Network Reception**
   - UDP packet received by `CModule.cUDPClient`
   - Raw bytes passed to `onReceive()`

2. **Initial Processing**
   - JSON parsing and validation
   - Protocol field verification
   - Routing type determination

3. **Message Classification**
   - Binary vs JSON detection
   - System vs user source identification
   - Inter-module routing detection

4. **Command Dispatch**
   - Default command handling (config, etc.)
   - Custom command processing
   - Remote execution handling

5. **Response Generation**
   - Error handling via facade
   - Configuration responses
   - Custom replies

### Outgoing Message Flow:

1. **Message Construction**
   - JSON structure creation
   - Protocol field population
   - Module metadata inclusion

2. **Routing Determination**
   - Individual vs group vs inter-module
   - Target party ID specification

3. **Transmission**
   - JSON serialization
   - UDP packet transmission
   - Network delivery

## Key Design Patterns

1. **Singleton Pattern**: `CModule` and `FacadeBase` use singleton for global access
2. **Template Method**: `AndruavMessageParserBase` defines parsing workflow
3. **Facade Pattern**: `FacadeBase` simplifies response generation
4. **Observer Pattern**: `m_OnReceive` callback for message handling

## Error Handling

- **JSON Parsing**: Try-catch blocks with error logging
- **Field Validation**: `_validate_field()` method for type checking
- **Network Errors**: UDP client error handling
- **File Operations**: Template file reading with error handling

## Integration Points

The message flow integrates with:
- **UDP Network Layer**: Low-level communication
- **Configuration System**: Dynamic configuration updates
- **Module Registry**: Module identification and discovery
- **Error Reporting**: Structured error communication

This architecture provides a robust, extensible foundation for message processing in the Andruav databus system.
