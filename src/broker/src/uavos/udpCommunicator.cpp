#include <iostream>
#include <cstring> 
#include <sys/socket.h> 
#include <arpa/inet.h> 
#include <netinet/in.h> 
#include <unistd.h>

#include "../helpers/colors.hpp"
#include "../helpers/json.hpp"
using Json = nlohmann::json;

#include "udpCommunicator.hpp"

#include <plog/Log.h> 
#include "plog/Initializers/RollingFileInitializer.h"

#define MAXLINE 65507 
char buffer[MAXLINE]; 

const int chunkSize = MAXLINE - 1000; // Adjust the chunk size as per your requirements


uavos::comm::CUDPCommunicator::~CUDPCommunicator ()
{
    
    #ifdef DEBUG
	std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: ~CUDPCommunicator" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif

    if (m_stopped_called == false)
    {
        #ifdef DEBUG
	    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: ~CUDPCommunicator" << _NORMAL_CONSOLE_TEXT_ << std::endl;
        #endif

        stop();
    }

    #ifdef DEBUG
	std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: ~CUDPCommunicator" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif

    // destroy mutex
	//pthread_mutex_destroy(&m_lock);

    #ifdef DEBUG
	std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: ~CUDPCommunicator" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif

}

/**
 * @brief 
 * 
 * @param host address of Communicator
 * @param listenningPort port of communicator
 */
void uavos::comm::CUDPCommunicator::init (const char * host, int listenningPort)
{
    
    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG:1" << _NORMAL_CONSOLE_TEXT_ << std::endl;

    // pthread initialization
	m_thread = pthread_self(); // get pthread ID
	pthread_setschedprio(m_thread, SCHED_FIFO); // setting priority

    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG:1" << _NORMAL_CONSOLE_TEXT_ << std::endl;

    // Creating socket file descriptor 
    if ( (m_SocketFD = socket(AF_INET, SOCK_DGRAM, 0)) < 0 ) { 
        perror("socket creation failed"); 
        PLOG(plog::error) << "socket creation failed" ; 
        exit(EXIT_FAILURE); 
    }

    m_CommunicatorModuleAddress = new (struct sockaddr_in)();
    memset(m_CommunicatorModuleAddress, 0, sizeof(struct sockaddr_in)); 
     
    // Communication Server (IP - PORT) 
    m_CommunicatorModuleAddress->sin_family = AF_INET; 
    m_CommunicatorModuleAddress->sin_port = htons(listenningPort); 
    m_CommunicatorModuleAddress->sin_addr.s_addr = inet_addr(host);//INADDR_ANY; 
    
    
    // Bind the socket with the server address 
    if (bind(m_SocketFD, (const struct sockaddr *)m_CommunicatorModuleAddress, sizeof(struct sockaddr_in)) < 0 ) 
    { 
        std::cout << "UDP Listener  " << _ERROR_CONSOLE_TEXT_ << " BAD BIND: " << host << ":" << listenningPort << _NORMAL_CONSOLE_TEXT_ << std::endl;
        PLOG(plog::error) << "UDP Listener BAD BIND: " << host << ":" << listenningPort ; 
        exit(-1) ;
    } 

    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG:3" << _NORMAL_CONSOLE_TEXT_ << std::endl;

}

void uavos::comm::CUDPCommunicator::start()
{
    #ifdef DEBUG        
        std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: start" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    
    // call directly as we are already in a thread.
    if (m_starrted == true)
        throw "Starrted called twice";

    startReceiver ();

    m_starrted = true;
}


void uavos::comm::CUDPCommunicator::startReceiver ()
{
    m_threadCreateUDPSocket = std::thread {[&](){ InternalReceiverEntry(); }};
};

void uavos::comm::CUDPCommunicator::stop()
{
    #ifdef DEBUG
	std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: Stop" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    
    m_stopped_called = true;

    if (m_SocketFD != -1)
        shutdown(m_SocketFD, SHUT_RDWR);
    
    #ifdef DEBUG
	std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: Stop Socket Closed" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif

    try
    {
        m_threadCreateUDPSocket.join();
        delete m_CommunicatorModuleAddress;

        #ifdef DEBUG
	    std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: Stop Threads Killed" << _NORMAL_CONSOLE_TEXT_ << std::endl;
        #endif
    }
    catch(...)
    {
        //std::cerr << e.what() << '\n';
        PLOG(plog::error) << "CUDPCommunicator::stop() exception" ; 
    }

    #ifdef DEBUG
	std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: Stop out" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
}


