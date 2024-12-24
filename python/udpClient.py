import socket
import threading
import json
import time



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
        print(f"UDP Listener at {host}:{listeningPort}")
        print(f"Expected Comm Server at {targetIP}:{broadcastPort}")
        print(f"UDP Max Packet Size {chunkSize}")

    def start(self):
        if self.m_starrted:
            raise Exception("Starrted called twice")
        self.startReceiver()
        self.startSenderID()
        self.m_starrted = True

    def startReceiver(self):
        self.m_threadCreateUDPSocket = threading.Thread(target=self.InternalReceiverEntry)
        self.m_threadCreateUDPSocket.start()

    def startSenderID(self):
        self.m_threadSenderID = threading.Thread(target=self.InternelSenderIDEntry)
        self.m_threadSenderID.start()

    def stop(self):
        self.m_stopped_called = True
        if self.m_SocketFD != -1:
            self.m_SocketFD.close()
        if self.m_starrted:
            self.m_threadCreateUDPSocket.join()
            self.m_threadSenderID.join()
        del self.m_ModuleAddress
        del self.m_CommunicatorModuleAddress

    def InternalReceiverEntry(self):
        receivedChunks = []
        while not self.m_stopped_called:
            received, cliaddr = self.m_SocketFD.recvfrom(self.MAXLINE)
            if len(received) > 0:
                chunkNumber = (received[1] << 8) | received[0]
                if chunkNumber == 0:
                    receivedChunks = []
                receivedChunks.append(received[2:])
                if chunkNumber == 0xFFFF:
                    concatenatedData = b''.join(receivedChunks)
                    #concatenatedData += b"\0"
                    if self.m_callback:
                        self.m_callback(concatenatedData, len(concatenatedData))
                    receivedChunks = []


    def setJsonId(self, jsonID):
        self.m_JsonID = jsonID

    def InternelSenderIDEntry(self):
        while not self.m_stopped_called:
            with self.m_lock2:
                if self.m_JsonID:
                    msg = self.m_JsonID
                    self.sendMSG(msg.encode(), len(msg))
            time.sleep(1)

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

                    print(f"chunkNumber:{chunk_number} :chunkLength :{chunk_length}")
                    

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
