# DroneEngage-DataBus Examples

This directory contains implementation samples for the DroneEngage-DataBus communication framework.

## Available Examples

### C++ Examples
Located in `../client/test/`:
- **client.cpp** - Basic module communication with comprehensive help system
- **image_sender.cpp** - Binary data transmission (images)
- **mavlink_handler.cpp** - MAVLink message handling
- **adaptive_rate_control.cpp** - Adaptive rate control (sender/receiver)
- **queue_processor.cpp** - Queue-based processing
- **robust_input.cpp** - Robust input handling and user interaction

### Python Examples
Located in `../python/`:
- **python_client.py** - Basic Python module implementation
- **de_module.py** - Core module management
- **facade_base.py** - Response generation and handling

### Node.js Examples
Located in `../nodejs/`:
- **client.js** - Event-driven Node.js module with graceful shutdown
- **de_module.js** - Module management for Node.js
- **my_facade.js** - Facade implementation

## Quick Start

Each language implementation follows the same pattern:
1. Define module with unique ID and message filter
2. Set module features (telemetry send/receive)
3. Initialize UDP communication
4. Register message callback handler
5. Start main event loop

## Network Configuration

- **Default de_comm port**: 60000
- **Default module ports**: 61111-61234
- **UDP packet size**: 8192 bytes

## Message Types

All implementations support the same message types defined in `MESSAGE_FILTER`:
- Remote execution commands
- Flight control messages
- Geofence operations
- Telemetry data
- MAVLink messages
- P2P communications
- And more...

See the individual implementation files for detailed usage examples.