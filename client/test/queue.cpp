#include <iostream>
#include <queue>

int main (int argc, char *argv[]) {
    std::queue<std::string> messageQueue;

    // Push messages to the queue
    messageQueue.push("Message 1");
    messageQueue.push("Message 2");
    messageQueue.push("Message 3");

    // Pop messages from the queue
    while (!messageQueue.empty()) {
        std::cout << "Popped: " << messageQueue.front() << std::endl;
        messageQueue.pop();
    }

    return 0;
}