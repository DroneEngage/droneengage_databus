
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
- **[C++ Core Library](client/src/de_common/README.md)** - C++17 implementation with detailed protocol documentation
- **[C++ Examples](client/test/README.md)** - Sample applications demonstrating:
  - Basic module communication
  - Binary data transmission (images)
  - MAVLink message handling
  - Adaptive rate control (sender/receiver)
  - Queue-based processing

#### Python Implementation
- **[Python Library](python/README.md)** - Python 3.6+ implementation with:
  - Complete API reference
  - Quick start guide
  - Message handling examples
  - Thread-safe operations

#### Node.js Implementation
- **[Node.js Library](nodejs/README.md)** - Node.js 12+ implementation featuring:
  - Event-driven architecture with EventEmitter
  - Async/await support
  - Complete API reference
  - NPM package configuration

## Quick Start

Choose your preferred language and follow the corresponding guide:

### C++
```bash
cd client
mkdir build && cd build
cmake ..
make
./client MyModule 60000 61111
```
See [C++ Examples README](client/test/README.md) for detailed usage.

### Python
```bash
cd python
pip install colorama
python client.py MyModule 60000 61233
```
See [Python README](python/README.md) for detailed usage.

### Node.js
```bash
cd nodejs
npm install
node client.js MyModule 60000 61234
```
See [Node.js README](nodejs/README.md) for detailed usage.

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
