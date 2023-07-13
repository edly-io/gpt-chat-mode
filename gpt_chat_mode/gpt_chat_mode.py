"""The Chat GPT Chat Mode XBlock is an interactive component designed to enhance student engagement
 and learning through chat-based interactions. It integrates with the GPT chat model to provide a 
 conversational experience, allowing students to ask questions, receive responses, and engage in interactive
conversations with an AI-powered chatbot."""

import pkg_resources
from django.conf import settings
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Integer, Scope, List, String, Float
from django.template import Context, Template


class GPTChatModeXBlock(XBlock):
    """
    The Chat GPT Chat Mode XBlock provides a chat-based interface for students to interact with Chat GPT.
    """

    title = String(
        display_name="Title",
        default="GPT Chat Mode",
        scope=Scope.settings,
    )

    system = String(
        display_name="System Message",
        default="",
        scope=Scope.settings,
    )

    api_key = String(
        display_name="API Key",
        default=getattr(settings, "OPENAI_SECRET_KEY", None),
        scope=Scope.settings,
    )

    message_history = List(
        default=[],
        scope=Scope.user_state,
    )

    model_name = String(
        display_name="AI Model Name",
        values=(
            "text-davinci-003",
            "text-davinci-002",
            "text-curie-001",
            "text-babbage-001",
            "text-ada-001",
        ),
        default="text-davinci-003",
        scope=Scope.settings,
    )

    temperature = Float(
        default=0.9,
        scope=Scope.settings,
    )

    max_length = Integer(
        default=256,
        scope=Scope.settings,
    )

    top_p = Float(
        default=1,
        scope=Scope.settings,
    )

    frequency_penalty = Float(
        default=0,
        scope=Scope.settings,
    )

    presence_penalty = Float(
        default=0,
        scope=Scope.settings,
    )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def render_template(self, template_path, student_view):
        """Handy helper for rendering html template."""
        template_str = self.resource_string(template_path)
        template = Template(template_str)

        if student_view:
            if len(self.message_history) > 0:
                messages = self.message_history[1:]
                context = {
                    "title": self.title,
                    "initial_message": self.message_history[0]["gpt_message"],
                    "messages": messages,
                }
            else:
                messages = None
                context = {
                    "title": self.title,
                    "initial_message": None,
                    "messages": None,
                }

        else:
            context = {"initial_message": None, "messages": self.message_history}
        return template.render(Context(context))

    def student_view(self, context=None):
        """
        The primary view of the GPTChatModeXBlock, shown to students
        when viewing courses.
        """
        html = self.render_template("static/html/gpt_chat_mode.html", True)
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/gpt_chat_mode.css"))
        frag.add_javascript(self.resource_string("static/js/src/gpt_chat_mode.js"))
        frag.add_javascript(self.resource_string("static/js/src/common.js"))
        frag.initialize_js("GPTChatModeXBlock")
        return frag

    def studio_view(self, context=None):
        """
        The primary view of the GPTChatModeStudioXBlock, shown to staff
        """
        html = self.render_template("static/html/gpt_chat_mode.html", None)
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/gpt_chat_mode.css"))
        frag.add_javascript(self.resource_string("static/js/src/studio.js"))
        frag.add_javascript(self.resource_string("static/js/src/gpt_chat_mode.js"))
        frag.add_javascript(self.resource_string("static/js/src/common.js"))
        frag.initialize_js("GPTChatModeStudioXBlock")
        return frag

    # TO-DO: change this view to display your data your own way.
    @XBlock.json_handler
    def message_to_gpt(self, data, suffix=""):
        """send messages and receive responses from a Chat GPT model and add message to chat history."""

        self.message_history.append(
            {
                "user_message": data["user_message"],
                "gpt_message": "Yes Mortal (history)",
            }
        )

        return {
            "gpt_message": "GPT ANSWER 234",
            # "error": "test 1001",
            "success": True,
        }

    @XBlock.json_handler
    def get_parameters(self, data, suffix=""):
        """return chat gpt parameters dict with current values."""

        return {
            "title": self.title,
            "model": self.model_name,
            "sliders": {
                "temperature": self.temperature,
                "maxLength": self.max_length,
                "topP": self.top_p,
                "frequencyPenalty": self.frequency_penalty,
                "presencePenalty": self.presence_penalty,
            },
            "success": True,
        }

    @XBlock.json_handler
    def set_parameters(self, data, suffix=""):
        key = next(iter(data))
        print("data ", data)

        if key == "system":
            self.system = data[key]

        elif key == "api_key":
            self.api_key = data[key]

        elif key == "model_name":
            self.model_name = data[key]

        elif key == "temperature":
            self.temperature = data[key]

        elif key == "maxLength":
            self.max_length = data[key]

        elif key == "topP":
            self.top_p = data[key]

        elif key == "frequencyPenalty":
            self.frequency_penalty = data[key]

        elif key == "presencePenalty":
            self.presence_penalty = data[key]

        elif key == "title":
            self.title = data[key]

        else:
            return {
                "success": False,
            }

        return {
            "success": True,
        }

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            (
                "GPTChatModeXBlock",
                """<gpt_chat_mode/>
             """,
            ),
            (
                "Multiple GPTChatModeXBlock",
                """<vertical_demo>
                <gpt_chat_mode/>
                <gpt_chat_mode/>
                <gpt_chat_mode/>
                </vertical_demo>
             """,
            ),
        ]
