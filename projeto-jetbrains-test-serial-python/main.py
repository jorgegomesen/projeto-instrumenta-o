# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.


# def print_hi(name):
# Use a breakpoint in the code line below to debug your script.
# print(f'Hi, {name}')  # Press Ctrl+F8 to toggle the breakpoint.


import serial

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    ser = serial.Serial('/dev/ttyACM0', 9600)

    # ser.write("Teste\n".encode())

    while True:
        bytes = ser.readline()
        print(bytes[0:len(bytes) - 1].decode())

    # while True:
    #     try:
    #         ser_bytes = ser.readline()
    #         decoded_bytes = float(ser_bytes[0:len(ser_bytes) - 2].decode("utf-8"))
    #         print(decoded_bytes)
    #     except:
    #         print("Keyboard Interrupt")
    #         break

    ser.close()
