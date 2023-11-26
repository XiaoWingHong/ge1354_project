def menu():
    OLED12864_I2C.clear()
    OLED12864_I2C.show_string(6, 0, "V", 1)
    OLED12864_I2C.show_string(6, 1, "mA", 1)
    OLED12864_I2C.show_string(6, 2, "ohm", 1)
    OLED12864_I2C.show_string(2, 0, "->", 1)
def clear_arrow():
    OLED12864_I2C.show_string(2, 0, "   ", 1)
    OLED12864_I2C.show_string(2, 1, "   ", 1)
    OLED12864_I2C.show_string(2, 2, "   ", 1)
def voltage_mode():
    global Vout
    while chosen_mode != "none":
        Vout = pins.analog_read_pin(AnalogPin.P0) * 10 / 1024 * 0.8 * (R2 + R1) / R1
        OLED12864_I2C.show_string(2,
            1,
            str(Math.round_with_precision(Vout, 2)) + "V" + space,
            1)
        basic.pause(delay)
def current_mode():
    global Vout
    while chosen_mode != "none":
        Vout = pins.analog_read_pin(AnalogPin.P1) / 1024 * 3.3
        OLED12864_I2C.show_string(2,
            1,
            str(Math.round_with_precision(Vout / R3 * 1000, 2)) + "mA" + space,
            1)
        basic.pause(delay)
def resistance_mode():
    global Vout
    pins.digital_write_pin(DigitalPin.P16, 1)
    basic.pause(100)
    while chosen_mode != "none":
        Vout = pins.analog_read_pin(AnalogPin.P2) / 1024 * 3.3
        if Vout < 3.1:
            OLED12864_I2C.show_string(2,
                1,
                str(Math.round_with_precision(Vout * R4 / (3.3 - Vout) * 1.45, 2)) + "ohm" + space,
                1)
        else:
            OLED12864_I2C.show_string(0, 1, " no resistor!" + space, 1)
        basic.pause(delay)
    pins.digital_write_pin(DigitalPin.P16, 0)

def on_button_pressed_a():
    if chosen_mode == "none":
        mode.append(mode[0])
        mode.shift()
        clear_arrow()
        if mode[0] == "voltage":
            OLED12864_I2C.show_string(2, 0, "->", 1)
        elif mode[0] == "current":
            OLED12864_I2C.show_string(2, 1, "->", 1)
        elif mode[0] == "resistance":
            OLED12864_I2C.show_string(2, 2, "->", 1)
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_button_pressed_b():
    global chosen_mode
    if chosen_mode == "none":
        chosen_mode = mode[0]
        OLED12864_I2C.clear()
        if mode[0] == "voltage":
            voltage_mode()
        elif mode[0] == "current":
            current_mode()
        elif mode[0] == "resistance":
            resistance_mode()
input.on_button_pressed(Button.B, on_button_pressed_b)

def on_button_pressed_ab():
    global chosen_mode, mode
    chosen_mode = "none"
    menu()
    mode = ["voltage", "current", "resistance"]
input.on_button_pressed(Button.AB, on_button_pressed_ab)

space = ""
delay = 0
mode: List[str] = []
chosen_mode = ""
Vout = 0
R4 = 0
R3 = 0
R2 = 0
R1 = 0
R1 = 9100
R2 = 3900
R3 = 25
R4 = 1000
Vout = 0
space = "                                         "
chosen_mode = "none"
mode = ["voltage", "current", "resistance"]
delay = 100
OLED12864_I2C.init(60)
menu()