void uavos::comm::CUDPCommunicator::InternalReceiverEntry()
{
    #ifdef DEBUG        
        std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: InternalReceiverEntry" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
    
    // https://stackoverflow.com/questions/2876024/linux-is-there-a-read-or-recv-from-socket-with-timeout
    struct timeval tv;
    tv.tv_sec = 1; // timeout_in_seconds;
    tv.tv_usec = 0;
    setsockopt(m_SocketFD, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof tv);

    struct sockaddr_in  cliaddr;
    int n;
    __socklen_t sender_address_size = sizeof (cliaddr);
   
   std::map<uint8_t, std::vector<uint8_t>> receivedChunks; // Map to store received chunks


    while (!m_stopped_called)
    {
        // TODO: you should send header ot message length and handle if total message size is larger than MAXLINE.
        n = recvfrom(m_SocketFD, (char *)buffer, MAXLINE,  
                MSG_WAITALL, ( struct sockaddr *) &cliaddr, &sender_address_size);
        
        if (n > 0) 
        {

            uint8_t chunkNumber = buffer[0]; // First byte is the chunk number
            int chunkLength = n - sizeof(uint8_t); // Calculate chunk length excluding the chunk number byte
            
            bool end = chunkLength < chunkSize;
            
            // Store the received chunk in the map
            receivedChunks[chunkNumber] = std::vector<uint8_t>(buffer + sizeof(uint8_t), buffer + n); // chunkLength not n

            
            // Check if we have received all the chunks
            if (end)
            {
                // Concatenate the chunks in order
                std::vector<uint8_t> concatenatedData;
                for (auto& chunk : receivedChunks)
                {
                    concatenatedData.insert(concatenatedData.end(), chunk.second.begin(), chunk.second.end());
                }
                concatenatedData.insert(concatenatedData.end(), {0});

                // Call the onReceive callback with the concatenated data
                if (m_callback != nullptr)
                {
                        std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: " << concatenatedData.size() << _NORMAL_CONSOLE_TEXT_ << std::endl;
                        m_callback->onReceive((const char *) concatenatedData.data(), concatenatedData.size(), &cliaddr);
                }

                // Clear the map for the next set of chunks
                receivedChunks.clear();
            }
        }

        
    }

    #ifdef DEBUG
	std::cout <<__PRETTY_FUNCTION__ << " line:" << __LINE__ << "  "  << _LOG_CONSOLE_TEXT << "DEBUG: InternalReceiverEntry EXIT" << _NORMAL_CONSOLE_TEXT_ << std::endl;
    #endif
}




/**
 * Sends JMSG to Communicator
 **/
void uavos::comm::CUDPCommunicator::SendMsg(const char * message, const std::size_t datalength, struct sockaddr_in * module_address)
{
    std::lock_guard<std::mutex> lock(m_lock);

    
    try
    {
        int remainingLength = datalength;
        int offset = 0;
        uint8_t chunk_number = 0;

        while (remainingLength > 0)
        {
            int chunkLength = std::min(chunkSize, remainingLength);

            // if (chunkLength == remainingLength)
            // {
            //     // a single unqire record.
            //     chunk_number = 0xff;
            // }
            
            // Create a new message with the chunk size + sizeof(uint8_t)
            char chunkMsg[chunkLength + sizeof(uint8_t)];

            // Set the first byte as chunk number
            chunkMsg[0] = static_cast<uint8_t>(chunk_number);

            // Copy the chunk data into the message
            std::memcpy(chunkMsg + sizeof(uint8_t), message + offset, chunkLength);

            sendto(m_SocketFD, chunkMsg, chunkLength + sizeof(uint8_t),
                MSG_CONFIRM, (const struct sockaddr*) module_address,
                sizeof(struct sockaddr_in));

            remainingLength -= chunkLength;
            offset += chunkLength;
            chunk_number++;
        }
    }
    catch (const std::exception& e)
    {
        std::cerr << e.what() << '\n';
    }
}