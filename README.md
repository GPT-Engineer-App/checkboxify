# checkboxify

thake the following example that adds button behavior to an image to make a checkbox that behaves like a button:

    from kivy.app import App
    from kivy.uix.image import Image
    from kivy.uix.behaviors import ButtonBehavior


    class MyButton(ButtonBehavior, Image):
        def __init__(self, **kwargs):
            super(MyButton, self).__init__(**kwargs)
            self.source = 'atlas://data/images/defaulttheme/checkbox_off'

        def on_press(self):
            self.source = 'atlas://data/images/defaulttheme/checkbox_on'

        def on_release(self):
            self.source = 'atlas://data/images/defaulttheme/checkbox_off'


    class SampleApp(App):
        def build(self):
            return MyButton()


    SampleApp().run()

See :class:`~kivy.uix.behaviors.ButtonBehavior` for details.
'''

__all__ = ('ButtonBehavior', )

from kivy.clock import Clock
from kivy.config import Config
from kivy.properties import OptionProperty, ObjectProperty, \
    BooleanProperty, NumericProperty
from time import time


class ButtonBehavior(object):
    '''
    This `mixin <https://en.wikipedia.org/wiki/Mixin>`_ class provides
    :class:`~kivy.uix.button.Button` behavior. Please see the
    :mod:`button behaviors module <kivy.uix.behaviors.button>` documentation
    for more information.

    :Events:
        `on_press`
            Fired when the button is pressed.
        `on_release`
            Fired when the button is released (i.e. the touch/click that
            pressed the button goes away).

    '''

    state = OptionProperty('normal', options=('normal', 'down'))
    '''The state of the button, must be one of 'normal' or 'down'.
    The state is 'down' only when the button is currently touched/clicked,
    otherwise its 'normal'.

    :attr:`state` is an :class:`~kivy.properties.OptionProperty` and defaults
    to 'normal'.
    '''

    last_touch = ObjectProperty(None)
    '''Contains the last relevant touch received by the Button. This can
    be used in `on_press` or `on_release` in order to know which touch
    dispatched the event.

    .. versionadded:: 1.8.0

    :attr:`last_touch` is a :class:`~kivy.properties.ObjectProperty` and
    defaults to `None`.
    '''

    min_state_time = NumericProperty(0)
    '''The minimum period of time which the widget must remain in the
    `'down'` state.

    .. versionadded:: 1.9.1

    :attr:`min_state_time` is a float and defaults to 0.035. This value is
    taken from :class:`~kivy.config.Config`.
    '''

    always_release = BooleanProperty(False)
    '''This determines whether or not the widget fires an `on_release` event if
    the touch_up is outside the widget.

    .. versionadded:: 1.9.0

    .. versionchanged:: 1.10.0
        The default value is now False.

    :attr:`always_release` is a :class:`~kivy.properties.BooleanProperty` and
    defaults to `False`.
    '''

    def __init__(self, **kwargs):
        self.register_event_type('on_press')
        self.register_event_type('on_release')
        if 'min_state_time' not in kwargs:
            self.min_state_time = float(Config.get('graphics',
                                                   'min_state_time'))
        super(ButtonBehavior, self).__init__(**kwargs)
        self.__state_event = None
        self.__touch_time = None
        self.fbind('state', self.cancel_event)

    def _do_press(self):
        self.state = 'down'

    def _do_release(self, *args):
        self.state = 'normal'

    def cancel_event(self, *args):
        if self.__state_event:
            self.__state_event.cancel()
            self.__state_event = None

    def on_touch_down(self, touch):
        if super(ButtonBehavior, self).on_touch_down(touch):
            return True
        if touch.is_mouse_scrolling:
            return False
        if not self.collide_point(touch.x, touch.y):
            return False
        if self in touch.ud:
            return False
        touch.grab(self)
        touch.ud[self] = True
        self.last_touch = touch
        self.__touch_time = time()
        self._do_press()
        self.dispatch('on_press')
        return True

    def on_touch_move(self, touch):
        if touch.grab_current is self:
            return True
        if super(ButtonBehavior, self).on_touch_move(touch):
            return True
        return self in touch.ud

    def on_touch_up(self, touch):
        if touch.grab_current is not self:
            return super(ButtonBehavior, self).on_touch_up(touch)
        assert(self in touch.ud)
        touch.ungrab(self)
        self.last_touch = touch

        if (not self.always_release and
                not self.collide_point(*touch.pos)):
            self._do_release()
            return

        touchtime = time() - self.__touch_time
        if touchtime < self.min_state_time:
            self.__state_event = Clock.schedule_once(
                self._do_release, self.min_state_time - touchtime)
        else:
            self._do_release()
        self.dispatch('on_release')
        return True

    def on_press(self):
        pass

    def on_release(self):
        pass

    def trigger_action(self, duration=0.1):
        '''Trigger whatever action(s) have been bound to the button by calling
        both the on_press and on_release callbacks.

        This is similar to a quick button press without using any touch events,
        but note that like most kivy code, this is not guaranteed to be safe to
        call from external threads. If needed use
        :class:`Clock <kivy.clock.Clock>` to safely schedule this function and
        the resulting callbacks to be called from the main thread.

        Duration is the length of the press in seconds. Pass 0 if you want
        the action to happen instantly.

        .. versionadded:: 1.8.0
        '''
        self._do_press()
        self.dispatch('on_press')

        def trigger_release(dt):
            self._do_release()
            self.dispatch('on_release')
        if not duration:
            trigger_release(0)
        else:
            Clock.schedule_once(trigger_release, duration)



And replace all buttons with such checkboxes in the code of my app here:

import csv
import os
from kivy.core.text import LabelBase
from kivy.core.audio import SoundLoader
from kivy.uix.popup import Popup
from kivy.lang import Builder
from kivy.properties import StringProperty, ColorProperty
from kivy.animation import Animation
from kivy.app import App
from kivymd.app import MDApp
from kivymd.uix.label import MDLabel
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.textfield import MDTextField
from kivymd.uix.floatlayout import MDFloatLayout
from kivy.uix.behaviors import FocusBehavior
from kivy.uix.boxlayout import BoxLayout
from kivy.core.window import Window
from kivy.clock import Clock

# Define the resolution of the background image
background_width = 482  # Replace with your background image width
background_height = 1000  # Replace with your background image height

# Set the window size to match the background image resolution
Window.size = (background_width, background_height)

# Define custom colors
colors = {
    "Gray": {
        "200": "#969696",
        "400": "#20201D",
        "500": "#7F7F59",
        "700": "#525252",
        "A700": "#424242"
    },
    "Red": {
        "200": "#C25554",
        "400": "#B24242",
        "500": "#A42C2C",
        "700": "#8E2323",
        "A700": "#7B1C1C"
    },
    "Light": {
        "StatusBar": "#E0E0E0",
        "AppBar": "#98994D",
        "Background": "#98994D",
        "CardsDialogs": "#FFFFFF",
        "FlatButtonDown": "#CCCCCC",
    },
}

# Register custom fonts
LabelBase.register(name='font1', fn_regular='font1.ttf')
LabelBase.register(name='font2', fn_regular='font2.ttf')

KV = '''
BoxLayout:
    orientation: 'vertical'
    padding: [dp(0), dp(0)]
    spacing: dp(0)

    MDFloatLayout:
        canvas.before:
            Rectangle:
                source: 'background.png'
                size: dp(482), dp(1000)  # Use the actual image resolution
                pos: self.pos

        BoxLayout:
            orientation: 'vertical'
            size_hint: (0.7, 0.85)
            pos_hint: {'center_x': 0.5, 'center_y': 0.6}
            spacing: dp(3)

            Widget:
                size_hint_y: None
                height: dp(150)

            MDLabel:
                id: result_label
                halign: 'center'
                valign: 'middle'
                font_name: 'font2'
                font_size: '100sp'
                theme_text_color: 'Custom'
                text_color: 1, 0, 0, 1
                size_hint_y: 0.1
                height: dp(80)

            Widget:
                size_hint_y: None
                height: dp(10)

            CustomTextInput:
                id: input_field
                hint_text: 'Distance'
                input_filter: 'int'
                font_name: 'font1'
                font_size: '40sp'
                size_hint: (0.55, None)
                pos_hint: {'center_x': 0.5}
                height: dp(80)
                multiline: False
                mode: 'fill'
                max_text_length: 4
                fill_color_normal: app.theme_cls.colors['Gray']['500']
                fill_color_active: 0.7, 0.7, 0.3, 1
                text_color: 0, 0, 0, 1

            Widget:
                size_hint_y: None
                height: dp(85)

            CustomButton:
                id: enter_button
                text: 'Enter'
                font_size: '45sp'
                size_hint_y: None
                height: dp(66)
                size_hint_x: 0.7
                pos_hint: {'center_x': 0.5}
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_press: app.lookup()
                ripple_scale: 0

            Widget:
                size_hint_y: None
                height: dp(265)

        GridLayout:
            cols: 3
            rows: 4
            spacing: dp(20)
            size_hint: (0.49, 0.12)
            size: dp(252), dp(252)
            pos_hint: {'center_x': 0.5, 'center_y': 0.37}

            CustomButton:
                text: "7"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "8"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "9"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "4"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "5"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "6"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "1"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "2"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "3"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "CLR"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.clear_text_input()
                ripple_scale: 0

            CustomButton:
                text: "0"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.on_keypad_button_press(self.text)
                ripple_scale: 0

            CustomButton:
                text: "i"
                size_hint: None, None
                size: dp(84), dp(84)
                md_bg_color: app.theme_cls.colors['Gray']['500']
                on_release: app.show_info_popup()
                ripple_scale: 0
