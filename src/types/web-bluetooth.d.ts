export {};

declare global {
  interface BluetoothDevice {
    name?: string;
  }

  interface Bluetooth {
    requestDevice(options: {
      acceptAllDevices?: boolean;
      optionalServices?: string[];
    }): Promise<BluetoothDevice>;
  }

  interface Navigator {
    bluetooth?: Bluetooth;
  }
}
