import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

type BLECallback = (action: 'teamA' | 'teamB' | 'undo') => void;

const CLICK_TIMEOUT_MS = 400;
const LONG_PRESS_MS = 800;

interface BLEServiceState {
  isScanning: boolean;
  connectedDevice: string | null;
  clickCount: number;
  clickTimer: ReturnType<typeof setTimeout> | null;
  pressStartTime: number;
  callback: BLECallback | null;
}

const state: BLEServiceState = {
  isScanning: false,
  connectedDevice: null,
  clickCount: 0,
  clickTimer: null,
  pressStartTime: 0,
  callback: null,
};

let BleManager: any = null;
let bleManagerEmitter: NativeEventEmitter | null = null;

function getBleManager() {
  if (!BleManager) {
    try {
      BleManager = NativeModules.BleManager;
      if (BleManager) {
        bleManagerEmitter = new NativeEventEmitter(BleManager);
      }
    } catch {
      console.warn('BLE Manager not available on this device');
    }
  }
  return BleManager;
}

export function initBLE(callback: BLECallback): () => void {
  state.callback = callback;
  const manager = getBleManager();

  if (!manager || Platform.OS === 'web') {
    console.log('BLE not available, using simulation mode');
    return () => {};
  }

  manager.start({ showAlert: false })
    .then(() => {
      console.log('BLE Manager initialized');
      startScan();
    })
    .catch((err: Error) => {
      console.error('BLE init error:', err);
    });

  const discoverSub = bleManagerEmitter?.addListener(
    'BleManagerDiscoverPeripheral',
    handleDiscoverPeripheral
  );

  const disconnectSub = bleManagerEmitter?.addListener(
    'BleManagerDisconnectPeripheral',
    handleDisconnectedPeripheral
  );

  const updateSub = bleManagerEmitter?.addListener(
    'BleManagerDidUpdateValueForCharacteristic',
    handleUpdateValue
  );

  return () => {
    discoverSub?.remove();
    disconnectSub?.remove();
    updateSub?.remove();
    stopScan();
    state.callback = null;
  };
}

function startScan() {
  const manager = getBleManager();
  if (!manager || state.isScanning) return;

  state.isScanning = true;
  manager.scan([], 10, true)
    .then(() => console.log('BLE scan started'))
    .catch((err: Error) => console.error('BLE scan error:', err));
}

function stopScan() {
  const manager = getBleManager();
  if (!manager) return;

  manager.stopScan()
    .then(() => { state.isScanning = false; })
    .catch((err: Error) => console.error('BLE stop scan error:', err));
}

function handleDiscoverPeripheral(peripheral: any) {
  if (!peripheral?.name) return;

  const name = peripheral.name.toLowerCase();
  if (name.includes('button') || name.includes('padel') || name.includes('ble')) {
    stopScan();
    connectToDevice(peripheral.id);
  }
}

async function connectToDevice(peripheralId: string) {
  const manager = getBleManager();
  if (!manager) return;

  try {
    await manager.connect(peripheralId);
    state.connectedDevice = peripheralId;
    console.log('Connected to BLE device:', peripheralId);

    const info = await manager.retrieveServices(peripheralId);
    console.log('Device services:', info);

    // Start notification on the first available characteristic
    if (info.characteristics?.length > 0) {
      const char = info.characteristics[0];
      await manager.startNotification(peripheralId, char.service, char.characteristic);
    }
  } catch (err) {
    console.error('BLE connect error:', err);
    state.connectedDevice = null;
  }
}

function handleDisconnectedPeripheral() {
  state.connectedDevice = null;
  setTimeout(startScan, 2000);
}

function handleUpdateValue(data: { value: number[] }) {
  processButtonPress(data.value);
}

function processButtonPress(value: number[]) {
  if (!state.callback) return;

  const isLongPress = value.length > 0 && value[0] > LONG_PRESS_MS;

  if (isLongPress) {
    if (state.clickTimer) {
      clearTimeout(state.clickTimer);
      state.clickTimer = null;
    }
    state.clickCount = 0;
    state.callback('undo');
    return;
  }

  state.clickCount++;
  if (state.clickTimer) {
    clearTimeout(state.clickTimer);
  }

  state.clickTimer = setTimeout(() => {
    const count = state.clickCount;
    state.clickCount = 0;
    state.clickTimer = null;

    if (!state.callback) return;

    if (count === 1) {
      state.callback('teamA');
    } else if (count >= 2) {
      state.callback('teamB');
    }
  }, CLICK_TIMEOUT_MS);
}

export function simulateBLEPress(action: 'teamA' | 'teamB' | 'undo') {
  if (state.callback) {
    state.callback(action);
  }
}

export function isConnected(): boolean {
  return state.connectedDevice !== null;
}