'''

class CustomTextInput(MDTextField, FocusBehavior):
    unfocused_bg_color = ColorProperty([0.5, 0.5, 0.35, 1])
    focused_bg_color = ColorProperty([0.6, 0.6, 0.35, 1])
    

    def on_touch_down(self, touch):
        if self.collide_point(*touch.pos):
            self.md_bg_color = self.focused_bg_color
            self.text = ''
        return super().on_touch_down(touch)

    def on_touch_up(self, touch):
        self.md_bg_color = self.unfocused_bg_color
        return super().on_touch_up(touch)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.md_bg_color = self.unfocused_bg_color
        self.text_color = [0, 0, 0, 1]

class CustomButton(MDRaisedButton):
    normal_color = ColorProperty([0.5, 0.5, 0.35, 1])
    pressed_color = ColorProperty([0.6, 0.6, 0.3, 1])

    def on_press(self):
        self.md_bg_color = self.pressed_color
        app = App.get_running_app()
        if app.beep_sound and self != app.root.ids.enter_button:  # Avoid beep for Enter button
            app.beep_sound.play()

    def on_release(self):
        self.md_bg_color = self.normal_color
        app = App.get_running_app()
        if app.release_sound:
            app.release_sound.play()

class LookupApp(MDApp):
    result_label_text = StringProperty('')

    def build(self):
        self.theme_cls.colors = colors
        self.theme_cls.primary_palette = "Gray"
        self.theme_cls.primary_hue = "400"
        self.theme_cls.accent_palette = "Red"
        self.theme_cls.theme_style = "Light"
        self.data = self.load_data('data.csv')
        self.click_sound = SoundLoader.load('click.wav')
        self.beep_sound = SoundLoader.load('beep.wav')
        self.release_sound = SoundLoader.load('release.wav')

        root = Builder.load_string(KV)
        self.pulse_animation(root.ids.result_label)
        self.enter_pressed = False
        return root

    def load_data(self, filename):
        data = {}
        if not os.path.exists(filename):
            self.show_error(f'File {filename} not found')
            return data

        with open(filename, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    distance = int(row['Distance'])
                    data[distance] = row['Setting']
                except ValueError:
                    self.show_error(f'Invalid data in file: {row}')
        return data

    def lookup(self):
        if self.click_sound:
            self.click_sound.play()

        try:
            distance = int(self.root.ids.input_field.text)
            if 0 <= distance <= 9999:
                setting = self.data.get(distance, 'Err_')
                self.root.ids.result_label.text = setting
                self.enter_pressed = True
            else:
                self.show_error('Please enter a number between 0 and 9999')
        except ValueError:
            self.show_error('Please enter a valid number')

    def show_error(self, message):
        popup = Popup(title='Error',
                      content=MDLabel(text=message, halign='center'),
                      size_hint=(None, None), size=(400, 200))
        popup.open()

    def pulse_animation(self, label):
        anim = Animation(text_color=[0.8, 0, 0, 0.9], duration=0.01) + Animation(text_color=[0.7, 0, 0, 0.9], duration=0.02)
        anim.repeat = True
        anim.start(label)

    def on_keypad_button_press(self, text):
        custom_text_input = self.root.ids.input_field
        if self.enter_pressed:
            custom_text_input.text = ''
            self.enter_pressed = False

        if len(custom_text_input.text) < 4:
            custom_text_input.text += text
            custom_text_input.focus = True
            custom_text_input.md_bg_color = custom_text_input.focused_bg_color

    def clear_text_input(self):
        self.root.ids.input_field.text = ''

    def show_info_popup(self):
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        content.add_widget(MDLabel(text="Link 1"))
        content.add_widget(MDLabel(text="Link 2"))
        content.add_widget(MDLabel(text="Link 3"))
        content.add_widget(MDLabel(text="Link 4"))
        content.add_widget(MDLabel(text="Link 5"))

        popup = Popup(title='Information', content=content, size_hint=(0.8, 0.6))
        popup.open()

if __name__ == '__main__':
    LookupApp().run()

## Collaborate with GPT Engineer

This is a [gptengineer.app](https://gptengineer.app)-synced repository 🌟🤖

Changes made via gptengineer.app will be committed to this repo.

If you clone this repo and push changes, you will have them reflected in the GPT Engineer UI.

## Tech stack

This project is built with React and Chakra UI.

- Vite
- React
- Chakra UI

## Setup

```sh
git clone https://github.com/GPT-Engineer-App/checkboxify.git
cd checkboxify
npm i
```

```sh
npm run dev
```

This will run a dev server with auto reloading and an instant preview.

## Requirements

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
