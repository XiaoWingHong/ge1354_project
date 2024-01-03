const R1 = 9100  //voltmeter_R1
const R2 = 3900  //voltmeter_R2
const Rs = 1 //Shunt resistance
const Ro = 1000 //ohmmeter_R1
const Vin = 3.3
const ADC_resolution = 1023

let mode: string[] = ["voltage", "current", "resistance"]
let chosen_mode = "none"
let hold_mode = false
const space = "                              "
const delay = 500

function display_menu() {
    OLED12864_I2C.clear()
    OLED12864_I2C.showString(3, 0, " <MODE> ", 0)
    basic.pause(80) //fade in animation
    OLED12864_I2C.showString(6, 1, "V", 1)
    basic.pause(80)
    OLED12864_I2C.showString(6, 2, "mA", 1)
    basic.pause(80)
    OLED12864_I2C.showString(6, 3, "ohm", 1)
    basic.pause(80)
    show_arrow()
}

function show_arrow() { //display the arrow according to the mode chosen
    if (mode[0] == "voltage") {
        OLED12864_I2C.showString(2, 1, "->", 1)
    } else if (mode[0] == "current") {
        OLED12864_I2C.showString(2, 2, "->", 1)
    } else if (mode[0] == "resistance") {
        OLED12864_I2C.showString(2, 3, "->", 1)
    }
}

function clear_arrow() {
    for (let i = 1; i < 4; i++) {
        OLED12864_I2C.showString(2, i, "   ", 1)
    }
}

function voltage_mode() { //display measured voltage
    pins.digitalWritePin(DigitalPin.P15, 1) //give a signal to the relay to close the circuit
    basic.pause(300) //wait for the relay to active
    while (chosen_mode != "none") {
        if (!hold_mode) {
            OLED12864_I2C.showString(0, 0, "    ", 1) //remove the "HOLD" text
            let Vout = pins.analogReadPin(AnalogPin.P0) * Vin / ADC_resolution * (R2 + R1) / R2 //By voltage divider rule
            Vout = Math.roundWithPrecision(Vout, 2)
            if (Vout > 0.05) { //check if there are input
                OLED12864_I2C.showString(0, 1, "  " + Vout + "V" + space, 1) //display the voltage; the "space" is to remove the remained text displayed last time
            } else {
                OLED12864_I2C.showString(0, 1, "no connection" + space, 1)
            }
            basic.pause(delay)
        } else { //hold mode
            OLED12864_I2C.showString(0, 0, "HOLD", 0)
            basic.pause(0) //weird bug, without running something after the "OLED12864_I2C.showString(0, 0, "HOLD", 0)"" ,the OLED will frezze
        }
    }
    pins.digitalWritePin(DigitalPin.P15, 0) //give a signal to the relay to open the circuit
}

function current_mode() { //display measured current
    pins.digitalWritePin(DigitalPin.P14, 1)
    basic.pause(300) //wait for the relay to active
    while (chosen_mode != "none") {
        if (!hold_mode) {
            OLED12864_I2C.showString(0, 0, "    ", 1)
            let Vout = pins.analogReadPin(AnalogPin.P1) / ADC_resolution * Vin
            let Current_mA = Math.roundWithPrecision(Vout / Rs * 1000, 2) //By Ohm's Law
            if (Vout > 0.005) { //check if there are input
                OLED12864_I2C.showString(0, 1, "  " + Current_mA + "mA" + space, 1) //display the current
            } else {
                OLED12864_I2C.showString(0, 1, "no connection" + space, 1)
            }
            basic.pause(delay)
        } else { //hold mode
            OLED12864_I2C.showString(0, 0, "HOLD", 0)
            basic.pause(0)
        }
    }
    pins.digitalWritePin(DigitalPin.P14, 0)
}

function resistance_mode() { //display measured resistance
    pins.digitalWritePin(DigitalPin.P16, 1) //give a 3.3V(Vin)
    basic.pause(200) //wait for the pin to give a 3.3V
    while (chosen_mode != "none") {
        if (!hold_mode) {
            OLED12864_I2C.showString(0, 0, "    ", 1)
            let Vout = pins.analogReadPin(AnalogPin.P2) / ADC_resolution * Vin
            let Resistance = Math.roundWithPrecision(Vout * Ro / (Vin - Vout), 2) //By voltage divider rule
            if (Vout < 3.15) { //check if there is a resistor connected
                OLED12864_I2C.showString(0, 1, "  " + Resistance + "ohm" + space, 1) //display the resistance
            } else {
                OLED12864_I2C.showString(0, 1, "no connection" + space, 1)
            }
            basic.pause(delay)
        } else { //hold mode
            OLED12864_I2C.showString(0, 0, "HOLD", 0)
            basic.pause(0)
        }

    }
    pins.digitalWritePin(DigitalPin.P16, 0) //give a 0V
}

input.onButtonPressed(Button.A, function () { //choose mode
    if (chosen_mode == "none") { //on the menu
        mode.push(mode[0])
        mode.shift() //loop the array, e.g. ["voltage", "current", "resistance"] -> ["current", "resistance", "voltage"]

        clear_arrow()
        show_arrow()
    } else { //in one of the mode
        hold_mode = (hold_mode == false) ? true : false //active or cancel the hold mode
    }
})

input.onButtonPressed(Button.AB, function () { //exit
    chosen_mode = "none"
    hold_mode = false
    display_menu()
})

//----------------------------------------------------------------------------------------------------------
//on start

OLED12864_I2C.init(60)
display_menu()

pins.digitalWritePin(DigitalPin.P14, 0) //initialize the signal pin of the relay
pins.digitalWritePin(DigitalPin.P15, 0) //initialize the signal pin of the relay
pins.digitalWritePin(DigitalPin.P16, 0) //initialize the Vin pin of the ohmmeter

basic.forever(function () {
    if (input.buttonIsPressed(Button.B)) { //enter
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
