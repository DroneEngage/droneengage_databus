[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/DroneEngage/droneengage_databus)


[![Ardupilot Cloud EcoSystem](https://cloud.ardupilot.org/_static/ardupilot_logo.png "Ardupilot Cloud EcoSystem")](https://cloud.ardupilot.org "Ardupilot Cloud EcoSystem") **Drone Engage** is part of Ardupilot Cloud Eco System

------------

# DroneEngage Custom Plugin

Writing a Custom Plugin allows you to write a module that can handle hardware part such as GPIO or sensors …etc. or writing a module that performs data processing, such as processing images from the camera module for example. Once you write this module and integrate it to the system using Databus library you will be able to access that new module from even remote units, and Drone-Engage Web Client.


## The Code
There are two parts of the code you need to understand if you want to make a custom plugin.

## Broker Code
The broker code, which is part of the Communicator Module, and this part you do not need to go deeply into it unless you need to make a complex plugin.

**Source Code:** https://github.com/DroneEngage/droneengage_communication/tree/master/src/de_broker


## Drone Engage Plugin Code
This is actually the part of code that you will include into your plugin. Your plugin can be written in C++, Node.js, Python, or any other language, however the available plugin templates are in C++, Node.js and Python.

**Source Code:**
https://github.com/DroneEngage/droneengage_databus

## Documentation

### Core Library
- **[DroneEngage DataBus Protocol](client/src/de_common/README.md)** - Detailed documentation of the UDP-based communication protocol, message chunking, reassembly, and module architecture

### Language Implementations

#### C++ Implementation
- **[C++ Core Library](https://github.com/DroneEngage/droneengage_common)** - C++17 implementation with detailed protocol documentation (included as a git submodule in `client/src/de_common/`)
- **[C++ Examples](client/test/)** - Sample applications demonstrating:
  - `client.cpp` - Basic module communication with comprehensive help system
  - `image_sender.cpp` - Binary data transmission (images)
  - `mavlink_listener.cpp` - MAVLink message listener
  - `sender_adapter.cpp` / `receiver_adapter.cpp` - Adaptive rate control pair

#### Python Implementation
- **[Python Library](python/)** - Python 3.6+ implementation with:
  - `de_module.py` / `de_facade_base.py` / `configFile.py` - Core library modules
  - `de_config_action_handler.py` - CONFIG_ACTION message handler
  - `python_client.py` - Basic client sample
  - Thread-safe operations with singleton pattern

#### Node.js Implementation
- **[Node.js Library](nodejs/)** - Node.js 12+ implementation featuring:
  - `de_module.js` / `de_facade_base.js` / `udpClient.js` - Core library modules
  - `de_config_action_handler.js` - CONFIG_ACTION message handler
  - `client.js` - Basic client sample
  - Event-driven architecture with EventEmitter
  - Async/await support

#### Runnable Examples
- **[Examples](examples/)** - Cross-language runnable examples:
  - `de_module.py` - Python MAVLink listener
  - `mavlink_listener.js` - Node.js MAVLink listener
  - `image_sender.js` - Node.js binary image sender
  - `sender_adapter.js` / `receiver_adapter.js` - Node.js adaptive rate control pair

## Quick Start

Choose your preferred language and follow the corresponding guide:

### C++
```bash
cd client
mkdir build && cd build
cmake ..
make
./client --help                    # Show comprehensive help
./client MyModule 60000 61111      # Run with all arguments
./client MyModule                  # Uses default ports
```
See [C++ Examples README](client/test/README.md) for detailed usage.

### Python
```bash
cd python
pip install colorama
python python_client.py MyModule 60000 61233  # Run with all arguments
python python_client.py MyModule              # Uses default ports
```
See [Python README](python/README.md) for detailed usage.

### Node.js
```bash
cd nodejs
npm install
node client.js --help               # Show comprehensive help
node client.js MyModule 60000 61234   # Run with all arguments  
node client.js MyModule              # Uses default ports
```
See [Node.js README](nodejs/README.md) for detailed usage.

### Runnable Examples
```bash
# Python MAVLink listener
cd examples
python de_module.py 60000 61200

# Node.js MAVLink listener
node examples/mavlink_listener.js 60000 70014

# Node.js image sender
node examples/image_sender.js ../client/test/img.jpeg 60000 50000

# Node.js adaptive rate control (run in two terminals)
node examples/receiver_adapter.js receiver_mod 60000 500
node examples/sender_adapter.js sender_mod 60000 300
```
See [Examples README](examples/README.md) for detailed usage.

## Features

All implementations provide:
- **Module Registration** - Register your module with the DroneEngage communicator
- **JSON Messaging** - Send and receive structured JSON messages
- **Binary Data Support** - Transmit images, files, and other binary data
- **Message Chunking** - Automatic splitting and reassembly of large messages
- **Message Filtering** - Subscribe to specific message types
- **Thread-Safe Operations** - Concurrent message handling
- **Periodic ID Broadcasting** - Automatic module identification
- **High-Level Facade API** - Simplified interface for common operations
- **Comprehensive Help System** - Built-in help with `-h/--help` flags
- **Flexible Argument Parsing** - Support for optional arguments with defaults
- **Robust Input Handling** - Cross-platform compatible user interaction
- **Enhanced Error Handling** - Clear validation and error messages

## Architecture

```
┌─────────────────────┐
│  Your Application   │
│  (C++/Python/Node)  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  DataBus Library    │
│  (Module + Facade)  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  UDP Client         │
│  (Chunking/Assembly)│
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  de_comm            │
│  Communicator       │
│  (Port 60000)       │
└─────────────────────┘
```

## Use Cases

- **Hardware Integration** - GPIO, sensors, actuators
- **Data Processing** - Image processing, telemetry analysis
- **Custom Telemetry** - Send custom sensor data
- **MAVLink Integration** - Process MAVLink messages
- **Remote Control** - Implement custom control logic
- **Monitoring** - Real-time system monitoring
- **Logging** - Custom data logging modules

## Support

For detailed information about the protocol, message types, and advanced usage, refer to the language-specific documentation linked above.
