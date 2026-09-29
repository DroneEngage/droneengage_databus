import socket
import threading
import json
import time

try:
    from .colors import *
except ImportError:
    from colors import *


LAST_CHUNK_NUMBER = 0xFFFF  # Global variable for the last chunk number

class CUDPClient(object):
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(CUDPClient, cls).__new__(cls)
        return cls._instance
    
    
    def __init__(self):
        self.m_SocketFD = -1
        self.m_ModuleAddress = None
        self.m_CommunicatorModuleAddress = None
        self.m_chunkSize = 0
        self.m_stopped_called = False
        self.m_starrted = False
        self.m_threadCreateUDPSocket = None
        self.m_threadSenderID = None
        self.m_callback = None
        self.m_JsonID = ""
        self.m_lock = threading.Lock()
        self.m_lock2 = threading.Lock()
        self.MAXLINE = 65507    

    def __del__(self):
        if not self.m_stopped_called:
            self.stop()

    def init(self, targetIP, broadcastPort, host, listeningPort, chunkSize, onReceiveCallback):
        self.m_chunkSize = chunkSize
        self.m_callback = onReceiveCallback
        self.m_SocketFD = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.m_SocketFD.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.m_ModuleAddress = (host, listeningPort)
        self.m_CommunicatorModuleAddress = (targetIP, broadcastPort)
        self.m_SocketFD.bind(self.m_ModuleAddress)
        print(LOG_CONSOLE_BOLD_TEXT + "UDP Listener at " + INFO_CONSOLE_TEXT + str(host) + ":" + str(listeningPort) + NORMAL_CONSOLE_TEXT)
        print(LOG_CONSOLE_BOLD_TEXT + "Expected Comm Server at " + INFO_CONSOLE_TEXT + str(targetIP) + ":" + str(broadcastPort) + NORMAL_CONSOLE_TEXT)
        print(LOG_CONSOLE_BOLD_TEXT + "UDP Max Packet Size " + INFO_CONSOLE_TEXT + str(chunkSize) + NORMAL_CONSOLE_TEXT)

    def start(self):
        if self.m_starrted:
            raise Exception("Starrted called twice")
        self.startReceiver()
        self.startSenderID()
        self.m_starrted = True

    def startReceiver(self):
        self.m_threadCreateUDPSocket = threading.Thread(target=self.InternalReceiverEntry, daemon=True)
        self.m_threadCreateUDPSocket.start()

    def startSenderID(self):
        self.m_threadSenderID = threading.Thread(target=self.InternelSenderIDEntry, daemon=True)
        self.m_threadSenderID.start()

    def stop(self):
        self.m_stopped_called = True
        if self.m_SocketFD != -1:
            self.m_SocketFD.close()
        if self.m_starrted:
            self.m_threadCreateUDPSocket.join(timeout=2)
            self.m_threadSenderID.join(timeout=2)
        del self.m_ModuleAddress
        del self.m_CommunicatorModuleAddress

    def InternalReceiverEntry(self):
        """
        This function is responsible for receiving and processing data chunks from the socket.
        It runs in a loop until the 'm_stopped_called' flag is set to True.
        """
        receivedChunks = []  # List to store the received data chunks

        while not self.m_stopped_called:
            try:
                # Receive data from the socket
                received, cliaddr = self.m_SocketFD.recvfrom(self.MAXLINE)
            except OSError:
                # Socket was closed (e.g. via stop()); exit the loop.
                if self.m_stopped_called:
                    break
                continue

            # Check if any data was received
            if len(received) > 0:
                if len(received) < 2:
                    print(f"ERROR: Received packet too small: {len(received)} bytes")
                    continue

                # Extract the chunk number from the received data
                chunkNumber = (received[1] << 8) | received[0]

                # If the chunk number is 0, reset the receivedChunks list
                if chunkNumber == 0:
                    receivedChunks = []

                # Append the received data (excluding the first two bytes) to the receivedChunks list
                receivedChunks.append(received[2:])

                # If the chunk number is LAST_CHUNK_NUMBER (0xFFFF), it indicates the last chunk
                if chunkNumber == LAST_CHUNK_NUMBER:
                    # Concatenate all the received chunks into a single byte string
                    concatenatedData = b''.join(receivedChunks)

                    # NOTICE: we don't know if this is a text or a text+binary message
                    # so a null terminator is appended; it should be stripped later if binary.
                    concatenatedData += b'\x00'

                    # Call the callback function, if it exists, with the concatenated data and its length
                    if self.m_callback:
                        try:
                            self.m_callback(concatenatedData, len(concatenatedData))
                        except Exception as e:
                            print(f"ERROR: onReceive callback failed: {e}")

                    # Reset the receivedChunks list for the next set of data
                    receivedChunks = []

    def setJsonId(self, jsonID):
        """
        This is JSON of TYPE_AndruavModule_ID that identifies the module.
        """
        self.m_JsonID = jsonID

    
    def InternelSenderIDEntry(self):
        """
        Sending JSON with TYPE_AndruavModule_ID in a periodi form.
        """
        while not self.m_stopped_called:
            with self.m_lock2:
                if self.m_JsonID:
                    msg = self.m_JsonID
                    self.sendMSG(msg.encode(), len(msg))
            time.sleep(1)

    # Actual message sending.
    def sendMSG(self, msg, length):
        with self.m_lock:
            try:
                remaining_length = length
                offset = 0
                chunk_number = 0

                while remaining_length > 0:
                    chunk_length = min(self.m_chunkSize, remaining_length)
                    remaining_length -= chunk_length

                    # Create a new message with the chunk size + sizeof(uint8_t)
                    total_length = chunk_length + 2
                    chunk_msg = bytearray(total_length)

                    # Set the first two bytes as chunk number
                    if remaining_length == 0:
                        # Last packet is always equal to 255 (0xff) regardless if its actual number.
                        chunk_msg[0] = 0xFF
                        chunk_msg[1] = 0xFF
                    else:
                        chunk_msg[0] = chunk_number & 0xFF
                        chunk_msg[1] = (chunk_number >> 8) & 0xFF

                    #print(f"chunkNumber:{chunk_number} :chunkLength :{chunk_length}")
                    

                    # Copy the chunk data into the message
                    chunk_msg[2:total_length] = msg[offset:offset+chunk_length]


                    self.m_SocketFD.sendto(chunk_msg, self.m_CommunicatorModuleAddress)

                    if remaining_length != 0:
                        # Fast sending causes packet loss.
                        time.sleep(0.01)  # 10 milliseconds

                    offset += chunk_length
                    chunk_number += 1

            except Exception as e:
                print(f"DEBUG: InternelSenderIDEntry EXIT\n{e}")
