const R1 = 9100  //voltmeter_R1
const R2 = 3900  //voltmeter_R2
const R3 = 1 //ohmmeter
const R4 = 20000 //ammeter
const Vin = 3.3
const ADC_resolution = 1023

let mode: string[] = ["voltage", "current", "resistance"]
let chosen_mode = "none"
let hold_mode = false
const space = "                              "
const delay = 500

function menu() {
    OLED12864_I2C.clear()
    OLED12864_I2C.showString(3, 0,  " <MODE> ", 0)
    basic.pause(50)
    OLED12864_I2C.showString(6, 1, "V", 1)
    basic.pause(50)
    OLED12864_I2C.showString(6, 2, "mA", 1)
    basic.pause(50)
    OLED12864_I2C.showString(6, 3, "ohm", 1)
    basic.pause(50)
    show_arrow()
}

function clear_arrow() {
    for (let i = 1; i < 4; i++) {
        OLED12864_I2C.showString(2, i, "   ", 1)
    }
}

function show_arrow() {
    if (mode[0] == "voltage") {
        OLED12864_I2C.showString(2, 1, "->", 1)
    } else if (mode[0] == "current") {
        OLED12864_I2C.showString(2, 2, "->", 1)
    } else if (mode[0] == "resistance") {
        OLED12864_I2C.showString(2, 3, "->", 1)
    }
}

function voltage_mode() {
    pins.digitalWritePin(DigitalPin.P15, 1)
    basic.pause(300)
    while (chosen_mode != "none") {
        if (!hold_mode) {
            OLED12864_I2C.showString(0, 0, "    ", 1)
            let Vout = pins.analogReadPin(AnalogPin.P0) * Vin / ADC_resolution * (R2 + R1) / R2
            Vout = Math.roundWithPrecision(Vout, 2)
            if (Vout > 0.05) {
                OLED12864_I2C.showString(0, 1, "  " + Vout + "V" + space, 1)
            } else {
                OLED12864_I2C.showString(0, 1, "no connection" + space, 1)
            }
            basic.pause(delay)
        } else {
            OLED12864_I2C.showString(0, 0, "HOLD", 0)
            basic.pause(0) //weird bug, without running something after OLED12864_I2C.showString the program will frezze
        }
    }
    pins.digitalWritePin(DigitalPin.P15, 0)
}

function current_mode() {
    pins.digitalWritePin(DigitalPin.P14, 1)
    basic.pause(300)
    while (chosen_mode != "none") {
        if (!hold_mode) {
            OLED12864_I2C.showString(0, 0, "    ", 1)
            let Vout = pins.analogReadPin(AnalogPin.P1) / ADC_resolution * Vin
            let Current_mA = Math.roundWithPrecision(Vout / R3 * 1000, 2)
            if (Vout > 0.005) {
                OLED12864_I2C.showString(0, 1, "  " + Current_mA + "mA" + space, 1)
            } else {
                OLED12864_I2C.showString(0, 1, "no connection" + space, 1)
            }
            basic.pause(delay)
        } else {
            OLED12864_I2C.showString(0, 0, "HOLD", 0)
            basic.pause(0)
        }
    }
    pins.digitalWritePin(DigitalPin.P14, 0)
}

function resistance_mode() {
    pins.digitalWritePin(DigitalPin.P16, 1)
    basic.pause(200)
    while (chosen_mode != "none") {
        if (!hold_mode) {
            OLED12864_I2C.showString(0, 0, "    ", 1)
            let Vout = pins.analogReadPin(AnalogPin.P2) / ADC_resolution * Vin
            let Resistance = Math.roundWithPrecision(Vout * R4 / (Vin - Vout), 2)
            if (Vout < 3.15) {
                OLED12864_I2C.showString(0, 1, "  " + Resistance + "ohm" + space, 1)
            } else {
                OLED12864_I2C.showString(0, 1, "no connection" + space, 1)
            }
            basic.pause(delay)
        } else {
            OLED12864_I2C.showString(0, 0, "HOLD", 0)
            basic.pause(0)
        }

    }
    pins.digitalWritePin(DigitalPin.P16, 0)
}

input.onButtonPressed(Button.A, function () {
    if (chosen_mode == "none") {
        mode.push(mode[0])
        mode.shift()
        clear_arrow()
        show_arrow()
    } else {
        hold_mode = (hold_mode == false) ? true : false
    }
})

input.onButtonPressed(Button.AB, function () {
    chosen_mode = "none"
    hold_mode = false
    menu()
})

OLED12864_I2C.init(60)
menu()

pins.digitalWritePin(DigitalPin.P14, 0)
pins.digitalWritePin(DigitalPin.P15, 0)
pins.digitalWritePin(DigitalPin.P16, 0)

basic.forever(function () {
    if (input.buttonIsPressed(Button.B)) {
        chosen_mode = mode[0]
        OLED12864_I2C.clear()
        if (mode[0] == "voltage") {
            voltage_mode()
        } else if (mode[0] == "current") {
            current_mode()
        } else if (mode[0] == "resistance") {
            resistance_mode()
        }
    }
})