import json

from messages import *
from colors import *


class CFacade_Base:
    def __init__(self, m_module):
        self.m_module = m_module

    def requestID(self, target_party_id):
        message = {
            "C": TYPE_AndruavMessage_ID
        }

        self.m_module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_RemoteExecute, True)

    def sendErrorMessage(self, target_party_id, error_number, info_type, notification_type, description):
        """
        EN: error number "not currently processed".
        IT: info type indicate what component is reporting the error.
        NT: severity and compliant with ardupilot.
        DS: description message.
        """
        message = {
            "EN": error_number,
            "IT": info_type,
            "NT": notification_type,
            "DS": description
        }

        self.m_module.sendJMSG(target_party_id, message, TYPE_AndruavMessage_Error, False)

        print(f"\n{SUCCESS_CONSOLE_BOLD_TEXT} -- sendErrorMessage {NORMAL_CONSOLE_TEXT}{description}")

class MyFacade(CFacade_Base):
    def __init__(self, m_module):
        super().__init__(m_module)

    # Add your custom methods here
    def my_custom_method(self, arg1, arg2):
        # Implement your custom method here
        pass

