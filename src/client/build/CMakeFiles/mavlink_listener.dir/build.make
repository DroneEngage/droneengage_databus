# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.22

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:

#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:

# Disable VCS-based implicit rules.
% : %,v

# Disable VCS-based implicit rules.
% : RCS/%

# Disable VCS-based implicit rules.
% : RCS/%,v

# Disable VCS-based implicit rules.
% : SCCS/s.%

# Disable VCS-based implicit rules.
% : s.%

.SUFFIXES: .hpux_make_needs_suffix_list

# Produce verbose output by default.
VERBOSE = 1

# Command-line flag to silence nested $(MAKE).
$(VERBOSE)MAKESILENT = -s

#Suppress display of executed commands.
$(VERBOSE).SILENT:

# A target that is always out of date.
cmake_force:
.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E rm -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /home/mhefny/DroneEngage/droneengage_databus/src/client

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /home/mhefny/DroneEngage/droneengage_databus/src/client/build

# Include any dependencies generated for this target.
include CMakeFiles/mavlink_listener.dir/depend.make
# Include any dependencies generated by the compiler for this target.
include CMakeFiles/mavlink_listener.dir/compiler_depend.make

# Include the progress variables for this target.
include CMakeFiles/mavlink_listener.dir/progress.make

# Include the compile flags for this target's objects.
include CMakeFiles/mavlink_listener.dir/flags.make

CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o: CMakeFiles/mavlink_listener.dir/flags.make
CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o: ../test/mavlink_listener.cpp
CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o: CMakeFiles/mavlink_listener.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/mhefny/DroneEngage/droneengage_databus/src/client/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o -MF CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o.d -o CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o -c /home/mhefny/DroneEngage/droneengage_databus/src/client/test/mavlink_listener.cpp

CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.i"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/mhefny/DroneEngage/droneengage_databus/src/client/test/mavlink_listener.cpp > CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.i

CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.s"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/mhefny/DroneEngage/droneengage_databus/src/client/test/mavlink_listener.cpp -o CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.s

CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o: CMakeFiles/mavlink_listener.dir/flags.make
CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o: ../src/uavos_common/uavos_module.cpp
CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o: CMakeFiles/mavlink_listener.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/mhefny/DroneEngage/droneengage_databus/src/client/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Building CXX object CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o -MF CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o.d -o CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o -c /home/mhefny/DroneEngage/droneengage_databus/src/client/src/uavos_common/uavos_module.cpp

CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.i"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/mhefny/DroneEngage/droneengage_databus/src/client/src/uavos_common/uavos_module.cpp > CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.i

CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.s"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/mhefny/DroneEngage/droneengage_databus/src/client/src/uavos_common/uavos_module.cpp -o CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.s

CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o: CMakeFiles/mavlink_listener.dir/flags.make
CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o: ../src/uavos_common/udpClient.cpp
CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o: CMakeFiles/mavlink_listener.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/mhefny/DroneEngage/droneengage_databus/src/client/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_3) "Building CXX object CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o -MF CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o.d -o CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o -c /home/mhefny/DroneEngage/droneengage_databus/src/client/src/uavos_common/udpClient.cpp

CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.i"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/mhefny/DroneEngage/droneengage_databus/src/client/src/uavos_common/udpClient.cpp > CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.i

CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.s"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/mhefny/DroneEngage/droneengage_databus/src/client/src/uavos_common/udpClient.cpp -o CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.s

CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o: CMakeFiles/mavlink_listener.dir/flags.make
CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o: ../src/helpers/getopt_cpp.cpp
CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o: CMakeFiles/mavlink_listener.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/mhefny/DroneEngage/droneengage_databus/src/client/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_4) "Building CXX object CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o -MF CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o.d -o CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o -c /home/mhefny/DroneEngage/droneengage_databus/src/client/src/helpers/getopt_cpp.cpp

CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.i"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/mhefny/DroneEngage/droneengage_databus/src/client/src/helpers/getopt_cpp.cpp > CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.i

CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.s"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/mhefny/DroneEngage/droneengage_databus/src/client/src/helpers/getopt_cpp.cpp -o CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.s

CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o: CMakeFiles/mavlink_listener.dir/flags.make
CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o: ../src/helpers/helpers.cpp
CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o: CMakeFiles/mavlink_listener.dir/compiler_depend.ts
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/mhefny/DroneEngage/droneengage_databus/src/client/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_5) "Building CXX object CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -MD -MT CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o -MF CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o.d -o CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o -c /home/mhefny/DroneEngage/droneengage_databus/src/client/src/helpers/helpers.cpp

CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.i"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/mhefny/DroneEngage/droneengage_databus/src/client/src/helpers/helpers.cpp > CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.i

CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.s"
	/usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/mhefny/DroneEngage/droneengage_databus/src/client/src/helpers/helpers.cpp -o CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.s

# Object files for target mavlink_listener
mavlink_listener_OBJECTS = \
"CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o" \
"CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o" \
"CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o" \
"CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o" \
"CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o"

# External object files for target mavlink_listener
mavlink_listener_EXTERNAL_OBJECTS =

../bin/mavlink_listener: CMakeFiles/mavlink_listener.dir/test/mavlink_listener.cpp.o
../bin/mavlink_listener: CMakeFiles/mavlink_listener.dir/src/uavos_common/uavos_module.cpp.o
../bin/mavlink_listener: CMakeFiles/mavlink_listener.dir/src/uavos_common/udpClient.cpp.o
../bin/mavlink_listener: CMakeFiles/mavlink_listener.dir/src/helpers/getopt_cpp.cpp.o
../bin/mavlink_listener: CMakeFiles/mavlink_listener.dir/src/helpers/helpers.cpp.o
../bin/mavlink_listener: CMakeFiles/mavlink_listener.dir/build.make
../bin/mavlink_listener: CMakeFiles/mavlink_listener.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/home/mhefny/DroneEngage/droneengage_databus/src/client/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_6) "Linking CXX executable ../bin/mavlink_listener"
	$(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/mavlink_listener.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
CMakeFiles/mavlink_listener.dir/build: ../bin/mavlink_listener
.PHONY : CMakeFiles/mavlink_listener.dir/build

CMakeFiles/mavlink_listener.dir/clean:
	$(CMAKE_COMMAND) -P CMakeFiles/mavlink_listener.dir/cmake_clean.cmake
.PHONY : CMakeFiles/mavlink_listener.dir/clean

CMakeFiles/mavlink_listener.dir/depend:
	cd /home/mhefny/DroneEngage/droneengage_databus/src/client/build && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /home/mhefny/DroneEngage/droneengage_databus/src/client /home/mhefny/DroneEngage/droneengage_databus/src/client /home/mhefny/DroneEngage/droneengage_databus/src/client/build /home/mhefny/DroneEngage/droneengage_databus/src/client/build /home/mhefny/DroneEngage/droneengage_databus/src/client/build/CMakeFiles/mavlink_listener.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : CMakeFiles/mavlink_listener.dir/depend
