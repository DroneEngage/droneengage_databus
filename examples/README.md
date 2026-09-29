# DroneEngage-DataBus Examples

This directory contains runnable example modules for the DroneEngage-DataBus communication framework.
Each example connects to a running `de_comm` communicator, identifies itself, and demonstrates a
specific pattern of message exchange.

## Prerequisites

- A running **de_comm** instance (default port `60000`).
  ```
  cd drone_engage_communication_pro
  ./bin/de_comm
  ```

## Available Examples

### Python

| File | Description |
|------|-------------|
| `de_module.py` | MAVLink listener — identifies itself, subscribes to MAVLink messages, and prints each received message (JSON header + binary payload). |

**Usage:**
```
python de_module.py [de_comm_port] [listen_port]
```
Defaults: `de_comm_port=60000`, `listen_port=61200`

### Node.js

| File | Description |
|------|-------------|
| `mavlink_listener.js` | Subscribes to MAVLink and other message types; prints every received message with binary payload extraction. |
| `image_sender.js` | Reads a binary file (e.g. `img.jpeg`) and sends it via `sendBMSG` as `TYPE_AndruavMessage_IMG` every 10 seconds. |
| `sender_adapter.js` | Sends custom user-range messages at a configurable rate; adjusts rate based on feedback from `receiver_adapter.js`. |
| `receiver_adapter.js` | Receives custom user-range messages, queues them, processes at a configurable rate, and sends rate-control feedback back to the sender. |

**Usage:**
```
node mavlink_listener.js [de_comm_port] [listen_port]
node image_sender.js <file_path> [de_comm_port] [listen_port]
node sender_adapter.js <module_name> <de_comm_port> [rate_ms]
node receiver_adapter.js <module_name> <de_comm_port> [delay_ms]
```

Default ports: `mavlink_listener=70014`, `image_sender=50000`,
`sender_adapter=70034`, `receiver_adapter=70024`.

**Rate-Adapter pair example:**
```
# Terminal 1 — receiver (processes every 500 ms)
node receiver_adapter.js receiver_mod 60000 500

# Terminal 2 — sender (sends every 300 ms)
node sender_adapter.js sender_mod 60000 300
```

### C++ Examples
Located in `../client/test/`:
- **client.cpp** - Basic module communication with comprehensive help system
- **image_sender.cpp** - Binary data transmission (images)
- **mavlink_listener.cpp** - MAVLink message listener
- **sender_adapter.cpp** / **receiver_adapter.cpp** - Adaptive rate control pair

### Node.js Library
Located in `../nodejs/`:
- **client.js** - Basic event-driven Node.js module with graceful shutdown
- **de_module.js** / **de_facade_base.js** / **my_facade.js** - Library modules

### Python Library
Located in `../python/`:
- **python_client.py** - Basic Python module implementation
- **de_module.py** / **de_facade_base.py** / **configFile.py** - Library modules

## Quick Start

Each example follows the same pattern:
1. Define module with unique ID, key, and message filter
2. Set module features (telemetry send/receive) — optional
3. Set hardware verification info — optional
4. Register a message callback (`m_OnReceive`)
5. Initialize UDP communication with `de_comm`
6. Run main loop until SIGINT/SIGTERM

## Network Configuration

- **Default de_comm port**: 60000
- **UDP packet size**: 8192 bytes
- **Target IP**: `127.0.0.1` (local de_comm)

## Message Types

All implementations use the message type constants defined in `messages.js` / `messages.py`:
- `TYPE_AndruavMessage_MAVLINK` (6502) — MAVLink messages (binary)
- `TYPE_AndruavMessage_IMG` (1006) — Image data (binary)
- `TYPE_AndruavMessage_USER_RANGE_START` (80000) — Custom user-defined messages
- `TYPE_AndruavMessage_CONFIG_ACTION` (6525) — Remote config actions
- And many more (see the messages file for the full list)

See the individual example files for detailed usage.
